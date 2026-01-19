'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Bookmark, ChevronRight, BookmarkX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmarks } from '@/contexts/BookmarksContext'
import { mapPayloadColorToTint, getTintClasses } from '@/lib/articles'

const MAX_DROPDOWN_ITEMS = 5

export function NavBookmarksDropdown() {
  const { bookmarks, isLoading } = useBookmarks()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const recentBookmarks = bookmarks.slice(0, MAX_DROPDOWN_ITEMS)
  const hasMore = bookmarks.length > MAX_DROPDOWN_ITEMS

  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors',
          isOpen ? 'bg-bg-elevated text-rga-cyan' : 'hover:bg-bg-elevated text-rga-gray hover:text-white'
        )}
        title="Bookmarks"
      >
        <Bookmark className="w-5 h-5" />
        {/* Badge count */}
        {bookmarks.length > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full bg-rga-cyan/20 text-rga-cyan">
            {bookmarks.length > 99 ? '99+' : bookmarks.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-bg-elevated border border-rga-cyan/20 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-rga-cyan/10 flex items-center justify-between">
              <p className="text-white text-sm font-medium">Bookmarks</p>
              {bookmarks.length > 0 && (
                <span className="text-xs text-rga-gray/60">{bookmarks.length} saved</span>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-pulse text-rga-gray/40 text-sm">Loading...</div>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <BookmarkX className="w-8 h-8 mx-auto mb-2 text-rga-gray/30" />
                <p className="text-rga-gray/60 text-sm">No bookmarks yet</p>
                <p className="text-rga-gray/40 text-xs mt-1">
                  Save articles to read later
                </p>
              </div>
            ) : (
              <nav className="py-1 max-h-80 overflow-y-auto">
                {recentBookmarks.map((bookmark) => {
                  const tint = bookmark.article.topic?.color
                    ? getTintClasses(mapPayloadColorToTint(bookmark.article.topic.color))
                    : null

                  return (
                    <Link
                      key={bookmark.id}
                      href={`/members/articles/${bookmark.article.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-surface transition-colors"
                    >
                      {/* Topic color indicator */}
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0',
                          tint?.text ? tint.text.replace('text-', 'bg-') : 'bg-rga-gray/40'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-rga-gray hover:text-white transition-colors line-clamp-2">
                          {bookmark.article.title}
                        </p>
                        {bookmark.article.topic && (
                          <p className={cn('text-xs mt-0.5', tint?.textMuted || 'text-rga-gray/40')}>
                            {bookmark.article.topic.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}

                {/* View all link */}
                {hasMore || bookmarks.length > 0 ? (
                  <div className="border-t border-rga-cyan/10 mt-1 pt-1">
                    <Link
                      href="/members/bookmarks"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-rga-cyan hover:text-white hover:bg-bg-surface transition-colors"
                    >
                      <span>View all bookmarks</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : null}
              </nav>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
