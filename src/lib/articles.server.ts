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
 * Get filter options (games, topics, tags) from Payload
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const payload = await getPayload({ config })

  const [gamesResult, topicsResult, tagsResult] = await Promise.all([
    payload.find({ collection: 'games', limit: 50, sort: 'name' }),
    payload.find({ collection: 'topics', limit: 50, sort: 'name' }),
    payload.find({ collection: 'tags', limit: 50, sort: 'name' }),
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
    tags: tagsResult.docs.map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
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
