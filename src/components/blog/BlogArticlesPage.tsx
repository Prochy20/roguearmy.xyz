'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gamepad2, FileText, Tag, Layers, Clock, BookOpen } from 'lucide-react'
import { BlogArticleFeed } from './BlogArticleFeed'
import { BlogFilterDrawer } from './BlogFilterDrawer'
import { BlogFilterButton } from './BlogFilterButton'
import { ViewModeToggle } from '@/components/members/ViewModeToggle'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import {
  FilterMultiDropdown,
  FilterSingleDropdown,
  FilterPills,
} from '@/components/blog/filter-fields'
import {
  type Article,
  type FilterState,
  type FilterOptions,
  type ReadingTimeFilter,
  READING_TIME_RANGES,
} from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { useViewMode } from '@/hooks/useViewMode'

interface BlogArticlesPageProps {
  articles: Article[]
  filterOptions: FilterOptions
  progress?: Record<string, ArticleProgress>
  isAuthenticated?: boolean
}

type DropdownId = 'games' | 'type' | 'topics' | 'series'

export function BlogArticlesPage({
  articles,
  filterOptions,
  progress,
  isAuthenticated = false,
}: BlogArticlesPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { viewMode, setViewMode, isHydrated } = useViewMode()

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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null)

  // Sync search filter with URL changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: urlSearch }))
  }, [urlSearch])

  // Close dropdowns when drawer closes
  useEffect(() => {
    if (!isFilterDrawerOpen) {
      setOpenDropdown(null)
    }
  }, [isFilterDrawerOpen])

  const clearUrlSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    const newUrl = params.toString() ? `/blog?${params.toString()}` : '/blog'
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
    setOpenDropdown(null)
  }

  // Count active filters (excluding search which is in URL, and readStatus for anonymous users)
  const activeFilterCount =
    (isAuthenticated && filters.readStatus ? 1 : 0) +
    filters.readingTime.length +
    (filters.series ? 1 : 0) +
    filters.games.length +
    filters.topics.length +
    filters.contentTypes.length

  return (
    <div className="min-h-screen bg-void">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title with toolbar */}
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
                  BLOG
                </HeroGlitch>
              </h1>
              <p className="text-rga-gray max-w-2xl">
                Guides, builds, and community updates. Stay ahead with the
                latest strategies and news from the Rogue Army.
              </p>
            </div>

            {/* Toolbar: View mode toggle + Filter button */}
            <div className="flex items-center gap-2 shrink-0">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <BlogFilterButton
                activeCount={activeFilterCount}
                onClick={() => setIsFilterDrawerOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Full-width content layout */}
        <div className="w-full">
          {/* Article Feed - fade in after hydration to prevent view mode bounce */}
          <div
            className="transition-opacity duration-200"
            style={{ opacity: isHydrated ? 1 : 0 }}
          >
            <BlogArticleFeed
              articles={articles}
              filters={filters}
              onClearFilters={handleClearFilters}
              progress={progress}
              viewMode={viewMode}
              isAuthenticated={isAuthenticated}
            />
          </div>
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
        {/* Games - Multi-select Dropdown */}
        {filterOptions.games.length > 0 && (
          <FilterMultiDropdown
            label="Games"
            icon={<Gamepad2 className="w-3.5 h-3.5" />}
            values={filters.games}
            onChange={(vals) => setFilters({ ...filters, games: vals })}
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

        {/* Content Type - Multi-select Dropdown */}
        {filterOptions.contentTypes.length > 0 && (
          <FilterMultiDropdown
            label="Type"
            icon={<FileText className="w-3.5 h-3.5" />}
            values={filters.contentTypes}
            onChange={(vals) => setFilters({ ...filters, contentTypes: vals })}
            options={filterOptions.contentTypes.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            placeholder="All Types"
            isOpen={openDropdown === 'type'}
            onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
          />
        )}

        {/* Topics - Multi-select Dropdown */}
        {filterOptions.topics.length > 0 && (
          <FilterMultiDropdown
            label="Topics"
            icon={<Tag className="w-3.5 h-3.5" />}
            values={filters.topics}
            onChange={(vals) => setFilters({ ...filters, topics: vals })}
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

        {/* Series - Single-select Dropdown */}
        {filterOptions.series.length > 0 && (
          <FilterSingleDropdown
            label="Series"
            icon={<Layers className="w-3.5 h-3.5" />}
            value={filters.series}
            onChange={(val) => setFilters({ ...filters, series: val })}
            options={[
              { value: null, label: 'All Series' },
              ...filterOptions.series.map((s) => ({
                value: s.slug,
                label: s.name,
                count: s.articleCount,
              })),
            ]}
            isOpen={openDropdown === 'series'}
            onToggle={() => setOpenDropdown(openDropdown === 'series' ? null : 'series')}
          />
        )}

        {/* Reading Time - Multi-select Pills */}
        <FilterPills
          mode="multi"
          label="Length"
          icon={<Clock className="w-3.5 h-3.5" />}
          values={filters.readingTime}
          onChange={(vals) => setFilters({ ...filters, readingTime: vals })}
          options={(Object.keys(READING_TIME_RANGES) as ReadingTimeFilter[]).map((key) => ({
            value: key,
            label: READING_TIME_RANGES[key].description,
          }))}
        />

        {/* Read Status - Single-select Pills (authenticated users only) */}
        {isAuthenticated && (
          <FilterPills
            mode="single"
            label="Status"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            value={filters.readStatus}
            onChange={(val) => setFilters({ ...filters, readStatus: val })}
            options={[
              { value: null, label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'in_progress', label: 'Reading' },
              { value: 'completed', label: 'Done' },
            ]}
          />
        )}
      </BlogFilterDrawer>
    </div>
  )
}
