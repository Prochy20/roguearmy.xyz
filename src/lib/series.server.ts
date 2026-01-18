/**
 * Server-only series data fetching from Payload CMS.
 * This file should only be imported in server components.
 */
import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  Article as PayloadArticle,
  Series as PayloadSeries,
  Media as PayloadMedia,
} from '@/payload-types'
import { transformPayloadArticle, type Article, type ArticleImage } from './articles'

// ============================================================================
// TYPES
// ============================================================================

export interface SeriesWithArticles {
  id: string
  name: string
  slug: string
  description: string | null
  heroImage: ArticleImage | null
  articles: Article[]
}

export interface SeriesWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  heroImage: ArticleImage | null
  articleCount: number
}

export interface SeriesWithProgress extends SeriesWithCount {
  completedCount: number
  inProgressCount: number
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get all series with article counts
 */
export async function getAllSeries(): Promise<SeriesWithCount[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'series',
    limit: 100,
    depth: 2, // Populate articles to get hero image fallback
    sort: 'name',
  })

  return result.docs.map((series) => {
    const typedSeries = series as PayloadSeries
    const articles = (typedSeries.articles || []).filter(
      (a): a is PayloadArticle => typeof a !== 'string' && a !== null
    )

    // Get hero image - prefer series hero, fallback to first article
    let heroImage: ArticleImage | null = null

    if (typedSeries.heroImage && typeof typedSeries.heroImage !== 'string') {
      const media = typedSeries.heroImage as PayloadMedia
      heroImage = {
        url: media.url || '/placeholder-series.jpg',
        alt: media.alt || typedSeries.name,
      }
    } else if (articles.length > 0) {
      const firstArticle = articles[0]
      if (firstArticle.heroImage && typeof firstArticle.heroImage !== 'string') {
        const media = firstArticle.heroImage as PayloadMedia
        heroImage = {
          url: media.url || '/placeholder-series.jpg',
          alt: media.alt || typedSeries.name,
        }
      }
    }

    return {
      id: typedSeries.id,
      name: typedSeries.name,
      slug: typedSeries.slug,
      description: typedSeries.description || null,
      heroImage,
      articleCount: articles.length,
    }
  })
}

/**
 * Get a single series by slug with populated articles
 */
export async function getSeriesBySlug(slug: string): Promise<SeriesWithArticles | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'series',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  if (result.docs.length === 0) {
    return null
  }

  const series = result.docs[0] as PayloadSeries

  // Get populated articles
  const articles = (series.articles || [])
    .filter((a): a is PayloadArticle => typeof a !== 'string' && a !== null)
    .filter((a) => a._status === 'published')
    .map((article, index) =>
      transformPayloadArticle(article, {
        name: series.name,
        slug: series.slug,
        order: index + 1,
      })
    )

  // Get hero image
  let heroImage: ArticleImage | null = null

  if (series.heroImage && typeof series.heroImage !== 'string') {
    const media = series.heroImage as PayloadMedia
    heroImage = {
      url: media.url || '/placeholder-series.jpg',
      alt: media.alt || series.name,
    }
  } else if (articles.length > 0) {
    heroImage = articles[0].heroImage
  }

  return {
    id: series.id,
    name: series.name,
    slug: series.slug,
    description: series.description || null,
    heroImage,
    articles,
  }
}

/**
 * Get all series with progress for a member
 */
export async function getSeriesWithProgress(memberId: string): Promise<SeriesWithProgress[]> {
  const payload = await getPayload({ config })

  // Get all series with articles
  const seriesResult = await payload.find({
    collection: 'series',
    limit: 100,
    depth: 2,
    sort: 'name',
  })

  // Get member's read progress for all articles
  const progressResult = await payload.find({
    collection: 'read-progress',
    where: { member: { equals: memberId } },
    limit: 1000,
    depth: 0,
  })

  // Build a map of articleId -> progress
  const progressMap = new Map<string, { progress: number; completed: boolean }>()
  for (const progress of progressResult.docs) {
    const articleId = typeof progress.article === 'string' ? progress.article : progress.article.id
    progressMap.set(articleId, {
      progress: progress.progress,
      completed: progress.completed || false,
    })
  }

  return seriesResult.docs.map((series) => {
    const typedSeries = series as PayloadSeries
    const articles = (typedSeries.articles || []).filter(
      (a): a is PayloadArticle => typeof a !== 'string' && a !== null
    )

    // Get hero image
    let heroImage: ArticleImage | null = null

    if (typedSeries.heroImage && typeof typedSeries.heroImage !== 'string') {
      const media = typedSeries.heroImage as PayloadMedia
      heroImage = {
        url: media.url || '/placeholder-series.jpg',
        alt: media.alt || typedSeries.name,
      }
    } else if (articles.length > 0) {
      const firstArticle = articles[0]
      if (firstArticle.heroImage && typeof firstArticle.heroImage !== 'string') {
        const media = firstArticle.heroImage as PayloadMedia
        heroImage = {
          url: media.url || '/placeholder-series.jpg',
          alt: media.alt || typedSeries.name,
        }
      }
    }

    // Count completed and in-progress articles
    let completedCount = 0
    let inProgressCount = 0

    for (const article of articles) {
      const progress = progressMap.get(article.id)
      if (progress) {
        if (progress.completed) {
          completedCount++
        } else if (progress.progress > 0) {
          inProgressCount++
        }
      }
    }

    return {
      id: typedSeries.id,
      name: typedSeries.name,
      slug: typedSeries.slug,
      description: typedSeries.description || null,
      heroImage,
      articleCount: articles.length,
      completedCount,
      inProgressCount,
    }
  })
}

/**
 * Get all series slugs (for generateStaticParams)
 */
export async function getAllSeriesSlugs(): Promise<string[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'series',
    limit: 500,
    select: { slug: true },
  })

  return result.docs.map((series) => series.slug)
}
