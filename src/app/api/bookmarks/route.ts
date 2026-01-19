import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionCookie, verifyMemberToken } from '@/lib/auth'
import type { Article, Topic, Media } from '@/payload-types'

/**
 * GET /api/bookmarks
 * Fetch bookmarks for the authenticated member
 * Optional query param: ?articleId=X to check if specific article is bookmarked
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

  if (articleId) {
    // Check if specific article is bookmarked
    const result = await payload.find({
      collection: 'bookmarks',
      where: {
        and: [
          { member: { equals: session.memberId } },
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
    where: { member: { equals: session.memberId } },
    limit: 1000,
    depth: 2, // Populate article and its relationships
    sort: '-createdAt', // Most recent first
  })

  // Transform bookmarks to include essential article data
  const bookmarks = result.docs.map((bookmark) => {
    const article = bookmark.article as Article
    const topic = article?.categorization?.topic as Topic | undefined
    const heroImage = article?.heroImage as Media | undefined

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
        readingTime: article?.readingTime || 5,
        publishedAt: article?.publishedAt || article?.createdAt || '',
      },
      createdAt: bookmark.createdAt,
    }
  })

  return NextResponse.json({ bookmarks })
}

/**
 * POST /api/bookmarks
 * Create a bookmark
 * Body: { articleId: string }
 */
export async function POST(request: NextRequest) {
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
        { member: { equals: session.memberId } },
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
      member: session.memberId,
      article: articleId,
    },
  })

  return NextResponse.json({ bookmark: { id: bookmark.id, article: articleId, createdAt: bookmark.createdAt } }, { status: 201 })
}

/**
 * DELETE /api/bookmarks
 * Remove a bookmark
 * Body: { articleId: string }
 */
export async function DELETE(request: NextRequest) {
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
        { member: { equals: session.memberId } },
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
