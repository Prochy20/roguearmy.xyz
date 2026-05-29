/**
 * Server-only read progress data fetching from Payload CMS.
 * This file should only be imported in server components.
 *
 * ReadProgress is polymorphic — same collection holds article and briefing
 * progress, discriminated by `targetType`. Article callers filter to
 * `targetType: 'article'`, briefing callers to `targetType: 'briefing'`. The
 * canonical id is `targetId` (mirrors article relationship for article rows,
 * holds the Ashley UUID for briefing rows).
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

export interface BriefingProgress {
  briefingId: string
  progress: number
  completed: boolean
  firstVisitedAt: Date
  lastVisitedAt: Date
  timeSpent: number
}

// ============================================================================
// ARTICLE PROGRESS
// ============================================================================

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
              { targetType: { equals: 'article' } },
              { targetId: { in: articleIds } },
            ],
          }
        : {
            and: [
              { member: { equals: memberId } },
              { targetType: { equals: 'article' } },
            ],
          },
    limit: 1000,
    depth: 0,
  })

  return result.docs.map((doc) => ({
    articleId: doc.targetId,
    progress: doc.progress,
    completed: doc.completed || false,
    firstVisitedAt: new Date(doc.firstVisitedAt),
    lastVisitedAt: new Date(doc.lastVisitedAt),
    timeSpent: doc.timeSpent,
  }))
}

export async function getArticleProgress(
  memberId: string,
  articleId: string
): Promise<ArticleProgress | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'read-progress',
    where: {
      and: [
        { member: { equals: memberId } },
        { targetType: { equals: 'article' } },
        { targetId: { equals: articleId } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) {
    return null
  }

  const doc = result.docs[0]
  return {
    articleId: doc.targetId,
    progress: doc.progress,
    completed: doc.completed || false,
    firstVisitedAt: new Date(doc.firstVisitedAt),
    lastVisitedAt: new Date(doc.lastVisitedAt),
    timeSpent: doc.timeSpent,
  }
}

/**
 * Map of article IDs → progress data for a member. Wrapped with React.cache
 * for request-scoped deduplication.
 */
export const getMemberProgressMap = cache(async function getMemberProgressMap(
  memberId: string,
  articleIds?: string[]
): Promise<Map<string, ArticleProgress>> {
  const progress = await getMemberProgress(memberId, articleIds)
  return new Map(progress.map((p) => [p.articleId, p]))
})

// ============================================================================
// BRIEFING PROGRESS
// ============================================================================

export async function getMemberBriefingProgress(
  memberId: string,
  briefingIds?: string[]
): Promise<BriefingProgress[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'read-progress',
    where:
      briefingIds && briefingIds.length > 0
        ? {
            and: [
              { member: { equals: memberId } },
              { targetType: { equals: 'briefing' } },
              { targetId: { in: briefingIds } },
            ],
          }
        : {
            and: [
              { member: { equals: memberId } },
              { targetType: { equals: 'briefing' } },
            ],
          },
    limit: 1000,
    depth: 0,
  })

  return result.docs.map((doc) => ({
    briefingId: doc.targetId,
    progress: doc.progress,
    completed: doc.completed || false,
    firstVisitedAt: new Date(doc.firstVisitedAt),
    lastVisitedAt: new Date(doc.lastVisitedAt),
    timeSpent: doc.timeSpent,
  }))
}

/**
 * Map of briefing IDs → progress data for a member. Mirrors
 * `getMemberProgressMap` for articles — wrap with React.cache for dedup.
 */
export const getMemberBriefingProgressMap = cache(
  async function getMemberBriefingProgressMap(
    memberId: string,
    briefingIds?: string[]
  ): Promise<Map<string, BriefingProgress>> {
    const progress = await getMemberBriefingProgress(memberId, briefingIds)
    return new Map(progress.map((p) => [p.briefingId, p]))
  },
)
