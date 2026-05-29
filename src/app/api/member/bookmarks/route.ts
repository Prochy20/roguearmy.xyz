import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMemberAuth } from '@/lib/auth/session.server'
import type { Article, Topic, Media, Game, ContentType } from '@/payload-types'

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

/**
 * GET /api/member/bookmarks
 * Fetch bookmarks for the authenticated member
 * Optional query param: ?articleId=X to check if specific article is bookmarked
 */
export async function GET(request: NextRequest) {
  const caller = await resolveCaller()
  if (!caller.ok) return caller.response
  const { memberId } = caller

  const payload = await getPayload({ config })

  // Check for specific article ID
  const articleId = request.nextUrl.searchParams.get('articleId')

  if (articleId) {
    // Check if specific article is bookmarked
    const result = await payload.find({
      collection: 'bookmarks',
      where: {
        and: [
          { member: { equals: memberId } },
          { article: { equals: articleId } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return NextResponse.json({
      bookmarked: result.docs.length > 0,
      bookmarkId: result.docs[0]?.id || null,
    })
  }

  // Return all bookmarks with populated article data
  const result = await payload.find({
    collection: 'bookmarks',
    where: { member: { equals: memberId } },
    limit: 1000,
    depth: 2, // Populate article and its relationships
    sort: '-createdAt', // Most recent first
  })

  // Transform bookmarks to include essential article data
  const bookmarks = result.docs.map((bookmark) => {
    const article = bookmark.article as Article
    const topic = article?.categorization?.topic as Topic | undefined
    const heroImage = article?.heroImage as Media | undefined
    const contentType = article?.categorization?.contentType as ContentType | undefined

    // Get games array from categorization
    const games = (article?.categorization?.games || [])
      .filter((g): g is Game => typeof g !== 'string' && g !== null)
      .map((game) => ({
        id: game.id,
        name: game.name,
        color: game.color,
      }))

    return {
      id: bookmark.id,
      article: {
        id: article?.id || '',
        slug: article?.slug || '',
        title: article?.title || '',
        perex: article?.perex || '',
        heroImage: heroImage
          ? { url: heroImage.url || '', alt: heroImage.alt || article?.title || '' }
          : null,
        topic: topic
          ? { id: topic.id, name: topic.name, slug: topic.slug, color: topic.color }
          : null,
        games,
        contentType: contentType
          ? { id: contentType.id, slug: contentType.slug, name: contentType.name }
          : null,
        readingTime: article?.readingTime || 5,
        publishedAt: article?.publishedAt || article?.createdAt || '',
      },
      createdAt: bookmark.createdAt,
    }
  })

  return NextResponse.json({ bookmarks })
}

/**
 * POST /api/member/bookmarks
 * Create a bookmark
 * Body: { articleId: string }
 */
export async function POST(request: NextRequest) {
  const caller = await resolveCaller()
  if (!caller.ok) return caller.response
  const { memberId } = caller

  const payload = await getPayload({ config })

  // Parse request body
  let body: { articleId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { articleId } = body

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
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

  // Check if already bookmarked
  const existing = await payload.find({
    collection: 'bookmarks',
    where: {
      and: [
        { member: { equals: memberId } },
        { article: { equals: articleId } },
      ],
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return NextResponse.json(
      { error: 'Article already bookmarked', bookmarkId: existing.docs[0].id },
      { status: 409 }
    )
  }

  // Create bookmark
  const bookmark = await payload.create({
    collection: 'bookmarks',
    data: {
      member: memberId,
      article: articleId,
    },
  })

  return NextResponse.json({ bookmark: { id: bookmark.id, article: articleId, createdAt: bookmark.createdAt } }, { status: 201 })
}

/**
 * DELETE /api/member/bookmarks
 * Remove a bookmark
 * Body: { articleId: string }
 */
export async function DELETE(request: NextRequest) {
  const caller = await resolveCaller()
  if (!caller.ok) return caller.response
  const { memberId } = caller

  const payload = await getPayload({ config })

  // Parse request body
  let body: { articleId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { articleId } = body

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
  }

  // Find and delete bookmark
  const existing = await payload.find({
    collection: 'bookmarks',
    where: {
      and: [
        { member: { equals: memberId } },
        { article: { equals: articleId } },
      ],
    },
    limit: 1,
  })

  if (existing.docs.length === 0) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
  }

  await payload.delete({
    collection: 'bookmarks',
    id: existing.docs[0].id,
  })

  return NextResponse.json({ success: true })
}
