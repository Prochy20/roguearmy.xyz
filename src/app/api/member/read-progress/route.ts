import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMemberAuth } from '@/lib/auth/session.server'

const COMPLETION_THRESHOLD = 85
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 50

// UUID v4-ish shape — briefings come from Ashley as UUID strings. We don't
// hit Ashley to verify existence (that would add a network hop per PATCH for
// no real safety win — orphaned rows are cheap and never surface in any UI).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type TargetType = 'article' | 'briefing'
const VALID_TARGET_TYPES: ReadonlySet<TargetType> = new Set(['article', 'briefing'])

interface WriteConflictError extends Error {
  code?: number
}

// Canonical auth resolution: getMemberAuth runs the role-sync side effect so
// quarantined members hit 403 even on this route (which previously trusted
// the JWT and never re-checked status with Ashley).
async function resolveCaller(): Promise<
  { ok: true; memberId: string } | { ok: false; response: NextResponse }
> {
  const auth = await getMemberAuth()

  if (auth.status === 'banned') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Account quarantined' }, { status: 403 }),
    }
  }

  if (!auth.authenticated || !auth.memberId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Not authenticated', reason: auth.reason ?? 'not_authenticated' },
        { status: 401 },
      ),
    }
  }

  return { ok: true, memberId: auth.memberId }
}

function isValidTargetType(value: unknown): value is TargetType {
  return typeof value === 'string' && VALID_TARGET_TYPES.has(value as TargetType)
}

/**
 * GET /api/member/read-progress
 * Without query params: returns all records for the authenticated member.
 * With ?targetType=...&targetId=...: returns the matching record or null.
 */
export async function GET(request: NextRequest) {
  const caller = await resolveCaller()
  if (!caller.ok) return caller.response
  const { memberId } = caller

  const payload = await getPayload({ config })

  const targetType = request.nextUrl.searchParams.get('targetType')
  const targetId = request.nextUrl.searchParams.get('targetId')

  if (targetType !== null || targetId !== null) {
    // Both must be present for a single-record lookup.
    if (!isValidTargetType(targetType) || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId must both be provided' },
        { status: 400 },
      )
    }

    const result = await payload.find({
      collection: 'read-progress',
      where: {
        and: [
          { member: { equals: memberId } },
          { targetType: { equals: targetType } },
          { targetId: { equals: targetId } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return NextResponse.json({ progress: result.docs[0] || null })
  }

  const result = await payload.find({
    collection: 'read-progress',
    where: { member: { equals: memberId } },
    limit: 1000,
    depth: 0,
  })

  return NextResponse.json({ progress: result.docs })
}

/**
 * PATCH /api/member/read-progress
 * Upsert progress for an article or briefing.
 * Body: { targetType: 'article' | 'briefing', targetId: string, progress: number, timeSpent?: number }
 */
export async function PATCH(request: NextRequest) {
  const caller = await resolveCaller()
  if (!caller.ok) return caller.response
  const { memberId } = caller

  const payload = await getPayload({ config })

  let body: {
    targetType?: unknown
    targetId?: unknown
    progress?: unknown
    timeSpent?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { targetType, targetId, progress, timeSpent } = body

  if (!isValidTargetType(targetType)) {
    return NextResponse.json(
      { error: "targetType must be 'article' or 'briefing'" },
      { status: 400 },
    )
  }
  if (typeof targetId !== 'string' || targetId.length === 0) {
    return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
  }
  if (
    typeof progress !== 'number' ||
    !Number.isFinite(progress) ||
    progress < 0 ||
    progress > 100
  ) {
    return NextResponse.json(
      { error: 'progress must be a number between 0 and 100' },
      { status: 400 },
    )
  }
  if (timeSpent !== undefined && (typeof timeSpent !== 'number' || timeSpent < 0)) {
    return NextResponse.json(
      { error: 'timeSpent must be a non-negative number' },
      { status: 400 },
    )
  }

  // Verify the target exists (or has a plausible shape, for remote briefings).
  if (targetType === 'article') {
    try {
      await payload.findByID({ collection: 'articles', id: targetId })
    } catch {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
  } else {
    // Briefings live in Ashley — we don't round-trip on every PATCH. Validate
    // the id shape so junk doesn't pollute the collection.
    if (!UUID_RE.test(targetId)) {
      return NextResponse.json({ error: 'Invalid briefing id' }, { status: 400 })
    }
  }

  const now = new Date().toISOString()
  const completed = progress >= COMPLETION_THRESHOLD
  const addedTimeSpent = typeof timeSpent === 'number' ? timeSpent : 0

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const existingResult = await payload.find({
        collection: 'read-progress',
        where: {
          and: [
            { member: { equals: memberId } },
            { targetType: { equals: targetType } },
            { targetId: { equals: targetId } },
          ],
        },
        limit: 1,
      })

      if (existingResult.docs.length > 0) {
        const existing = existingResult.docs[0]
        const newProgress = Math.max(existing.progress, progress)
        const newTimeSpent = existing.timeSpent + addedTimeSpent
        const newCompleted = existing.completed || newProgress >= COMPLETION_THRESHOLD

        const updated = await payload.update({
          collection: 'read-progress',
          id: existing.id,
          data: {
            progress: newProgress,
            timeSpent: newTimeSpent,
            lastVisitedAt: now,
            completed: newCompleted,
          },
        })

        return NextResponse.json({ progress: updated })
      }

      const created = await payload.create({
        collection: 'read-progress',
        data: {
          member: memberId,
          targetType,
          targetId,
          // article relationship is admin-UX sugar; keep it populated on
          // article rows so the admin panel shows a clickable linked row.
          ...(targetType === 'article' ? { article: targetId } : {}),
          progress,
          timeSpent: addedTimeSpent,
          firstVisitedAt: now,
          lastVisitedAt: now,
          completed,
        },
      })

      return NextResponse.json({ progress: created }, { status: 201 })
    } catch (error) {
      const writeConflictError = error as WriteConflictError
      // MongoDB WriteConflict error code is 112
      if (writeConflictError.code === 112 && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt))
        continue
      }
      throw error
    }
  }

  return NextResponse.json(
    { error: 'Failed to save progress after retries' },
    { status: 500 },
  )
}
