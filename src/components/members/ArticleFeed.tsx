'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { ArticleCard } from './ArticleCard'
import { ArticleCardCompact } from './ArticleCardCompact'
import { ArticleCardList } from './ArticleCardList'
import { EmptyState } from './EmptyState'
import { type Article, type FilterState, filterArticles } from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import type { ViewMode } from '@/hooks/useViewMode'

interface ArticleFeedProps {
  articles: Article[]
  filters: FilterState
  onClearFilters: () => void
  progress?: Record<string, ArticleProgress>
  viewMode?: ViewMode
}

const ARTICLES_PER_PAGE = 4

// Animation constants extracted outside component to prevent recreation
const LOADING_DOT_ANIMATION = {
  active: { scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] },
  inactive: { scale: 1, opacity: 0.3 },
}
const LOADING_TRANSITION_BASE = {
  duration: 0.6,
  ease: 'easeInOut' as const,
}

export function ArticleFeed({
  articles,
  filters,
  onClearFilters,
  progress,
  viewMode = 'featured',
}: ArticleFeedProps) {
  const [displayedCount, setDisplayedCount] = useState(ARTICLES_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Memoize filtered articles to avoid recalculation on every render
  const filteredArticles = useMemo(
    () => filterArticles(articles, filters, progress),
    [articles, filters, progress]
  )

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ARTICLES_PER_PAGE)
  }, [filters])

  const displayedArticles = filteredArticles.slice(0, displayedCount)
  const hasMore = displayedCount < filteredArticles.length

  // Infinite scroll with Intersection Observer
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate network delay for smoother UX
    setTimeout(() => {
      setDisplayedCount((prev) =>
        Math.min(prev + ARTICLES_PER_PAGE, filteredArticles.length)
      )
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore, filteredArticles.length])

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

  // Grid classes based on view mode
  const gridClasses = cn(
    viewMode === 'featured' && 'grid gap-6',
    viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr',
    viewMode === 'list' && 'flex flex-col gap-3'
  )

  // Render the appropriate card component based on view mode
  const renderCard = (article: Article, index: number) => {
    const cardProgress = progress?.[article.id]

    switch (viewMode) {
      case 'grid':
        return (
          <ArticleCardCompact
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
      case 'list':
        return (
          <ArticleCardList
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
      case 'featured':
      default:
        return (
          <ArticleCard
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
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
          animate={isLoading ? LOADING_DOT_ANIMATION.active : LOADING_DOT_ANIMATION.inactive}
          transition={{
            ...LOADING_TRANSITION_BASE,
            repeat: isLoading ? Infinity : 0,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}
