'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gamepad2, Tag, Layers, BookOpen } from 'lucide-react'
import { SeriesGrid } from '@/components/members/SeriesGrid'
import { BlogFilterDrawer } from './BlogFilterDrawer'
import { BlogFilterButton } from './BlogFilterButton'
import { EmptyState } from '@/components/members/EmptyState'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { FilterMultiDropdown, FilterPills } from '@/components/blog/filter-fields'
import {
  type SeriesFilterState,
  type SeriesFilterOptions,
  type SeriesWithFilterData,
  type SeriesSize,
  filterSeries,
  parseSeriesFiltersFromUrl,
  serializeSeriesFiltersToUrl,
  getDefaultSeriesFilterState,
  hasActiveFilters,
  SERIES_SIZE_RANGES,
} from '@/lib/series'

interface BlogSeriesPageProps {
  series: SeriesWithFilterData[]
  filterOptions: SeriesFilterOptions
  isAuthenticated?: boolean
}

type DropdownId = 'games' | 'topics'

export function BlogSeriesPage({ series, filterOptions, isAuthenticated = false }: BlogSeriesPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL
  const [filters, setFilters] = useState<SeriesFilterState>(() =>
    parseSeriesFiltersFromUrl(searchParams)
  )
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null)

  // Sync filters with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = parseSeriesFiltersFromUrl(searchParams)
    setFilters(urlFilters)
  }, [searchParams])

  // Close dropdowns when drawer closes
  useEffect(() => {
    if (!isFilterDrawerOpen) {
      setOpenDropdown(null)
    }
  }, [isFilterDrawerOpen])

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
    setOpenDropdown(null)
  }, [updateFiltersAndUrl])

  // Filter series client-side
  const filteredSeries = filterSeries(series, filters)

  // Count active filters (exclude completionStatus for anonymous users)
  const activeFilterCount =
    (isAuthenticated && filters.completionStatus !== 'all' ? 1 : 0) +
    filters.sizes.length +
    filters.games.length +
    filters.topics.length

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

            {/* Filter button */}
            <BlogFilterButton
              activeCount={activeFilterCount}
              onClick={() => setIsFilterDrawerOpen(true)}
              className="shrink-0"
            />
          </div>
        </div>

        {/* Full-width content layout */}
        <div className="w-full">
          {filteredSeries.length === 0 && hasActiveFilters(filters) ? (
            <EmptyState
              onClearFilters={handleClearFilters}
              message="No series match your current filters. Try adjusting your selection or clear all filters to see everything."
            />
          ) : (
            <SeriesGrid series={filteredSeries} />
          )}
        </div>
      </main>

      {/* Filter Drawer */}
      <BlogFilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        title="Filters"
        activeCount={activeFilterCount}
        onClearAll={handleClearFilters}
      >
        {/* Completion Status - Single-select Pills (authenticated users only) */}
        {isAuthenticated && (
          <FilterPills
            mode="single"
            label="Progress"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            value={filters.completionStatus}
            onChange={(val) => updateFiltersAndUrl({ ...filters, completionStatus: val ?? 'all' })}
            options={[
              { value: 'all', label: 'All' },
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        )}

        {/* Size - Multi-select Pills */}
        <FilterPills
          mode="multi"
          label="Size"
          icon={<Layers className="w-3.5 h-3.5" />}
          values={filters.sizes}
          onChange={(vals) => updateFiltersAndUrl({ ...filters, sizes: vals })}
          options={(Object.keys(SERIES_SIZE_RANGES) as SeriesSize[]).map((key) => ({
            value: key,
            label: SERIES_SIZE_RANGES[key].description,
          }))}
        />

        {/* Games - Multi-select Dropdown */}
        {filterOptions.games.length > 0 && (
          <FilterMultiDropdown
            label="Games"
            icon={<Gamepad2 className="w-3.5 h-3.5" />}
            values={filters.games}
            onChange={(vals) => updateFiltersAndUrl({ ...filters, games: vals })}
            options={filterOptions.games.map((g) => ({
              value: g.id,
              label: g.name,
              tint: g.tint,
            }))}
            placeholder="All Games"
            isOpen={openDropdown === 'games'}
            onToggle={() => setOpenDropdown(openDropdown === 'games' ? null : 'games')}
          />
        )}

        {/* Topics - Multi-select Dropdown */}
        {filterOptions.topics.length > 0 && (
          <FilterMultiDropdown
            label="Topics"
            icon={<Tag className="w-3.5 h-3.5" />}
            values={filters.topics}
            onChange={(vals) => updateFiltersAndUrl({ ...filters, topics: vals })}
            options={filterOptions.topics.map((t) => ({
              value: t.id,
              label: t.name,
              tint: t.tint,
            }))}
            placeholder="All Topics"
            isOpen={openDropdown === 'topics'}
            onToggle={() => setOpenDropdown(openDropdown === 'topics' ? null : 'topics')}
          />
        )}
      </BlogFilterDrawer>
    </div>
  )
}
