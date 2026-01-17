'use client'

import { useState } from 'react'
import { MembersHeader } from './MembersHeader'
import { ArticleFeed } from './ArticleFeed'
import { ArticleFilterSidebar } from './ArticleFilterSidebar'
import { FilterBottomSheet } from './FilterBottomSheet'
import { HeroGlitch } from '@/components/effects'
import { type Article, type FilterState, type FilterOptions } from '@/lib/articles'

interface MemberInfo {
  discordId: string
  avatar: string | null
  username: string
  globalName: string | null
}

interface MembersArticlesPageProps {
  member: MemberInfo
  articles: Article[]
  filterOptions: FilterOptions
}

export function MembersArticlesPage({
  member,
  articles,
  filterOptions,
}: MembersArticlesPageProps) {
  const [filters, setFilters] = useState<FilterState>({
    games: [],
    topics: [],
    tags: [],
    search: '',
  })
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const handleClearFilters = () => {
    setFilters({ games: [], topics: [], tags: [], search: '' })
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <MembersHeader
        member={member}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        onMobileFilterOpen={() => setIsFilterSheetOpen(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
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

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop only */}
          <ArticleFilterSidebar
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* Article Feed */}
          <div className="flex-1 min-w-0">
            <ArticleFeed
              articles={articles}
              filters={filters}
              onClearFilters={handleClearFilters}
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
