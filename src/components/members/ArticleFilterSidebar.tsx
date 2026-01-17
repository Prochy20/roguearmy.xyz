'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type ArticleCategory,
  type ArticleTag,
  type FilterState,
  getCategoryTintClasses,
} from '@/lib/articles'

interface ArticleFilterSidebarProps {
  categories: ArticleCategory[]
  tags: ArticleTag[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function ArticleFilterSidebar({
  categories,
  tags,
  filters,
  onFilterChange,
}: ArticleFilterSidebarProps) {
  const activeFilterCount =
    filters.categories.length + filters.tags.length + (filters.search ? 1 : 0)

  const handleCategoryToggle = (slug: string) => {
    const newCategories = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug]
    onFilterChange({ ...filters, categories: newCategories })
  }

  const handleTagToggle = (slug: string) => {
    const newTags = filters.tags.includes(slug)
      ? filters.tags.filter((t) => t !== slug)
      : [...filters.tags, slug]
    onFilterChange({ ...filters, tags: newTags })
  }

  const handleClearAll = () => {
    onFilterChange({ categories: [], tags: [], search: '' })
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

        {/* Games Category Section */}
        <FilterSection title="Games" defaultOpen>
          <div className="space-y-2">
            {categories
              .filter((c) =>
                ['path-of-exile', 'path-of-exile-2', 'diablo-4', 'last-epoch'].includes(c.slug)
              )
              .map((category) => (
                <FilterCheckbox
                  key={category.slug}
                  label={category.name}
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => handleCategoryToggle(category.slug)}
                  tint={category.tint}
                />
              ))}
          </div>
        </FilterSection>

        {/* General Category Section */}
        <FilterSection title="Topics" defaultOpen>
          <div className="space-y-2">
            {categories
              .filter((c) =>
                ['community', 'general'].includes(c.slug)
              )
              .map((category) => (
                <FilterCheckbox
                  key={category.slug}
                  label={category.name}
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => handleCategoryToggle(category.slug)}
                  tint={category.tint}
                />
              ))}
          </div>
        </FilterSection>

        {/* Content Type Tags */}
        <FilterSection title="Content Type" defaultOpen>
          <div className="space-y-2">
            {tags.map((tag) => (
              <FilterCheckbox
                key={tag.slug}
                label={tag.name}
                checked={filters.tags.includes(tag.slug)}
                onChange={() => handleTagToggle(tag.slug)}
              />
            ))}
          </div>
        </FilterSection>
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
  tint?: ArticleCategory['tint']
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  tint,
}: FilterCheckboxProps) {
  const tintClasses = tint ? getCategoryTintClasses(tint) : null

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
