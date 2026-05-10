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

            {/* Toolbar: View mode toggle + filter button skeleton */}
            <div className="flex items-center gap-2 shrink-0">
              {/* ViewModeToggle skeleton */}
              <div className="inline-flex items-center gap-1 p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm">
                <Skeleton className="w-8 h-8 rounded-sm" />
                <Skeleton className="w-8 h-8 rounded-sm" />
                <Skeleton className="w-8 h-8 rounded-sm" />
              </div>
              {/* Filter button skeleton - always visible */}
              <div className="inline-flex items-center p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm">
                <Skeleton className="w-8 h-8 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width content layout - no sidebar */}
        <div className="w-full">
          <ArticleFeedSkeleton viewMode={viewMode} />
        </div>
      </main>
    </div>
  )
}

function ArticleFeedSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleListSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ArticleCardSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  // Featured view (default) - 3-section layout
  return (
    <div className="space-y-8">
      {/* Priority Transmission Section */}
      <section className="space-y-4">
        <SectionDividerSkeleton />
        <PriorityTransmissionSkeleton />
      </section>

      {/* Recent Section - 3 columns */}
      <section className="space-y-4">
        <SectionDividerSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} index={i} />
          ))}
        </div>
      </section>

      {/* Archive Section - 4 columns */}
      <section className="space-y-4">
        <SectionDividerSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} index={i} size="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionDividerSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-3 w-28" />
      <div className="flex-1 h-px bg-rga-gray/20" />
    </div>
  )
}

function PriorityTransmissionSkeleton() {
  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationFillMode: 'backwards' }}
    >
      <CyberCorners color="green" size="sm" glow={false}>
        <div className="border border-rga-gray/20 bg-bg-elevated overflow-hidden">
          {/* Hero image - 5:2 aspect ratio */}
          <Skeleton className="aspect-5/2 w-full rounded-none" />

          {/* Content */}
          <div className="p-5 space-y-3">
            <Skeleton className="h-7 w-full max-w-xl" glow />
            <Skeleton className="h-7 w-3/4 max-w-md" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-2/3 max-w-xl" />
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CyberCorners>
    </div>
  )
}

function ArticleCardSkeleton({ index, size = 'md' }: { index: number; size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm'

  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
    >
      <CyberCorners color="green" size="sm" glow={false}>
        <div className="border border-rga-gray/20 bg-bg-elevated overflow-hidden h-full flex flex-col">
          {/* Image - 16:9 */}
          <Skeleton className="aspect-video w-full rounded-none" />

          {/* Content */}
          <div className={`flex-1 flex flex-col ${isSmall ? 'p-3 pt-2' : 'p-3 pt-2'}`}>
            {/* Title */}
            <div className={isSmall ? 'min-h-[2.25rem] mb-1.5' : 'min-h-[2.5rem] mb-2'}>
              <Skeleton className={`h-4 w-full ${isSmall ? '' : ''}`} glow />
              <Skeleton className={`h-4 w-3/4 mt-1`} />
            </div>

            {/* Perex */}
            <div className="mb-auto">
              <Skeleton className={`h-3 w-full ${isSmall ? 'mb-1' : 'mb-1'}`} />
              <Skeleton className="h-3 w-4/5" />
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between gap-2 ${isSmall ? 'pt-2.5 mt-2' : 'pt-3 mt-2'} border-t border-white/5`}>
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CyberCorners>
    </div>
  )
}

function ArticleListSkeleton({ index }: { index: number }) {
  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
    >
      <CyberCorners color="green" size="sm" glow={false}>
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-rga-gray/20 bg-bg-elevated">
          {/* Thumbnail */}
          <Skeleton className="w-20 h-20 rounded-sm shrink-0 hidden sm:block" />

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <Skeleton className="h-5 w-full mb-1" glow />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CyberCorners>
    </div>
  )
}
