/**
 * Series types and utilities for the members series section.
 * This file is client-safe - no Payload runtime imports.
 *
 * For data fetching, use series.server.ts
 */

import type { TintColor, ArticleImage } from './articles'

// ============================================================================
// TYPES
// ============================================================================

/** Completion status filter for series */
export type SeriesCompletionStatus = 'all' | 'not_started' | 'in_progress' | 'completed'

/** Size category for series (by article count) */
export type SeriesSize = 'small' | 'medium' | 'large'

/** Size range definitions */
export const SERIES_SIZE_RANGES = {
  small: { min: 1, max: 3, label: 'Small', description: '1-3' },
  medium: { min: 4, max: 7, label: 'Medium', description: '4-7' },
  large: { min: 8, max: Infinity, label: 'Large', description: '8+' },
} as const

/** Filter state for series page */
export interface SeriesFilterState {
  completionStatus: SeriesCompletionStatus
  sizes: SeriesSize[]
  games: string[]
  topics: string[]
}

/** Options available for filtering */
export interface SeriesFilterOptions {
  games: Array<{ id: string; name: string; tint: TintColor }>
  topics: Array<{ id: string; name: string; tint: TintColor }>
}

/** Series with progress tracking and filter metadata */
export interface SeriesWithFilterData {
  id: string
  name: string
  slug: string
  description: string | null
  heroImage: ArticleImage | null
  articleCount: number
  completedCount: number
  inProgressCount: number
  gameIds: string[]
  topicIds: string[]
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

/**
 * Get the completion status of a series based on progress
 */
export function getSeriesCompletionStatus(
  series: Pick<SeriesWithFilterData, 'articleCount' | 'completedCount' | 'inProgressCount'>
): Exclude<SeriesCompletionStatus, 'all'> {
  if (series.completedCount === series.articleCount && series.articleCount > 0) {
    return 'completed'
  }
  if (series.completedCount > 0 || series.inProgressCount > 0) {
    return 'in_progress'
  }
  return 'not_started'
}

/**
 * Get the size category of a series based on article count
 */
export function getSeriesSize(articleCount: number): SeriesSize {
  if (articleCount <= SERIES_SIZE_RANGES.small.max) {
    return 'small'
  }
  if (articleCount <= SERIES_SIZE_RANGES.medium.max) {
    return 'medium'
  }
  return 'large'
}

/**
 * Filter series by all filter criteria
 */
export function filterSeries(
  series: SeriesWithFilterData[],
  filters: SeriesFilterState
): SeriesWithFilterData[] {
  return series.filter((item) => {
    // 1. Completion Status filter
    if (filters.completionStatus !== 'all') {
      const status = getSeriesCompletionStatus(item)
      if (status !== filters.completionStatus) return false
    }

    // 2. Size filter
    if (filters.sizes.length > 0) {
      const size = getSeriesSize(item.articleCount)
      if (!filters.sizes.includes(size)) return false
    }

    // 3. Games filter - series must have at least one matching game
    if (filters.games.length > 0) {
      const hasMatchingGame = filters.games.some((gameId) => item.gameIds.includes(gameId))
      if (!hasMatchingGame) return false
    }

    // 4. Topics filter - series must have at least one matching topic
    if (filters.topics.length > 0) {
      const hasMatchingTopic = filters.topics.some((topicId) => item.topicIds.includes(topicId))
      if (!hasMatchingTopic) return false
    }

    return true
  })
}

/**
 * Get default filter state
 */
export function getDefaultSeriesFilterState(): SeriesFilterState {
  return {
    completionStatus: 'all',
    sizes: [],
    games: [],
    topics: [],
  }
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: SeriesFilterState): boolean {
  return (
    filters.completionStatus !== 'all' ||
    filters.sizes.length > 0 ||
    filters.games.length > 0 ||
    filters.topics.length > 0
  )
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: SeriesFilterState): number {
  return (
    (filters.completionStatus !== 'all' ? 1 : 0) +
    filters.sizes.length +
    filters.games.length +
    filters.topics.length
  )
}

// ============================================================================
// URL PARAMETER HELPERS
// ============================================================================

/**
 * Parse filter state from URL search params
 */
export function parseSeriesFiltersFromUrl(searchParams: URLSearchParams): SeriesFilterState {
  const status = searchParams.get('status') as SeriesCompletionStatus | null
  const sizeParam = searchParams.get('size')
  const gamesParam = searchParams.get('games')
  const topicsParam = searchParams.get('topics')

  return {
    completionStatus: status && ['not_started', 'in_progress', 'completed'].includes(status)
      ? status
      : 'all',
    sizes: sizeParam
      ? (sizeParam.split(',').filter((s) => ['small', 'medium', 'large'].includes(s)) as SeriesSize[])
      : [],
    games: gamesParam ? gamesParam.split(',').filter(Boolean) : [],
    topics: topicsParam ? topicsParam.split(',').filter(Boolean) : [],
  }
}

/**
 * Convert filter state to URL search params
 */
export function serializeSeriesFiltersToUrl(filters: SeriesFilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.completionStatus !== 'all') {
    params.set('status', filters.completionStatus)
  }
  if (filters.sizes.length > 0) {
    params.set('size', filters.sizes.join(','))
  }
  if (filters.games.length > 0) {
    params.set('games', filters.games.join(','))
  }
  if (filters.topics.length > 0) {
    params.set('topics', filters.topics.join(','))
  }

  return params
}
