'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { X, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/shared/GlowButton'
import {
  type FilterState,
  type FilterOptions,
  type TintColor,
  getTintClasses,
} from '@/lib/articles'

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  filterOptions: FilterOptions
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  filterOptions,
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

  const handleReset = () => {
    onFilterChange({ games: [], topics: [], tags: [], search: filters.search })
  }

  const activeCount = filters.games.length + filters.topics.length + filters.tags.length

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
              {filterOptions.games.length > 0 && (
                <FilterGroup title="Games">
                  {filterOptions.games.map((game) => (
                    <FilterChip
                      key={game.id}
                      label={game.name}
                      active={filters.games.includes(game.id)}
                      onClick={() => handleGameToggle(game.id)}
                      tint={game.tint}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Topics */}
              {filterOptions.topics.length > 0 && (
                <FilterGroup title="Topics">
                  {filterOptions.topics.map((topic) => (
                    <FilterChip
                      key={topic.id}
                      label={topic.name}
                      active={filters.topics.includes(topic.id)}
                      onClick={() => handleTopicToggle(topic.id)}
                      tint={topic.tint}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Content Type (Tags) */}
              {filterOptions.tags.length > 0 && (
                <FilterGroup title="Content Type">
                  {filterOptions.tags.map((tag) => (
                    <FilterChip
                      key={tag.id}
                      label={tag.name}
                      active={filters.tags.includes(tag.id)}
                      onClick={() => handleTagToggle(tag.id)}
                    />
                  ))}
                </FilterGroup>
              )}
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
  tint?: TintColor
}

function FilterChip({ label, active, onClick, tint }: FilterChipProps) {
  const tintClasses = tint ? getTintClasses(tint) : null

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
