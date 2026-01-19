/**
 * Server-only reading history data fetching from Payload CMS.
 * This file should only be imported in server components.
 */
import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Article as PayloadArticle } from '@/payload-types'
import { type Article, transformPayloadArticle } from './articles'

// ============================================================================
// TYPES
// ============================================================================

export type HistoryStatusFilter = 'all' | 'completed' | 'in_progress'

export interface HistoryEntry {
  article: Article
  lastVisitedAt: Date
  progress: number
  completed: boolean
  timeSpent: number
}

export interface ReadingHistoryResult {
  entries: HistoryEntry[]
  hasMore: boolean
  total: number
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get reading history for a member
 * Sorted by lastVisitedAt DESC (most recently visited first)
 */
export async function getReadingHistory(
  memberId: string,
  options: { limit?: number; offset?: number; status?: HistoryStatusFilter } = {}
): Promise<ReadingHistoryResult> {
  const { limit = 20, offset = 0, status = 'all' } = options
  const payload = await getPayload({ config })

  // First get all series to build article -> series mapping
  const seriesResult = await payload.find({
    collection: 'series',
    limit: 100,
    depth: 0,
  })

  // Build a map of articleId -> series info
  const articleSeriesMap = new Map<string, { name: string; slug: string; order: number }>()
  for (const series of seriesResult.docs) {
    const articleIds = (series.articles || []).map((a) =>
      typeof a === 'string' ? a : a.id
    )
    articleIds.forEach((articleId, index) => {
      articleSeriesMap.set(articleId, {
        name: series.name,
        slug: series.slug,
        order: index + 1,
      })
    })
  }

  // Build where clause based on status filter
  type WhereClause = { member: { equals: string } } | { and: Array<{ member?: { equals: string }; completed?: { equals: boolean } }> }
  let whereClause: WhereClause = { member: { equals: memberId } }

  if (status === 'completed') {
    whereClause = {
      and: [
        { member: { equals: memberId } },
        { completed: { equals: true } },
      ],
    }
  } else if (status === 'in_progress') {
    whereClause = {
      and: [
        { member: { equals: memberId } },
        { completed: { equals: false } },
      ],
    }
  }

  // Query progress records with populated articles
  const result = await payload.find({
    collection: 'read-progress',
    where: whereClause,
    sort: '-lastVisitedAt',
    limit: limit + 1, // Fetch one extra to check if there's more
    page: Math.floor(offset / limit) + 1,
    depth: 2, // Populate article relationships
  })

  // Check if there are more results
  const hasMore = result.docs.length > limit
  const docs = hasMore ? result.docs.slice(0, limit) : result.docs

  // Transform to HistoryEntry format
  const entries: HistoryEntry[] = []

  for (const doc of docs) {
    const articleData = doc.article as PayloadArticle | string | null

    // Skip if article is not populated or null
    if (!articleData || typeof articleData === 'string') {
      continue
    }

    // Skip unpublished articles
    if (articleData._status !== 'published') {
      continue
    }

    const article = transformPayloadArticle(
      articleData,
      articleSeriesMap.get(articleData.id)
    )

    entries.push({
      article,
      lastVisitedAt: new Date(doc.lastVisitedAt),
      progress: doc.progress,
      completed: doc.completed || false,
      timeSpent: doc.timeSpent,
    })
  }

  return {
    entries,
    hasMore,
    total: result.totalDocs,
  }
}

/**
 * Get a map of article IDs to completion dates for a member's reading history
 */
export async function getReadingHistoryMap(
  memberId: string
): Promise<Map<string, Date>> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'read-progress',
    where: {
      and: [
        { member: { equals: memberId } },
        { completed: { equals: true } },
      ],
    },
    limit: 1000,
    depth: 0,
  })

  const map = new Map<string, Date>()
  for (const doc of result.docs) {
    const articleId = typeof doc.article === 'string' ? doc.article : doc.article.id
    map.set(articleId, new Date(doc.lastVisitedAt))
  }

  return map
}
