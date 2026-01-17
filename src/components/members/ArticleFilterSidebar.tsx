'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type FilterState,
  type FilterOptions,
  type TintColor,
  getTintClasses,
} from '@/lib/articles'

interface ArticleFilterSidebarProps {
  filterOptions: FilterOptions
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function ArticleFilterSidebar({
  filterOptions,
  filters,
  onFilterChange,
}: ArticleFilterSidebarProps) {
  const activeFilterCount =
    filters.games.length + filters.topics.length + filters.tags.length + (filters.search ? 1 : 0)

  const handleGameToggle = (id: string) => {
    const newGames = filters.games.includes(id)
      ? filters.games.filter((g) => g !== id)
      : [...filters.games, id]
    onFilterChange({ ...filters, games: newGames })
  }

  const handleTopicToggle = (id: string) => {
    const newTopics = filters.topics.includes(id)
      ? filters.topics.filter((t) => t !== id)
      : [...filters.topics, id]
    onFilterChange({ ...filters, topics: newTopics })
  }

  const handleTagToggle = (id: string) => {
    const newTags = filters.tags.includes(id)
      ? filters.tags.filter((t) => t !== id)
      : [...filters.tags, id]
    onFilterChange({ ...filters, tags: newTags })
  }

  const handleClearAll = () => {
    onFilterChange({ games: [], topics: [], tags: [], search: '' })
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Filters</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rga-gray hover:text-rga-green transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Games Section */}
        {filterOptions.games.length > 0 && (
          <FilterSection title="Games" defaultOpen>
            <div className="space-y-2">
              {filterOptions.games.map((game) => (
                <FilterCheckbox
                  key={game.id}
                  label={game.name}
                  checked={filters.games.includes(game.id)}
                  onChange={() => handleGameToggle(game.id)}
                  tint={game.tint}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Topics Section */}
        {filterOptions.topics.length > 0 && (
          <FilterSection title="Topics" defaultOpen>
            <div className="space-y-2">
              {filterOptions.topics.map((topic) => (
                <FilterCheckbox
                  key={topic.id}
                  label={topic.name}
                  checked={filters.topics.includes(topic.id)}
                  onChange={() => handleTopicToggle(topic.id)}
                  tint={topic.tint}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Tags Section */}
        {filterOptions.tags.length > 0 && (
          <FilterSection title="Content Type" defaultOpen>
            <div className="space-y-2">
              {filterOptions.tags.map((tag) => (
                <FilterCheckbox
                  key={tag.id}
                  label={tag.name}
                  checked={filters.tags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
              ))}
            </div>
          </FilterSection>
        )}
      </div>
    </aside>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-rga-green/10 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-rga-gray text-sm font-medium">{title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-rga-gray/60 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: () => void
  tint?: TintColor
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  tint,
}: FilterCheckboxProps) {
  const tintClasses = tint ? getTintClasses(tint) : null

  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 cursor-pointer group w-full text-left"
    >
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
          checked
            ? tintClasses
              ? `${tintClasses.bg} ${tintClasses.border}`
              : 'bg-rga-green/20 border-rga-green'
            : 'border-rga-gray/30 group-hover:border-rga-gray/50'
        )}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check
                className={cn(
                  'w-3 h-3',
                  tintClasses ? tintClasses.text : 'text-rga-green'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span
        className={cn(
          'text-sm transition-colors',
          checked
            ? tintClasses
              ? tintClasses.text
              : 'text-rga-green'
            : 'text-rga-gray group-hover:text-white'
        )}
      >
        {label}
      </span>
    </button>
  )
}
