/**
 * Server-only read progress data fetching from Payload CMS.
 * This file should only be imported in server components.
 */
import 'server-only'

import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

// ============================================================================
// TYPES
// ============================================================================

export interface ArticleProgress {
  articleId: string
  progress: number
  completed: boolean
  firstVisitedAt: Date
  lastVisitedAt: Date
  timeSpent: number
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get progress records for a member, optionally filtered by article IDs
 */
export async function getMemberProgress(
  memberId: string,
  articleIds?: string[]
): Promise<ArticleProgress[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'read-progress',
    where:
      articleIds && articleIds.length > 0
        ? {
            and: [
              { member: { equals: memberId } },
              { article: { in: articleIds } },
            ],
          }
        : { member: { equals: memberId } },
    limit: 1000,
    depth: 0,
  })

  return result.docs.map((doc) => ({
    articleId: typeof doc.article === 'string' ? doc.article : doc.article.id,
    progress: doc.progress,
    completed: doc.completed || false,
    firstVisitedAt: new Date(doc.firstVisitedAt),
    lastVisitedAt: new Date(doc.lastVisitedAt),
    timeSpent: doc.timeSpent,
  }))
}

/**
 * Get progress for a single article
 */
export async function getArticleProgress(
  memberId: string,
  articleId: string
): Promise<ArticleProgress | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'read-progress',
    where: {
      member: { equals: memberId },
      article: { equals: articleId },
    },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) {
    return null
  }

  const doc = result.docs[0]
  return {
    articleId: typeof doc.article === 'string' ? doc.article : doc.article.id,
    progress: doc.progress,
    completed: doc.completed || false,
    firstVisitedAt: new Date(doc.firstVisitedAt),
    lastVisitedAt: new Date(doc.lastVisitedAt),
    timeSpent: doc.timeSpent,
  }
}

/**
 * Get a map of article IDs to progress data for a member
 * Wrapped with React.cache() for request deduplication
 */
export const getMemberProgressMap = cache(async function getMemberProgressMap(
  memberId: string,
  articleIds?: string[]
): Promise<Map<string, ArticleProgress>> {
  const progress = await getMemberProgress(memberId, articleIds)
  return new Map(progress.map((p) => [p.articleId, p]))
})
