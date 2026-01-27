'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { BlogArticleCard } from './BlogArticleCard'
import { BlogArticleCardCompact } from './BlogArticleCardCompact'
import { BlogArticleCardList } from './BlogArticleCardList'
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

export function BlogArticleFeed({
  articles,
  filters,
  onClearFilters,
  progress,
  viewMode = 'featured',
  isAuthenticated = false,
}: BlogArticleFeedProps) {
  const [displayedCount, setDisplayedCount] = useState(ARTICLES_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter articles (pass progress for read status filtering)
  const filteredArticles = filterArticles(articles, filters, progress)

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
      case 'featured':
      default:
        return (
          <BlogArticleCard
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
            isAuthenticated={isAuthenticated}
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
