'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  bookmarkKey,
  type BookmarkTargetType,
  type BookmarkWithTarget,
} from '@/lib/bookmarks'

interface BookmarksContextValue {
  bookmarks: BookmarkWithTarget[]
  bookmarkedKeys: Set<string>
  isLoading: boolean
  toggleBookmark: (targetType: BookmarkTargetType, targetId: string) => Promise<void>
  isBookmarked: (targetType: BookmarkTargetType, targetId: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

interface BookmarksProviderProps {
  children: ReactNode
  // Server-hydrated initial state. `null` = anonymous user → no client fetch.
  // `undefined` = no hydration provided → fall back to mount-time fetch.
  initialBookmarks?: BookmarkWithTarget[] | null
}

export function BookmarksProvider({
  children,
  initialBookmarks,
}: BookmarksProviderProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithTarget[]>(
    initialBookmarks ?? [],
  )
  const [isLoading, setIsLoading] = useState(initialBookmarks === undefined)

  const bookmarkedKeys = useMemo(
    () => new Set(bookmarks.map((b) => bookmarkKey(b.targetType, b.target.id))),
    [bookmarks],
  )

  useEffect(() => {
    if (initialBookmarks !== undefined) {
      setIsLoading(false)
      return
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  const isBookmarked = useCallback(
    (targetType: BookmarkTargetType, targetId: string) =>
      bookmarkedKeys.has(bookmarkKey(targetType, targetId)),
    [bookmarkedKeys],
  )

  // Refs so toggleBookmark stays stable across renders.
  const bookmarksRef = useRef(bookmarks)
  const bookmarkedKeysRef = useRef(bookmarkedKeys)
  useEffect(() => {
    bookmarksRef.current = bookmarks
    bookmarkedKeysRef.current = bookmarkedKeys
  }, [bookmarks, bookmarkedKeys])

  const refetch = useCallback(async () => {
    const response = await fetch('/api/member/bookmarks')
    if (response.ok) {
      const data = await response.json()
      setBookmarks(data.bookmarks || [])
    }
  }, [])

  const toggleBookmark = useCallback(
    async (targetType: BookmarkTargetType, targetId: string) => {
      const key = bookmarkKey(targetType, targetId)
      const wasBookmarked = bookmarkedKeysRef.current.has(key)
      const previousBookmarks = bookmarksRef.current

      if (wasBookmarked) {
        setBookmarks((prev) =>
          prev.filter((b) => bookmarkKey(b.targetType, b.target.id) !== key),
        )
      }

      const method = wasBookmarked ? 'DELETE' : 'POST'
      let serverOk = false
      try {
        const response = await fetch('/api/member/bookmarks', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId }),
        })
        // 409 (already-bookmarked / already-deleted) is benign — refetch reconciles.
        serverOk = response.ok || response.status === 409
        if (!serverOk) {
          console.error(
            `Bookmark ${method} failed with status ${response.status}`,
          )
        }
      } catch (error) {
        console.error(`Failed to ${method.toLowerCase()} bookmark:`, error)
      }

      if (!serverOk && wasBookmarked) {
        // Roll back optimistic remove; skip refetch since the request failed.
        setBookmarks(previousBookmarks)
        return
      }

      await refetch()
    },
    [refetch],
  )

  const value = useMemo(
    () => ({
      bookmarks,
      bookmarkedKeys,
      isLoading,
      toggleBookmark,
      isBookmarked,
    }),
    [bookmarks, bookmarkedKeys, isLoading, toggleBookmark, isBookmarked],
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

// Returns null when used outside the provider — for components that render
// in preview surfaces (storybook, draft mode) without a mounted provider.
export function useBookmarksOptional() {
  return useContext(BookmarksContext)
}
