'use client'

import { useEffect, useRef, useCallback } from 'react'

type TargetType = 'article' | 'briefing'

interface ReadProgressTrackerProps {
  /** Which content type this tracker is mounted on. */
  targetType: TargetType
  /** Article ID (Payload) or briefing UUID (Ashley). */
  targetId: string
  /**
   * CSS selector for the element whose scroll progress should be tracked.
   * Defaults to `.article-content` — the blog body wrapper. Briefing detail
   * passes `.briefing-body`.
   */
  selector?: string
}

const DEBOUNCE_MS = 10_000 // 10 seconds
const PROGRESS_CHANGE_THRESHOLD = 10 // 10% change triggers sync
const DEFAULT_SELECTOR = '.article-content'

/**
 * Headless client component that tracks reading progress.
 * Does NOT render anything - purely for persistence.
 *
 * Tracks:
 * - Scroll progress (0-100%) within the element matching `selector`
 * - Time spent on page (seconds)
 * - Completed status (at 85% threshold, computed server-side)
 *
 * Syncs to API:
 * - Every 10 seconds
 * - On 10%+ progress change
 * - On visibility change (tab switch)
 * - On beforeunload (page close)
 */
export function ReadProgressTracker({
  targetType,
  targetId,
  selector = DEFAULT_SELECTOR,
}: ReadProgressTrackerProps) {
  const progressRef = useRef(0)
  const lastSyncedProgressRef = useRef(0)
  const timeSpentRef = useRef(0)
  const isVisibleRef = useRef(true)
  const isSyncingRef = useRef(false) // Mutex to prevent concurrent syncs
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const warnedMissingSelectorRef = useRef(false)

  // Sync progress to API
  const syncProgress = useCallback(async (force = false) => {
    if (isSyncingRef.current) {
      return
    }

    const currentProgress = progressRef.current
    const progressDiff = Math.abs(currentProgress - lastSyncedProgressRef.current)

    if (!force && progressDiff < PROGRESS_CHANGE_THRESHOLD) {
      return
    }

    if (currentProgress === 0 && timeSpentRef.current === 0) {
      return
    }

    isSyncingRef.current = true
    try {
      await fetch('/api/member/read-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          progress: Math.round(currentProgress),
          timeSpent: Math.round(timeSpentRef.current),
        }),
        // Use keepalive for beforeunload
        keepalive: true,
      })

      lastSyncedProgressRef.current = currentProgress
      timeSpentRef.current = 0
    } catch (error) {
      console.error('Failed to sync read progress:', error)
    } finally {
      isSyncingRef.current = false
    }
  }, [targetType, targetId])

  // Calculate scroll progress based on the configured element
  const calculateProgress = useCallback(() => {
    const article = document.querySelector(selector)
    if (!article) {
      if (
        process.env.NODE_ENV !== 'production' &&
        !warnedMissingSelectorRef.current
      ) {
        warnedMissingSelectorRef.current = true
        console.warn(
          `[ReadProgressTracker] selector not found in DOM: "${selector}". ` +
            `Progress will stay at 0%. Check the wrapper element on this page.`,
        )
      }
      progressRef.current = 0
      return
    }

    const rect = article.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // 0% when top of element is at top of viewport;
    // 100% when bottom of element reaches bottom of viewport.
    const scrolledIntoArticle = -rect.top
    const readableDistance = article.clientHeight - viewportHeight

    let scrollProgress = 0
    if (readableDistance > 0) {
      scrollProgress = (scrolledIntoArticle / readableDistance) * 100
      scrollProgress = Math.max(0, Math.min(100, scrollProgress))
    } else {
      scrollProgress = rect.top <= 0 ? 100 : 0
    }

    progressRef.current = scrollProgress
  }, [selector])

  const handleScroll = useCallback(() => {
    calculateProgress()

    const progressDiff = Math.abs(progressRef.current - lastSyncedProgressRef.current)
    if (progressDiff >= PROGRESS_CHANGE_THRESHOLD) {
      syncProgress()
    }
  }, [calculateProgress, syncProgress])

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      isVisibleRef.current = false
      syncProgress(true)
    } else {
      isVisibleRef.current = true
    }
  }, [syncProgress])

  const handleBeforeUnload = useCallback(() => {
    syncProgress(true)
  }, [syncProgress])

  useEffect(() => {
    calculateProgress()

    timeTrackingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        timeSpentRef.current += 1
      }
    }, 1000)

    syncTimeoutRef.current = setInterval(() => {
      if (isVisibleRef.current && timeSpentRef.current > 0) {
        syncProgress()
      }
    }, DEBOUNCE_MS)

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)

      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
      }
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current)
      }

      // Final sync on unmount
      syncProgress(true)
    }
  }, [calculateProgress, handleScroll, handleVisibilityChange, handleBeforeUnload, syncProgress])

  return null
}
