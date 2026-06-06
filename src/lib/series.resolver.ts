/**
 * Server-only resolver for the article→series lookup used by article
 * fetchers. Replaces 4 near-identical inline blocks in `articles.server.ts`.
 *
 * Behavior matches the originals exactly: depth=0 (we only need name/slug
 * and the article ID ordering), limit=1, and the orderIndex !== -1 guard
 * so an article that's in a series but somehow missing from the IDs array
 * returns null instead of a misleading `order: 0`.
 */
import 'server-only'

import type { Payload } from 'payload'

export interface ResolvedSeriesInfo {
  name: string
  slug: string
  order: number
}

export async function resolveSeriesForArticle(
  payload: Payload,
  articleId: string,
): Promise<ResolvedSeriesInfo | null> {
  const seriesResult = await payload.find({
    collection: 'series',
    where: {
      articles: { contains: articleId },
    },
    depth: 0,
    limit: 1,
  })

  if (seriesResult.docs.length === 0) return null

  const series = seriesResult.docs[0]
  const articleIds = (series.articles ?? []).map((a) =>
    typeof a === 'string' ? a : a.id,
  )
  const orderIndex = articleIds.indexOf(articleId)
  if (orderIndex === -1) return null

  return {
    name: series.name,
    slug: series.slug,
    order: orderIndex + 1,
  }
}
