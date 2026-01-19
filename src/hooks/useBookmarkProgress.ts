'use client'

import { useState, useEffect } from 'react'

/** Progress data for an article (matches API response shape) */
export interface BookmarkProgressData {
  articleId: string
  progress: number
  completed: boolean
  timeSpent: number
  firstVisitedAt: string
  lastVisitedAt: string
}

interface UseBookmarkProgressResult {
  progressMap: Record<string, BookmarkProgressData>
  isLoading: boolean
}

/**
 * Hook to fetch read progress for a list of article IDs.
 * Used by the bookmarks page to show progress indicators.
 */
export function useBookmarkProgress(articleIds: string[]): UseBookmarkProgressResult {
  const [progressMap, setProgressMap] = useState<Record<string, BookmarkProgressData>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip if no article IDs
    if (articleIds.length === 0) {
      setProgressMap({})
      setIsLoading(false)
      return
    }

    async function fetchProgress() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/read-progress')
        if (response.ok) {
          const data = await response.json()
          const progressRecords = data.progress as Array<{
            article: string
            progress: number
            completed: boolean
            timeSpent: number
            firstVisitedAt: string
            lastVisitedAt: string
          }>

          // Build progress map keyed by article ID
          const map: Record<string, BookmarkProgressData> = {}
          for (const record of progressRecords) {
            // Only include progress for articles we're interested in
            if (articleIds.includes(record.article)) {
              map[record.article] = {
                articleId: record.article,
                progress: record.progress,
                completed: record.completed,
                timeSpent: record.timeSpent,
                firstVisitedAt: record.firstVisitedAt,
                lastVisitedAt: record.lastVisitedAt,
              }
            }
          }
          setProgressMap(map)
        }
      } catch (error) {
        console.error('Failed to fetch bookmark progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- articleIds.join(',') provides stable dependency
  }, [articleIds.join(',')])

  return { progressMap, isLoading }
}
