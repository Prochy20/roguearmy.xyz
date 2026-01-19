'use client'

import { useState, useEffect, useCallback } from 'react'

export type ViewMode = 'featured' | 'grid' | 'list'

const STORAGE_KEY = 'rga-article-view-mode'
const DEFAULT_MODE: ViewMode = 'featured'

/**
 * Hook for managing article view mode preference
 * Persists selection to localStorage
 */
export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_MODE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidViewMode(stored)) {
      setViewModeState(stored)
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage when changed
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [])

  return {
    viewMode,
    setViewMode,
    isHydrated,
  }
}

function isValidViewMode(value: string): value is ViewMode {
  return value === 'featured' || value === 'grid' || value === 'list'
}
