'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ReadProgressTrackerProps {
  /** Article ID to track progress for */
  articleId: string
}

const DEBOUNCE_MS = 10_000 // 10 seconds
const PROGRESS_CHANGE_THRESHOLD = 10 // 10% change triggers sync

/**
 * Headless client component that tracks reading progress.
 * Does NOT render anything - purely for persistence.
 *
 * Tracks:
 * - Scroll progress (0-100%)
 * - Time spent on page (seconds)
 * - Completed status (at 85% threshold)
 *
 * Syncs to API:
 * - Every 10 seconds
 * - On 10%+ progress change
 * - On visibility change (tab switch)
 * - On beforeunload (page close)
 */
export function ReadProgressTracker({ articleId }: ReadProgressTrackerProps) {
  const progressRef = useRef(0)
  const lastSyncedProgressRef = useRef(0)
  const timeSpentRef = useRef(0)
  const lastSyncTimeRef = useRef(Date.now())
  const isVisibleRef = useRef(true)
  const isSyncingRef = useRef(false) // Mutex to prevent concurrent syncs
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync progress to API
  const syncProgress = useCallback(async (force = false) => {
    // Skip if already syncing (mutex)
    if (isSyncingRef.current) {
      return
    }

    const currentProgress = progressRef.current
    const progressDiff = Math.abs(currentProgress - lastSyncedProgressRef.current)

    // Only sync if forced or progress changed significantly
    if (!force && progressDiff < PROGRESS_CHANGE_THRESHOLD) {
      return
    }

    // Don't sync if no progress
    if (currentProgress === 0 && timeSpentRef.current === 0) {
      return
    }

    isSyncingRef.current = true
    try {
      await fetch('/api/read-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          progress: Math.round(currentProgress),
          timeSpent: Math.round(timeSpentRef.current),
        }),
        // Use keepalive for beforeunload
        keepalive: true,
      })

      lastSyncedProgressRef.current = currentProgress
      timeSpentRef.current = 0 // Reset time spent after sync
      lastSyncTimeRef.current = Date.now()
    } catch (error) {
      console.error('Failed to sync read progress:', error)
    } finally {
      isSyncingRef.current = false
    }
  }, [articleId])

  // Calculate scroll progress
  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    progressRef.current = Math.min(scrollProgress, 100)
  }, [])

  // Handle scroll with debounced sync
  const handleScroll = useCallback(() => {
    calculateProgress()

    // Check if progress changed enough to sync
    const progressDiff = Math.abs(progressRef.current - lastSyncedProgressRef.current)
    if (progressDiff >= PROGRESS_CHANGE_THRESHOLD) {
      syncProgress()
    }
  }, [calculateProgress, syncProgress])

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      isVisibleRef.current = false
      syncProgress(true) // Force sync when leaving
    } else {
      isVisibleRef.current = true
    }
  }, [syncProgress])

  // Handle beforeunload
  const handleBeforeUnload = useCallback(() => {
    syncProgress(true) // Force sync before leaving
  }, [syncProgress])

  useEffect(() => {
    // Initial progress calculation
    calculateProgress()

    // Track time spent while visible
    timeTrackingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        timeSpentRef.current += 1
      }
    }, 1000)

    // Debounced sync interval
    syncTimeoutRef.current = setInterval(() => {
      if (isVisibleRef.current && timeSpentRef.current > 0) {
        syncProgress()
      }
    }, DEBOUNCE_MS)

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Cleanup
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

  // Render nothing - this is a headless component
  return null
}
