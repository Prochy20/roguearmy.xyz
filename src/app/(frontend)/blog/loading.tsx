'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { CyberCorners } from '@/components/ui/CyberCorners'
import type { ViewMode } from '@/hooks/useViewMode'

const STORAGE_KEY = 'rga-article-view-mode'

export default function BlogLoading() {
  // Read view mode from localStorage to match user's preference
  const [viewMode, setViewMode] = useState<ViewMode>('featured')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'featured' || stored === 'grid' || stored === 'list') {
      setViewMode(stored)
    }
  }, [])

  return (
    <div className="min-h-screen bg-void">
      <main className="container mx-auto px-4 py-8">
        {/* Page header - matches BlogArticlesPage */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Title skeleton */}
              <Skeleton className="h-10 sm:h-12 md:h-14 w-32 mb-3" glow />
              {/* Description skeleton */}
              <Skeleton className="h-5 w-full max-w-md mb-1" />
              <Skeleton className="h-5 w-3/4 max-w-sm" />
            </div>

            {/* View mode toggle + filter button skeleton */}
            <div className="flex items-center gap-2 shrink-0">
              {/* ViewModeToggle skeleton */}
              <div className="inline-flex items-center gap-1 p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm">
                <Skeleton className="w-8 h-8 rounded-sm" />
                <Skeleton className="w-8 h-8 rounded-sm" />
                <Skeleton className="w-8 h-8 rounded-sm" />
              </div>
              {/* Mobile filter button skeleton */}
              <Skeleton className="lg:hidden h-10 w-10 sm:w-24" />
            </div>
          </div>
        </div>

        {/* Content Layout - matches BlogArticlesPage */}
        <div className="flex gap-8">
          {/* Sidebar skeleton - Desktop only */}
          <aside className="w-64 flex-shrink-0 hidden lg:block space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </aside>

          {/* Article Feed skeleton */}
          <div className="flex-1 min-w-0">
            <ArticleFeedSkeleton viewMode={viewMode} />
          </div>
        </div>
      </main>
    </div>
  )
}

function ArticleFeedSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ArticleListSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleGridSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  // Featured view (default)
  return (
    <div className="grid gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ArticleFeaturedSkeleton key={i} index={i} />
      ))}
    </div>
  )
}

function ArticleFeaturedSkeleton({ index }: { index: number }) {
  return (
    <div
      className="bg-void-light border border-rga-gray/10 rounded-lg overflow-hidden animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Hero image */}
        <CyberCorners color="green" size="sm" glow={false}>
          <Skeleton className="aspect-16/9 md:aspect-auto md:w-80 md:h-48 rounded-none" />
        </CyberCorners>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-full" glow />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ArticleGridSkeleton({ index }: { index: number }) {
  return (
    <div
      className="bg-void-light border border-rga-gray/10 rounded-lg overflow-hidden animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      <CyberCorners color="green" size="sm" glow={false}>
        <Skeleton className="aspect-16/9 w-full rounded-none" />
      </CyberCorners>
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-full" glow />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

function ArticleListSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex gap-4 p-3 bg-void-light border border-rga-gray/10 rounded-lg animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
    >
      {/* Thumbnail */}
      <CyberCorners color="green" size="sm" glow={false}>
        <Skeleton className="w-24 h-16 md:w-32 md:h-20 rounded-none shrink-0" />
      </CyberCorners>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-full" glow />
        <Skeleton className="h-4 w-3/4 hidden sm:block" />
      </div>

      {/* Meta */}
      <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}
