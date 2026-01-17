'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { X, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/shared/GlowButton'
import {
  type ArticleCategory,
  type ArticleTag,
  type FilterState,
  getCategoryTintClasses,
} from '@/lib/articles'

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: ArticleCategory[]
  tags: ArticleTag[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  categories,
  tags,
  filters,
  onFilterChange,
}: FilterBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  const handleReset = () => {
    onFilterChange({ categories: [], tags: [], search: filters.search })
  }

  const activeCount = filters.categories.length + filters.tags.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-bg-elevated border-t border-rga-green/20 rounded-t-2xl max-h-[85vh] overflow-hidden"
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-rga-gray/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-rga-green/10">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-lg">Filters</h2>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 bg-rga-green/20 text-rga-green text-xs rounded-full">
                    {activeCount} active
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-rga-gray hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-4 py-4 space-y-6">
              {/* Games */}
              <FilterGroup title="Games">
                {categories
                  .filter((c) =>
                    ['path-of-exile', 'path-of-exile-2', 'diablo-4', 'last-epoch'].includes(c.slug)
                  )
                  .map((category) => (
                    <FilterChip
                      key={category.slug}
                      label={category.name}
                      active={filters.categories.includes(category.slug)}
                      onClick={() => handleCategoryToggle(category.slug)}
                      tint={category.tint}
                    />
                  ))}
              </FilterGroup>

              {/* Topics */}
              <FilterGroup title="Topics">
                {categories
                  .filter((c) => ['community', 'general'].includes(c.slug))
                  .map((category) => (
                    <FilterChip
                      key={category.slug}
                      label={category.name}
                      active={filters.categories.includes(category.slug)}
                      onClick={() => handleCategoryToggle(category.slug)}
                      tint={category.tint}
                    />
                  ))}
              </FilterGroup>

              {/* Content Type */}
              <FilterGroup title="Content Type">
                {tags.map((tag) => (
                  <FilterChip
                    key={tag.slug}
                    label={tag.name}
                    active={filters.tags.includes(tag.slug)}
                    onClick={() => handleTagToggle(tag.slug)}
                  />
                ))}
              </FilterGroup>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-4 border-t border-rga-green/10 bg-bg-elevated">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-rga-gray/30 rounded-lg text-rga-gray hover:border-rga-gray/50 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <GlowButton
                onClick={onClose}
                glowColor="green"
                pulse={false}
                className="flex-1 py-3"
              >
                Apply Filters
              </GlowButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-rga-gray text-sm font-medium mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  tint?: ArticleCategory['tint']
}

function FilterChip({ label, active, onClick, tint }: FilterChipProps) {
  const tintClasses = tint ? getCategoryTintClasses(tint) : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all',
        active
          ? tintClasses
            ? `${tintClasses.bg} ${tintClasses.border} ${tintClasses.text}`
            : 'bg-rga-green/20 border-rga-green text-rga-green'
          : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
      )}
    >
      {active && <Check className="w-3 h-3" />}
      {label}
    </button>
  )
}
