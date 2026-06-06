import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasBriefingsAccess, type SymbolicRole } from '@/lib/auth/badges'
import { fetchBriefingById } from '@/lib/division2/briefing.server'
import { getMemberBookmarks } from '@/lib/bookmarks.server'
import type { BookmarkTargetType } from '@/lib/bookmarks'
import type { Bookmark } from '@/payload-types'

interface ResolvedCaller {
  memberId: string
  symbolicRoles: SymbolicRole[]
}

// Canonical auth resolution: getMemberAuth runs the role-sync side effect so
// quarantined members hit 403 even on this route (which previously trusted
// the JWT and never re-checked status with Ashley).
async function resolveCaller(): Promise<
  { ok: true; caller: ResolvedCaller } | { ok: false; response: NextResponse }
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

  return {
    ok: true,
    caller: { memberId: auth.memberId, symbolicRoles: auth.symbolicRoles },
  }
}

interface TargetParams {
  targetType: BookmarkTargetType
  targetId: string
}

function parseTargetParams(body: unknown): TargetParams | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { targetType, targetId } = body as Record<string, unknown>
  if (targetType !== 'article' && targetType !== 'briefing') {
    return NextResponse.json(
      { error: 'targetType must be "article" or "briefing"' },
      { status: 400 },
    )
  }
  if (typeof targetId !== 'string' || targetId.length === 0) {
    return NextResponse.json(
      { error: 'targetId is required and must be a non-empty string' },
      { status: 400 },
    )
  }
  return { targetType, targetId }
}

/**
 * GET /api/member/bookmarks
 * Returns the discriminated union shape consumed by BookmarksProvider and
 * /me/bookmarks. Optional ?targetType= narrows the query.
 */
export async function GET(request: NextRequest) {
  const auth = await resolveCaller()
  if (!auth.ok) return auth.response
  const { memberId, symbolicRoles } = auth.caller

  const requestedType = request.nextUrl.searchParams.get('targetType')
  const targetTypeFilter =
    requestedType === 'article' || requestedType === 'briefing' ? requestedType : null

  const bookmarks = await getMemberBookmarks({
    memberId,
    symbolicRoles,
    targetTypeFilter,
  })

  return NextResponse.json({ bookmarks })
}

/**
 * POST /api/member/bookmarks
 * Body: { targetType, targetId }. Verifies the target exists (Payload for
 * articles, Ashley for briefings) and gates daily briefings on booster role.
 */
export async function POST(request: NextRequest) {
  const auth = await resolveCaller()
  if (!auth.ok) return auth.response
  const { memberId, symbolicRoles } = auth.caller

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = parseTargetParams(rawBody)
  if (parsed instanceof NextResponse) return parsed
  const { targetType, targetId } = parsed

  const payload = await getPayload({ config })

  if (targetType === 'article') {
    try {
      await payload.findByID({ collection: 'articles', id: targetId })
    } catch {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
  } else {
    const result = await fetchBriefingById(targetId)
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Briefing service unavailable', code: result.error.code },
        { status: 503 },
      )
    }
    if (!result.data) {
      return NextResponse.json({ error: 'Briefing not found' }, { status: 404 })
    }
    if (result.data.frequency === 'daily' && !hasBriefingsAccess(symbolicRoles)) {
      return NextResponse.json(
        { error: 'Booster access required' },
        { status: 403 },
      )
    }
  }

  const existing = await payload.find({
    collection: 'bookmarks',
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

  if (existing.docs.length > 0) {
    return NextResponse.json(
      { error: 'Already bookmarked', bookmarkId: existing.docs[0].id },
      { status: 409 },
    )
  }

  const data: Partial<Bookmark> = {
    member: memberId,
    targetType,
    targetId,
    ...(targetType === 'article' ? { article: targetId } : {}),
  }

  let bookmark
  try {
    bookmark = await payload.create({ collection: 'bookmarks', data: data as Bookmark })
  } catch (error) {
    // Concurrent POSTs can both pass the existence check above and race into
    // create — the second one violates the unique [member, targetType,
    // targetId] index. Surface that as 409 instead of leaking the raw error.
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 })
    }
    throw error
  }

  return NextResponse.json(
    {
      bookmark: {
        id: bookmark.id,
        targetType: bookmark.targetType,
        targetId: bookmark.targetId,
        createdAt: bookmark.createdAt,
      },
    },
    { status: 201 },
  )
}

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: number; name?: string; message?: string }
  if (e.code === 11000) return true
  if (e.name === 'MongoServerError' && e.message?.includes('E11000')) return true
  return false
}

/**
 * DELETE /api/member/bookmarks
 * Body: { targetType, targetId }.
 */
export async function DELETE(request: NextRequest) {
  const auth = await resolveCaller()
  if (!auth.ok) return auth.response
  const { memberId } = auth.caller

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = parseTargetParams(rawBody)
  if (parsed instanceof NextResponse) return parsed
  const { targetType, targetId } = parsed

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'bookmarks',
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

  if (existing.docs.length === 0) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
  }

  await payload.delete({ collection: 'bookmarks', id: existing.docs[0].id })

  return NextResponse.json({ success: true })
}
