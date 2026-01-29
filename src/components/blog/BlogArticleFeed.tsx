'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { BlogArticleCard } from './BlogArticleCard'
import { BlogArticleCardCompact } from './BlogArticleCardCompact'
import { BlogArticleCardList } from './BlogArticleCardList'
import { BlogArticleCardIncoming } from './BlogArticleCardIncoming'
import { BlogSectionDivider } from './BlogSectionDivider'
import { EmptyState } from '@/components/members/EmptyState'
import { type Article, type FilterState, filterArticles } from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import type { ViewMode } from '@/hooks/useViewMode'

interface BlogArticleFeedProps {
  articles: Article[]
  filters: FilterState
  onClearFilters: () => void
  progress?: Record<string, ArticleProgress>
  viewMode?: ViewMode
  isAuthenticated?: boolean
}

const ARTICLES_PER_PAGE = 4
const RECENT_COUNT = 3

/**
 * Check if any filters are active
 */
function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search !== '' ||
    filters.readStatus !== null ||
    filters.readingTime.length > 0 ||
    filters.series !== null ||
    filters.games.length > 0 ||
    filters.topics.length > 0 ||
    filters.contentTypes.length > 0
  )
}

export function BlogArticleFeed({
  articles,
  filters,
  onClearFilters,
  progress,
  viewMode = 'featured',
  isAuthenticated = false,
}: BlogArticleFeedProps) {
  const [displayedArchiveCount, setDisplayedArchiveCount] = useState(ARTICLES_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter articles (pass progress for read status filtering)
  const filteredArticles = filterArticles(articles, filters, progress)

  // Determine effective view mode - auto-switch to grid when filters are active
  const isFiltered = hasActiveFilters(filters)
  const effectiveViewMode = viewMode === 'featured' && isFiltered ? 'grid' : viewMode

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedArchiveCount(ARTICLES_PER_PAGE)
  }, [filters])

  // Split articles for sectioned layout (only used when effectiveViewMode === 'featured')
  const featuredArticle = filteredArticles[0] ?? null
  const recentArticles = filteredArticles.slice(1, 1 + RECENT_COUNT)
  const allArchiveArticles = filteredArticles.slice(1 + RECENT_COUNT)
  const displayedArchiveArticles = allArchiveArticles.slice(0, displayedArchiveCount)

  // For grid/list modes, use all filtered articles with pagination
  const displayedArticles = filteredArticles.slice(0, displayedArchiveCount + 1 + RECENT_COUNT)

  // Determine if there's more content to load
  const hasMoreArchive = displayedArchiveCount < allArchiveArticles.length
  const hasMoreFlat = displayedArticles.length < filteredArticles.length
  const hasMore = effectiveViewMode === 'featured' ? hasMoreArchive : hasMoreFlat

  // Infinite scroll with Intersection Observer
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate network delay for smoother UX
    setTimeout(() => {
      setDisplayedArchiveCount((prev) =>
        Math.min(prev + ARTICLES_PER_PAGE, effectiveViewMode === 'featured' ? allArchiveArticles.length : filteredArticles.length)
      )
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore, allArchiveArticles.length, filteredArticles.length, effectiveViewMode])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMore])

  // Empty state
  if (filteredArticles.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />
  }

  // Featured sectioned layout
  if (effectiveViewMode === 'featured') {
    return (
      <div className="space-y-8">
        {/* Priority Transmission Section */}
        {featuredArticle && (
          <section className="space-y-4">
            <BlogSectionDivider label="Priority Transmission" />
            <BlogArticleCard
              article={featuredArticle}
              index={0}
              progress={progress?.[featuredArticle.id]}
              isAuthenticated={isAuthenticated}
            />
          </section>
        )}

        {/* Recent Section */}
        {recentArticles.length > 0 && (
          <section className="space-y-4">
            <BlogSectionDivider label="Recent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {recentArticles.map((article, index) => (
                <BlogArticleCardIncoming
                  key={article.id}
                  article={article}
                  index={index}
                  progress={progress?.[article.id]}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </section>
        )}

        {/* Archive Section */}
        {allArchiveArticles.length > 0 && (
          <section className="space-y-4">
            <BlogSectionDivider label="Archive" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
              {displayedArchiveArticles.map((article, index) => (
                <BlogArticleCardCompact
                  key={article.id}
                  article={article}
                  index={index}
                  progress={progress?.[article.id]}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </section>
        )}

        {/* Load More Trigger / Loading Indicator */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <LoadingIndicator isLoading={isLoading} />
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && filteredArticles.length > 0 && (
          <EndOfFeed />
        )}
      </div>
    )
  }

  // Grid and List modes (flat layout)
  const gridClasses = cn(
    effectiveViewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr',
    effectiveViewMode === 'list' && 'flex flex-col gap-3'
  )

  // Render the appropriate card component based on view mode
  const renderCard = (article: Article, index: number) => {
    const cardProgress = progress?.[article.id]

    switch (effectiveViewMode) {
      case 'grid':
        return (
          <BlogArticleCardCompact
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
            isAuthenticated={isAuthenticated}
          />
        )
      case 'list':
        return (
          <BlogArticleCardList
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
            isAuthenticated={isAuthenticated}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Article Grid */}
      <div className={gridClasses}>
        {displayedArticles.map((article, index) => renderCard(article, index))}
      </div>

      {/* Load More Trigger / Loading Indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <LoadingIndicator isLoading={isLoading} />
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && displayedArticles.length > 0 && (
        <EndOfFeed />
      )}
    </div>
  )
}

function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-rga-green rounded-full"
          animate={{
            scale: isLoading ? [1, 1.5, 1] : 1,
            opacity: isLoading ? [0.3, 1, 0.3] : 0.3,
          }}
          transition={{
            duration: 0.6,
            repeat: isLoading ? Infinity : 0,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function EndOfFeed() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <div className="inline-flex items-center gap-3 text-rga-gray/40 text-sm">
        <span className="w-8 h-px bg-rga-gray/20" />
        <span>End of feed</span>
        <span className="w-8 h-px bg-rga-gray/20" />
      </div>
    </motion.div>
  )
}
