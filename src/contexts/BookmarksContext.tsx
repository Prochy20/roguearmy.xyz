'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type { BookmarkWithArticle } from '@/lib/bookmarks'

interface BookmarksContextValue {
  bookmarkedIds: Set<string>
  bookmarks: BookmarkWithArticle[]
  isLoading: boolean
  toggleBookmark: (articleId: string) => Promise<void>
  isBookmarked: (articleId: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

interface BookmarksProviderProps {
  children: ReactNode
}

export function BookmarksProvider({ children }: BookmarksProviderProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Derive bookmarkedIds from bookmarks for quick lookup
  const bookmarkedIds = useMemo(
    () => new Set(bookmarks.map((b) => b.article.id)),
    [bookmarks]
  )

  // Use ref to avoid recreating callbacks when bookmarks change
  const bookmarkedIdsRef = useRef(bookmarkedIds)
  useEffect(() => {
    bookmarkedIdsRef.current = bookmarkedIds
  }, [bookmarkedIds])

  // Fetch all bookmarks on mount
  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await fetch('/api/member/bookmarks')
        if (response.ok) {
          const data = await response.json()
          setBookmarks(data.bookmarks || [])
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [])

  // Stable callback using ref - doesn't change when bookmarks change
  const isBookmarked = useCallback(
    (articleId: string) => bookmarkedIdsRef.current.has(articleId),
    [] // Empty deps - uses ref for current value
  )

  const toggleBookmark = useCallback(async (articleId: string) => {
    const isCurrentlyBookmarked = bookmarkedIdsRef.current.has(articleId)

    // Optimistic update
    if (isCurrentlyBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.article.id !== articleId))
    } else {
      // Add placeholder bookmark (will be replaced on next fetch if needed)
      setBookmarks((prev) => [
        {
          id: `temp-${articleId}`,
          article: {
            id: articleId,
            slug: '',
            title: 'Loading...',
            perex: '',
            heroImage: null,
            topic: null,
            games: [],
            contentType: null,
            readingTime: 0,
            publishedAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    }

    try {
      if (isCurrentlyBookmarked) {
        const response = await fetch('/api/member/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        })

        if (!response.ok) {
          // Revert on error
          const data = await fetch('/api/member/bookmarks')
          if (data.ok) {
            const result = await data.json()
            setBookmarks(result.bookmarks || [])
          }
        }
      } else {
        const response = await fetch('/api/member/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        })

        if (response.ok) {
          // Refetch to get full article data
          const data = await fetch('/api/member/bookmarks')
          if (data.ok) {
            const result = await data.json()
            setBookmarks(result.bookmarks || [])
          }
        } else {
          // Revert on error
          setBookmarks((prev) => prev.filter((b) => b.article.id !== articleId))
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      // Refetch to restore correct state
      const data = await fetch('/api/member/bookmarks')
      if (data.ok) {
        const result = await data.json()
        setBookmarks(result.bookmarks || [])
      }
    }
  }, []) // Empty deps - uses ref for current value

  const value = useMemo(
    () => ({
      bookmarkedIds,
      bookmarks,
      isLoading,
      toggleBookmark,
      isBookmarked,
    }),
    [bookmarkedIds, bookmarks, isLoading, toggleBookmark, isBookmarked]
  )

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider')
  }
  return context
}

/**
 * Optional version of useBookmarks that returns null when outside provider.
 * Useful for components that may render in preview mode without the provider.
 */
export function useBookmarksOptional() {
  return useContext(BookmarksContext)
}
