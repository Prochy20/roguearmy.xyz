/**
 * Server-side utilities for interacting with Outline wiki API.
 * @see https://www.getoutline.com/developers
 */

const OUTLINE_API_URL = process.env.OUTLINE_API_URL || ''
const OUTLINE_API_TOKEN = process.env.OUTLINE_API_TOKEN || ''

export interface OutlineDocument {
  id: string
  title: string
  updatedAt: string
  publishedAt?: string
  collectionId?: string
}

export interface OutlineDocumentContent {
  id: string
  title: string
  text: string // Markdown content
  updatedAt: string
}

interface OutlineListResponse {
  data: OutlineDocument[]
  pagination?: {
    offset: number
    limit: number
  }
}

interface OutlineDocumentResponse {
  data: OutlineDocumentContent
}

/**
 * Fetches all published documents from Outline.
 * Used by the admin document selector.
 */
export async function listPublishedDocuments(): Promise<OutlineDocument[]> {
  if (!OUTLINE_API_URL || !OUTLINE_API_TOKEN) {
    throw new Error('Outline API configuration missing')
  }

  const response = await fetch(`${OUTLINE_API_URL}api/documents.list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OUTLINE_API_TOKEN}`,
    },
    body: JSON.stringify({
      statusFilter: ['published'],
      limit: 100,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Outline API error: ${response.status} - ${errorText}`)
  }

  const data: OutlineListResponse = await response.json()
  return data.data
}

/**
 * Fetches a single document's content by ID.
 * Used for frontend rendering.
 */
export async function getDocumentContent(id: string): Promise<OutlineDocumentContent> {
  if (!OUTLINE_API_URL || !OUTLINE_API_TOKEN) {
    throw new Error('Outline API configuration missing')
  }

  const response = await fetch(`${OUTLINE_API_URL}api/documents.info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OUTLINE_API_TOKEN}`,
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Outline API error: ${response.status} - ${errorText}`)
  }

  const data: OutlineDocumentResponse = await response.json()
  return data.data
}
