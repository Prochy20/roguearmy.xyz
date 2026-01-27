'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkX, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmarks } from '@/contexts/BookmarksContext'
import { useBookmarkProgress } from '@/hooks/useBookmarkProgress'
import { getReadStatus, type ReadStatus } from '@/components/members/ReadStatusIndicator'
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { BookmarkDrawerItem } from './BookmarkDrawerItem'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type FilterStatus = 'all' | 'unread' | 'in_progress' | 'completed'

const filterTabs: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function BookmarksDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const { bookmarks, isLoading, toggleBookmark } = useBookmarks()

  // Get article IDs for progress fetching
  const articleIds = useMemo(
    () => bookmarks.map((b) => b.article.id),
    [bookmarks]
  )

  // Fetch progress for all bookmarked articles
  const { progressMap, isLoading: progressLoading } = useBookmarkProgress(articleIds)

  // Filter bookmarks by status
  const filteredBookmarks = useMemo(() => {
    if (filter === 'all') return bookmarks

    return bookmarks.filter((bookmark) => {
      const progress = progressMap[bookmark.article.id]
      const status: ReadStatus = getReadStatus(progress?.progress, progress?.completed)
      return status === filter
    })
  }, [bookmarks, filter, progressMap])

  // Close drawer on navigation
  const handleNavigate = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle remove bookmark
  const handleRemove = useCallback(
    (articleId: string) => {
      toggleBookmark(articleId)
    },
    [toggleBookmark]
  )

  // Get counts for filter badges
  const counts = useMemo(() => {
    const result = { all: bookmarks.length, unread: 0, in_progress: 0, completed: 0 }

    for (const bookmark of bookmarks) {
      const progress = progressMap[bookmark.article.id]
      const status = getReadStatus(progress?.progress, progress?.completed)
      result[status]++
    }

    return result
  }, [bookmarks, progressMap])

  return (
    <>
      {/* Trigger button */}
      <TooltipProvider delayDuration={300}>
        <Tooltip open={isOpen ? false : undefined}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                'relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors',
                isOpen
                  ? 'bg-bg-elevated text-rga-cyan'
                  : 'hover:bg-bg-elevated text-rga-gray hover:text-white'
              )}
              aria-label="Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {/* Badge count */}
              {bookmarks.length > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full bg-rga-cyan/20 text-rga-cyan">
                  {bookmarks.length > 99 ? '99+' : bookmarks.length}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent accent="cyan">Bookmarks</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen} side="right" accent="cyan">
        {/* Header */}
        <DrawerHeader onClose={() => setIsOpen(false)} accent="cyan">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rga-cyan" />
            <span className="text-white font-medium">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="text-xs text-rga-gray/60">{bookmarks.length} saved</span>
            )}
          </div>
        </DrawerHeader>

        {/* Filter tabs */}
        {bookmarks.length > 0 && (
          <div className="flex gap-1 px-4 py-3 border-b border-rga-cyan/10 overflow-x-auto">
            {filterTabs.map((tab) => {
              const count = counts[tab.value]
              const isActive = filter === tab.value

              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-rga-cyan/20 text-rga-cyan'
                      : 'text-rga-gray hover:text-white hover:bg-bg-surface'
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'min-w-[16px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center',
                        isActive ? 'bg-rga-cyan/30' : 'bg-bg-surface'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Content */}
        <DrawerContent>
          {isLoading || progressLoading ? (
            <div className="px-4 py-12 text-center">
              <div className="animate-pulse text-rga-gray/40 text-sm">Loading...</div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <BookmarkX className="w-10 h-10 mx-auto mb-3 text-rga-gray/30" />
              <p className="text-rga-gray/60 text-sm">No bookmarks yet</p>
              <p className="text-rga-gray/40 text-xs mt-1">Save articles to read later</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-rga-gray/60 text-sm">No {filter.replace('_', ' ')} bookmarks</p>
              <button
                onClick={() => setFilter('all')}
                className="text-rga-cyan text-xs mt-2 hover:underline"
              >
                View all bookmarks
              </button>
            </div>
          ) : (
            <div className="divide-y divide-rga-cyan/5">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkDrawerItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  progress={progressMap[bookmark.article.id]}
                  onRemove={() => handleRemove(bookmark.article.id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </DrawerContent>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <DrawerFooter accent="cyan">
            <Link
              href="/blog/bookmarks"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-rga-cyan hover:text-white hover:bg-bg-surface rounded-lg transition-colors"
            >
              <span>View all bookmarks</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </DrawerFooter>
        )}
      </Drawer>
    </>
  )
}
