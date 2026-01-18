import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionCookie, verifyMemberToken } from '@/lib/auth'

const COMPLETION_THRESHOLD = 85
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 50

interface WriteConflictError extends Error {
  code?: number
}

/**
 * GET /api/read-progress
 * Fetch progress for the authenticated member
 * Optional query param: ?articleId=X to get progress for a specific article
 */
export async function GET(request: NextRequest) {
  const token = await getSessionCookie()

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  // Check if member is still active
  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member || member.status === 'banned') {
      return NextResponse.json({ error: 'Member not found or banned' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Check for specific article ID
  const articleId = request.nextUrl.searchParams.get('articleId')

  const result = await payload.find({
    collection: 'read-progress',
    where: articleId
      ? {
          and: [
            { member: { equals: session.memberId } },
            { article: { equals: articleId } },
          ],
        }
      : { member: { equals: session.memberId } },
    limit: articleId ? 1 : 1000,
    depth: 0,
  })

  if (articleId) {
    // Return single progress record or null
    const progress = result.docs[0] || null
    return NextResponse.json({ progress })
  }

  // Return all progress records
  return NextResponse.json({ progress: result.docs })
}

/**
 * PATCH /api/read-progress
 * Upsert progress for an article
 * Body: { articleId, progress, timeSpent }
 */
export async function PATCH(request: NextRequest) {
  const token = await getSessionCookie()

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  // Check if member is still active
  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member || member.status === 'banned') {
      return NextResponse.json({ error: 'Member not found or banned' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Parse request body
  let body: { articleId?: string; progress?: number; timeSpent?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { articleId, progress, timeSpent } = body

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
  }

  if (progress === undefined || typeof progress !== 'number' || progress < 0 || progress > 100) {
    return NextResponse.json({ error: 'progress must be a number between 0 and 100' }, { status: 400 })
  }

  // Verify article exists
  try {
    await payload.findByID({
      collection: 'articles',
      id: articleId,
    })
  } catch {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const completed = progress >= COMPLETION_THRESHOLD

  // Upsert with retry logic for WriteConflict errors
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Find existing progress record
      const existingResult = await payload.find({
        collection: 'read-progress',
        where: {
          member: { equals: session.memberId },
          article: { equals: articleId },
        },
        limit: 1,
      })

      if (existingResult.docs.length > 0) {
        // Update existing record - use max progress
        const existing = existingResult.docs[0]
        const newProgress = Math.max(existing.progress, progress)
        const newTimeSpent = existing.timeSpent + (timeSpent || 0)
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

      // Create new record
      const created = await payload.create({
        collection: 'read-progress',
        data: {
          member: session.memberId,
          article: articleId,
          progress,
          timeSpent: timeSpent || 0,
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
        // Wait with exponential backoff before retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt))
        continue
      }
      throw error
    }
  }

  // Should never reach here, but TypeScript needs a return
  return NextResponse.json({ error: 'Failed to save progress after retries' }, { status: 500 })
}
