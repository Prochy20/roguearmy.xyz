/**
 * Article types and utilities for the members articles section.
 * This file is client-safe - no Payload runtime imports.
 *
 * For data fetching, use articles.server.ts
 */

import type {
  Article as PayloadArticle,
  Topic as PayloadTopic,
  Game as PayloadGame,
  ContentType as PayloadContentType,
  Media as PayloadMedia,
} from '@/payload-types'

// ============================================================================
// TYPES
// ============================================================================

/** Tint colors used for styling across the frontend */
export type TintColor = 'orange' | 'red' | 'cyan' | 'green' | 'magenta' | 'blue' | 'yellow' | 'teal' | 'purple' | 'pink'

/** Article visibility options */
export type ArticleVisibility = 'public' | 'members_only'

/** Read status filter options */
export type ReadStatusFilter = 'unread' | 'in_progress' | 'completed' | null

/** Reading time filter options */
export type ReadingTimeFilter = 'quick' | 'medium' | 'long'

/** Reading time range definitions */
export const READING_TIME_RANGES = {
  quick: { min: 0, max: 3, label: 'Quick Read', description: '< 3 min' },
  medium: { min: 3, max: 10, label: 'Medium', description: '3-10 min' },
  long: { min: 10, max: Infinity, label: 'Long Read', description: '> 10 min' },
} as const

/** Series option for filter dropdown */
export interface SeriesOption {
  id: string
  slug: string
  name: string
  articleCount: number
}

export interface ArticleTopic {
  id: string
  slug: string
  name: string
  tint: TintColor
}

export interface ArticleGame {
  id: string
  name: string
  tint: TintColor
}

export interface ArticleContentType {
  id: string
  slug: string
  name: string
}

export interface ArticleImage {
  url: string
  alt: string
}

export interface ArticleSeries {
  name: string
  slug: string
  order: number
}

/** Content source - either Payload richText or wiki document */
export interface ArticleContentSource {
  type: 'payload' | 'wiki'
  /** Lexical richText content (when type is 'payload') */
  content?: PayloadArticle['articleContent']
  /** Outline document ID (when type is 'wiki') */
  outlineDocumentId?: string
}

export interface Article {
  id: string
  slug: string
  title: string
  perex: string
  heroImage: ArticleImage
  topic: ArticleTopic
  games: ArticleGame[]
  contentType: ArticleContentType
  publishedAt: Date
  readingTime: number
  series?: ArticleSeries
  contentSource: ArticleContentSource
  visibility: ArticleVisibility
}

export interface FilterState {
  readStatus: ReadStatusFilter
  readingTime: ReadingTimeFilter[]
  series: string | null
  games: string[]
  topics: string[]
  contentTypes: string[]
  search: string
}

export interface FilterOptions {
  games: ArticleGame[]
  topics: ArticleTopic[]
  contentTypes: ArticleContentType[]
  series: SeriesOption[]
}

export interface SeriesNavigation {
  seriesName: string
  seriesSlug: string
  currentOrder: number
  totalParts: number
  articleIds: string[] // All article IDs in series order (for progress fetching)
  previous: Article | null
  next: Article | null
}

// ============================================================================
// COLOR MAPPING
// ============================================================================

/**
 * Map Payload color values to frontend tint colors
 */
export function mapPayloadColorToTint(
  color: PayloadTopic['color'] | PayloadGame['color']
): TintColor {
  const colorMap: Record<string, TintColor> = {
    orange: 'orange',
    blue: 'cyan',
    yellow: 'orange',
    teal: 'cyan',
    green: 'green',
    purple: 'magenta',
    red: 'red',
    pink: 'magenta',
  }
  return colorMap[color] || 'green'
}

/**
 * Get tint classes for styling based on color
 */
export function getTintClasses(tint: TintColor) {
  const tintMap = {
    orange: {
      border: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-500/60',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      textMuted: 'text-orange-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    },
    red: {
      border: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/60',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      textMuted: 'text-red-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    },
    cyan: {
      border: 'border-rga-cyan/30',
      hoverBorder: 'hover:border-rga-cyan/60',
      bg: 'bg-rga-cyan/10',
      text: 'text-rga-cyan',
      textMuted: 'text-rga-cyan/40',
      glow: 'hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]',
    },
    green: {
      border: 'border-rga-green/30',
      hoverBorder: 'hover:border-rga-green/60',
      bg: 'bg-rga-green/10',
      text: 'text-rga-green',
      textMuted: 'text-rga-green/40',
      glow: 'hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]',
    },
    magenta: {
      border: 'border-rga-magenta/30',
      hoverBorder: 'hover:border-rga-magenta/60',
      bg: 'bg-rga-magenta/10',
      text: 'text-rga-magenta',
      textMuted: 'text-rga-magenta/40',
      glow: 'hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]',
    },
    blue: {
      border: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500/60',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      textMuted: 'text-blue-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    },
    yellow: {
      border: 'border-yellow-500/30',
      hoverBorder: 'hover:border-yellow-500/60',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      textMuted: 'text-yellow-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    },
    teal: {
      border: 'border-teal-500/30',
      hoverBorder: 'hover:border-teal-500/60',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      textMuted: 'text-teal-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]',
    },
    purple: {
      border: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/60',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      textMuted: 'text-purple-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    },
    pink: {
      border: 'border-pink-500/30',
      hoverBorder: 'hover:border-pink-500/60',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400',
      textMuted: 'text-pink-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    },
  }
  return tintMap[tint]
}

// Legacy alias for backwards compatibility
export const getCategoryTintClasses = getTintClasses

// ============================================================================
// URL HELPERS
// ============================================================================

/**
 * Generate the URL for an article based on its topic and slug
 */
export function getArticleUrl(article: { slug: string; topic: { slug: string } }): string {
  return `/blog/${article.topic.slug}/${article.slug}`
}

/**
 * Generate the URL for a series
 */
export function getSeriesUrl(series: { slug: string }): string {
  return `/blog/series/${series.slug}`
}

// ============================================================================
// TYPE TRANSFORMERS
// ============================================================================

/**
 * Transform Payload article to frontend Article type
 */
export function transformPayloadArticle(
  payloadArticle: PayloadArticle,
  seriesInfo?: { name: string; slug: string; order: number }
): Article {
  // Get topic - handle both populated and ID-only cases
  const topic = payloadArticle.categorization.topic as PayloadTopic
  const topicTint = topic?.color ? mapPayloadColorToTint(topic.color) : 'green'

  // Get games array
  const games = (payloadArticle.categorization.games || [])
    .filter((g): g is PayloadGame => typeof g !== 'string' && g !== null)
    .map((game) => ({
      id: game.id,
      name: game.name,
      tint: mapPayloadColorToTint(game.color),
    }))

  // Get contentType - handle both populated and ID-only cases
  const contentTypeData = payloadArticle.categorization.contentType as PayloadContentType | null
  const contentType: ArticleContentType = {
    id: contentTypeData?.id || '',
    slug: contentTypeData?.slug || '',
    name: contentTypeData?.name || 'Article',
  }

  // Get hero image
  const heroMedia = payloadArticle.heroImage as PayloadMedia | null
  const heroImage: ArticleImage = {
    url: heroMedia?.url || '/placeholder-article.svg',
    alt: heroMedia?.alt || payloadArticle.title,
  }

  // Get content source
  const contentSource: ArticleContentSource = {
    type: payloadArticle.articleContent?.contentSource || 'payload',
    content: payloadArticle.articleContent,
    outlineDocumentId: payloadArticle.articleContent?.outlineDocumentId || undefined,
  }

  return {
    id: payloadArticle.id,
    slug: payloadArticle.slug,
    title: payloadArticle.title,
    perex: payloadArticle.perex,
    heroImage,
    topic: {
      id: topic?.id || '',
      slug: topic?.slug || '',
      name: topic?.name || 'Uncategorized',
      tint: topicTint,
    },
    games,
    contentType,
    publishedAt: payloadArticle.publishedAt
      ? new Date(payloadArticle.publishedAt)
      : new Date(payloadArticle.createdAt),
    readingTime: payloadArticle.readingTime || 5,
    series: seriesInfo,
    contentSource,
    visibility: (payloadArticle.visibility as ArticleVisibility) || 'members_only',
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Progress data structure (mirrors progress.server.ts for client use) */
export interface ArticleProgressData {
  articleId: string
  progress: number
  completed: boolean
}

/**
 * Determine read status from progress data
 */
export function getReadStatus(progress?: ArticleProgressData): ReadStatusFilter {
  if (!progress || progress.progress === 0) return 'unread'
  if (progress.completed || progress.progress >= 85) return 'completed'
  return 'in_progress'
}

/**
 * Filter articles by all filter criteria
 */
export function filterArticles(
  articles: Article[],
  filters: FilterState,
  progressMap?: Record<string, ArticleProgressData>
): Article[] {
  return articles.filter((article) => {
    // 1. Read Status filter (uses progressMap)
    if (filters.readStatus && progressMap) {
      const progress = progressMap[article.id]
      const status = getReadStatus(progress)
      if (status !== filters.readStatus) return false
    }

    // 2. Reading Time filter
    if (filters.readingTime.length > 0) {
      const matches = filters.readingTime.some((range) => {
        const { min, max } = READING_TIME_RANGES[range]
        return article.readingTime >= min && article.readingTime < max
      })
      if (!matches) return false
    }

    // 3. Series filter
    if (filters.series) {
      if (!article.series || article.series.slug !== filters.series) return false
    }

    // 4. Game filter
    if (filters.games.length > 0) {
      const articleGameIds = article.games.map((g) => g.id)
      if (!filters.games.some((gameId) => articleGameIds.includes(gameId))) {
        return false
      }
    }

    // 5. Topic filter
    if (filters.topics.length > 0) {
      if (!filters.topics.includes(article.topic.id)) {
        return false
      }
    }

    // 6. Content type filter
    if (filters.contentTypes.length > 0) {
      if (!filters.contentTypes.includes(article.contentType.id)) {
        return false
      }
    }

    // 7. Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = article.title.toLowerCase().includes(searchLower)
      const matchesPerex = article.perex.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesPerex) {
        return false
      }
    }

    return true
  })
}

/**
 * Format date for display
 */
export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
