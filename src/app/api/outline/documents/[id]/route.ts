import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionCookie, verifyMemberToken } from '@/lib/auth'
import { getDocumentContent } from '@/lib/outline'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/outline/documents/[id]
 * Fetches document content from Outline wiki by ID.
 *
 * Access control:
 * - Public articles: No authentication required
 * - Members-only articles: Requires authenticated member
 * - Documents not linked to any published article: Requires authentication
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if this document belongs to a public article
    const articles = await payload.find({
      collection: 'articles',
      where: {
        'articleContent.outlineDocumentId': { equals: id },
        _status: { equals: 'published' },
      },
      limit: 1,
      depth: 0,
    })

    const article = articles.docs[0]
    const isPublicArticle = article?.visibility === 'public'

    // For members-only articles (or documents not linked to any article), require auth
    if (!isPublicArticle) {
      const token = await getSessionCookie()

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const session = await verifyMemberToken(token)

      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const member = await payload.findByID({
        collection: 'members',
        id: session.memberId,
      })

      if (!member || member.status === 'banned') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Fetch document content from Outline
    const document = await getDocumentContent(id)

    return NextResponse.json(
      {
        id: document.id,
        title: document.title,
        content: document.text,
        updatedAt: document.updatedAt,
      },
      {
        headers: {
          // Cache for 5 minutes, stale-while-revalidate for 1 hour
          // Use public cache for public articles, private for members-only
          'Cache-Control': isPublicArticle
            ? 'public, max-age=300, stale-while-revalidate=3600'
            : 'private, max-age=300, stale-while-revalidate=3600',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching Outline document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document' },
      { status: 500 },
    )
  }
}
