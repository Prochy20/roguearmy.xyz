'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { SeriesGrid } from '@/components/members/SeriesGrid'
import { SeriesFilterSidebar } from '@/components/members/SeriesFilterSidebar'
import { SeriesFilterBottomSheet } from '@/components/members/SeriesFilterBottomSheet'
import { EmptyState } from '@/components/members/EmptyState'
import { HeroGlitch } from '@/components/effects'
import {
  type SeriesFilterState,
  type SeriesFilterOptions,
  type SeriesWithFilterData,
  filterSeries,
  parseSeriesFiltersFromUrl,
  serializeSeriesFiltersToUrl,
  getDefaultSeriesFilterState,
  hasActiveFilters,
} from '@/lib/series'

interface BlogSeriesPageProps {
  series: SeriesWithFilterData[]
  filterOptions: SeriesFilterOptions
  isAuthenticated?: boolean
}

export function BlogSeriesPage({ series, filterOptions, isAuthenticated = false }: BlogSeriesPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL
  const [filters, setFilters] = useState<SeriesFilterState>(() =>
    parseSeriesFiltersFromUrl(searchParams)
  )
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Sync filters with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = parseSeriesFiltersFromUrl(searchParams)
    setFilters(urlFilters)
  }, [searchParams])

  // Update URL when filters change
  const updateFiltersAndUrl = useCallback(
    (newFilters: SeriesFilterState) => {
      setFilters(newFilters)

      const params = serializeSeriesFiltersToUrl(newFilters)
      const newUrl = params.toString()
        ? `/blog/series?${params.toString()}`
        : '/blog/series'
      router.replace(newUrl, { scroll: false })
    },
    [router]
  )

  const handleClearFilters = useCallback(() => {
    updateFiltersAndUrl(getDefaultSeriesFilterState())
  }, [updateFiltersAndUrl])

  // Filter series client-side
  const filteredSeries = filterSeries(series, filters)

  return (
    <div className="min-h-screen bg-void">
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
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
                  ARTICLE SERIES
                </HeroGlitch>
              </h1>
              <p className="text-rga-gray max-w-2xl">
                Deep-dive guide collections organized by topic. Work through each
                series at your own pace{isAuthenticated ? ' and track your progress' : ''}.
              </p>
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-rga-green/30 rounded-lg text-rga-gray text-sm hover:border-rga-green/50 hover:text-rga-green transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop only */}
          <SeriesFilterSidebar
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={updateFiltersAndUrl}
            onClearAll={handleClearFilters}
          />

          {/* Series Grid */}
          <div className="flex-1 min-w-0">
            {filteredSeries.length === 0 && hasActiveFilters(filters) ? (
              <EmptyState
                onClearFilters={handleClearFilters}
                message="No series match your current filters. Try adjusting your selection or clear all filters to see everything."
              />
            ) : (
              <SeriesGrid series={filteredSeries} />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Sheet */}
      <SeriesFilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={updateFiltersAndUrl}
      />
    </div>
  )
}
