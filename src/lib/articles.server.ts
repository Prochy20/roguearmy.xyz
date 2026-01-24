/**
 * Server-only article data fetching from Payload CMS.
 * This file should only be imported in server components.
 */
import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  Article as PayloadArticle,
  Series as PayloadSeries,
} from '@/payload-types'

import {
  type Article,
  type FilterOptions,
  type SeriesNavigation,
  transformPayloadArticle,
  mapPayloadColorToTint,
} from './articles'

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get all published articles from Payload
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const payload = await getPayload({ config })

  // First get all series to build article -> series mapping
  const seriesResult = await payload.find({
    collection: 'series',
    limit: 100,
    depth: 0, // Don't populate articles, just IDs
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

  // Fetch published articles
  const result = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    depth: 2,
    sort: '-publishedAt',
    limit: 100,
  })

  return result.docs.map((article) =>
    transformPayloadArticle(article, articleSeriesMap.get(article.id))
  )
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'articles',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  if (result.docs.length === 0) {
    return null
  }

  const article = result.docs[0]

  // Check if article is in any series
  const seriesResult = await payload.find({
    collection: 'series',
    where: {
      articles: { contains: article.id },
    },
    depth: 0,
    limit: 1,
  })

  let seriesInfo: { name: string; slug: string; order: number } | undefined

  if (seriesResult.docs.length > 0) {
    const series = seriesResult.docs[0]
    const articleIds = (series.articles || []).map((a) =>
      typeof a === 'string' ? a : a.id
    )
    const orderIndex = articleIds.indexOf(article.id)
    if (orderIndex !== -1) {
      seriesInfo = {
        name: series.name,
        slug: series.slug,
        order: orderIndex + 1,
      }
    }
  }

  return transformPayloadArticle(article, seriesInfo)
}

/**
 * Get filter options (games, topics, content types, series) from Payload
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const payload = await getPayload({ config })

  const [gamesResult, topicsResult, contentTypesResult, seriesResult] = await Promise.all([
    payload.find({ collection: 'games', limit: 50, sort: 'name' }),
    payload.find({ collection: 'topics', limit: 50, sort: 'name' }),
    payload.find({ collection: 'content-types', limit: 50, sort: 'name' }),
    payload.find({ collection: 'series', limit: 100, sort: 'name', depth: 0 }),
  ])

  return {
    games: gamesResult.docs.map((game) => ({
      id: game.id,
      name: game.name,
      tint: mapPayloadColorToTint(game.color),
    })),
    topics: topicsResult.docs.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      tint: mapPayloadColorToTint(topic.color),
    })),
    contentTypes: contentTypesResult.docs.map((contentType) => ({
      id: contentType.id,
      slug: contentType.slug,
      name: contentType.name,
    })),
    series: seriesResult.docs.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      articleCount: (s.articles || []).length,
    })),
  }
}

/**
 * Get series navigation for an article
 */
export async function getSeriesNavigation(articleId: string): Promise<SeriesNavigation | null> {
  const payload = await getPayload({ config })

  // Find series containing this article
  const seriesResult = await payload.find({
    collection: 'series',
    where: {
      articles: { contains: articleId },
    },
    depth: 2, // Populate articles for prev/next cards
    limit: 1,
  })

  if (seriesResult.docs.length === 0) {
    return null
  }

  const series = seriesResult.docs[0] as PayloadSeries

  // Get populated articles from series
  const seriesArticles = (series.articles || [])
    .filter((a): a is PayloadArticle => typeof a !== 'string' && a !== null)

  if (seriesArticles.length < 2) {
    return null
  }

  const currentIndex = seriesArticles.findIndex((a) => a.id === articleId)
  if (currentIndex === -1) {
    return null
  }

  const previousArticle = currentIndex > 0 ? seriesArticles[currentIndex - 1] : null
  const nextArticle = currentIndex < seriesArticles.length - 1 ? seriesArticles[currentIndex + 1] : null

  return {
    seriesName: series.name,
    seriesSlug: series.slug,
    currentOrder: currentIndex + 1,
    totalParts: seriesArticles.length,
    articleIds: seriesArticles.map((a) => a.id),
    previous: previousArticle
      ? transformPayloadArticle(previousArticle, {
          name: series.name,
          slug: series.slug,
          order: currentIndex,
        })
      : null,
    next: nextArticle
      ? transformPayloadArticle(nextArticle, {
          name: series.name,
          slug: series.slug,
          order: currentIndex + 2,
        })
      : null,
  }
}

/**
 * Get article by slug with draft support for Live Preview.
 * Returns both transformed article and raw payload data.
 */
export async function getArticleBySlugWithDraft(
  slug: string,
  isDraft: boolean = false
): Promise<{ article: Article | null; rawArticle: PayloadArticle | null }> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'articles',
    where: isDraft
      ? { slug: { equals: slug } }
      : {
          slug: { equals: slug },
          _status: { equals: 'published' },
        },
    depth: 2,
    limit: 1,
    draft: isDraft,
  })

  if (result.docs.length === 0) {
    return { article: null, rawArticle: null }
  }

  const rawArticle = result.docs[0]

  // Check if article is in any series
  const seriesResult = await payload.find({
    collection: 'series',
    where: {
      articles: { contains: rawArticle.id },
    },
    depth: 0,
    limit: 1,
  })

  let seriesInfo: { name: string; slug: string; order: number } | undefined

  if (seriesResult.docs.length > 0) {
    const series = seriesResult.docs[0]
    const articleIds = (series.articles || []).map((a) =>
      typeof a === 'string' ? a : a.id
    )
    const orderIndex = articleIds.indexOf(rawArticle.id)
    if (orderIndex !== -1) {
      seriesInfo = {
        name: series.name,
        slug: series.slug,
        order: orderIndex + 1,
      }
    }
  }

  return {
    article: transformPayloadArticle(rawArticle, seriesInfo),
    rawArticle,
  }
}

/**
 * Get all article slugs (for generateStaticParams)
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 500,
    select: { slug: true },
  })

  return result.docs.map((article) => article.slug)
}

/**
 * Get featured articles for "You might also like" section.
 * Uses hybrid logic: curated first, then algorithmic fallback.
 */
export async function getFeaturedArticles(
  currentArticleId: string,
  topicId: string,
  gameIds: string[],
  curatedArticleIds?: string[],
  seriesArticleIds?: string[],
  limit: number = 3
): Promise<Article[]> {
  const payload = await getPayload({ config })

  // Build exclusion list: current article + series articles
  const excludeIds = new Set([currentArticleId, ...(seriesArticleIds || [])])

  // Filter out any excluded articles from curated list
  const validCuratedIds = (curatedArticleIds || []).filter((id) => !excludeIds.has(id))

  // If we have enough curated articles, just fetch those
  if (validCuratedIds.length >= limit) {
    const curatedResult = await payload.find({
      collection: 'articles',
      where: {
        id: { in: validCuratedIds.slice(0, limit) },
        _status: { equals: 'published' },
      },
      depth: 2,
    })

    // Preserve curator's order
    const curatedMap = new Map(curatedResult.docs.map((a) => [a.id, a]))
    const orderedCurated = validCuratedIds
      .slice(0, limit)
      .map((id) => curatedMap.get(id))
      .filter((a): a is PayloadArticle => a !== undefined)

    return orderedCurated.map((a) => transformPayloadArticle(a))
  }

  // Start with curated articles
  const articles: PayloadArticle[] = []
  const usedIds = new Set(excludeIds)

  // Fetch curated articles first (if any)
  if (validCuratedIds.length > 0) {
    const curatedResult = await payload.find({
      collection: 'articles',
      where: {
        id: { in: validCuratedIds },
        _status: { equals: 'published' },
      },
      depth: 2,
    })

    // Preserve curator's order
    const curatedMap = new Map(curatedResult.docs.map((a) => [a.id, a]))
    for (const id of validCuratedIds) {
      const article = curatedMap.get(id)
      if (article) {
        articles.push(article)
        usedIds.add(article.id)
      }
    }
  }

  // Calculate how many more we need
  const needed = limit - articles.length
  if (needed <= 0) {
    return articles.map((a) => transformPayloadArticle(a))
  }

  // Fetch same-topic articles
  const topicResult = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { id: { not_in: Array.from(usedIds) } },
        { 'categorization.topic': { equals: topicId } },
      ],
    },
    depth: 2,
    sort: '-publishedAt',
    limit: needed,
  })

  for (const article of topicResult.docs) {
    if (articles.length >= limit) break
    articles.push(article)
    usedIds.add(article.id)
  }

  // If still need more, fetch same-game articles
  const stillNeeded = limit - articles.length
  if (stillNeeded > 0 && gameIds.length > 0) {
    const gameResult = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { id: { not_in: Array.from(usedIds) } },
          { 'categorization.games': { in: gameIds } },
        ],
      },
      depth: 2,
      sort: '-publishedAt',
      limit: stillNeeded,
    })

    for (const article of gameResult.docs) {
      if (articles.length >= limit) break
      articles.push(article)
      usedIds.add(article.id)
    }
  }

  // Final fallback: fetch any recent articles if we still don't have enough
  const finalNeeded = limit - articles.length
  if (finalNeeded > 0) {
    const recentResult = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { id: { not_in: Array.from(usedIds) } },
        ],
      },
      depth: 2,
      sort: '-publishedAt',
      limit: finalNeeded,
    })

    for (const article of recentResult.docs) {
      if (articles.length >= limit) break
      articles.push(article)
    }
  }

  return articles.map((a) => transformPayloadArticle(a))
}
