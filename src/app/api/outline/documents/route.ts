import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { listPublishedDocuments } from '@/lib/outline'

/**
 * GET /api/outline/documents
 * Lists published documents from Outline wiki.
 * Protected - requires authenticated admin user.
 */
export async function GET() {
  try {
    // Check admin authentication via Payload
    const payload = await getPayload({ config })
    const headersList = await headers()

    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await listPublishedDocuments()

    // Return simplified list for the selector
    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching Outline documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 },
    )
  }
}
