'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { ArticleFeed } from './ArticleFeed'
import { ArticleFilterSidebar } from './ArticleFilterSidebar'
import { FilterBottomSheet } from './FilterBottomSheet'
import { ViewModeToggle } from './ViewModeToggle'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { type Article, type FilterState, type FilterOptions } from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { useViewMode } from '@/hooks/useViewMode'

interface MembersArticlesPageProps {
  articles: Article[]
  filterOptions: FilterOptions
  progress?: Record<string, ArticleProgress>
}

export function MembersArticlesPage({
  articles,
  filterOptions,
  progress,
}: MembersArticlesPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { viewMode, setViewMode } = useViewMode()

  // Read search from URL, keep other filters local
  const urlSearch = searchParams.get('search') || ''

  const [filters, setFilters] = useState<FilterState>({
    readStatus: null,
    readingTime: [],
    series: null,
    games: [],
    topics: [],
    contentTypes: [],
    search: urlSearch,
  })
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Sync search filter with URL changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: urlSearch }))
  }, [urlSearch])

  const clearUrlSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    const newUrl = params.toString() ? `/members?${params.toString()}` : '/members'
    router.replace(newUrl, { scroll: false })
  }

  const handleClearFilters = () => {
    setFilters({
      readStatus: null,
      readingTime: [],
      series: null,
      games: [],
      topics: [],
      contentTypes: [],
      search: '',
    })
    clearUrlSearch()
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title with mobile filter button */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3">
                <HeroGlitch
                  minInterval={4}
                  maxInterval={10}
                  intensity={8}
                  dataCorruption
                  scanlines
                >
                  MEMBER ARTICLES
                </HeroGlitch>
              </h1>
              <p className="text-rga-gray max-w-2xl">
                Exclusive guides, builds, and community updates. Stay ahead with the
                latest strategies and news from the Rogue Army.
              </p>
            </div>

            {/* View mode toggle + Mobile filter button */}
            <div className="flex items-center gap-2 shrink-0">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-rga-green/30 rounded-lg text-rga-gray text-sm hover:border-rga-green/50 hover:text-rga-green transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop only */}
          <ArticleFilterSidebar
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={setFilters}
            onClearAll={clearUrlSearch}
          />

          {/* Article Feed */}
          <div className="flex-1 min-w-0">
            <ArticleFeed
              articles={articles}
              filters={filters}
              onClearFilters={handleClearFilters}
              progress={progress}
              viewMode={viewMode}
            />
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  )
}
