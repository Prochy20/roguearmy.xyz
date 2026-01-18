'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { X, Check, RotateCcw, ChevronDown, Clock, BookOpen, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/shared/GlowButton'
import {
  type FilterState,
  type FilterOptions,
  type TintColor,
  type ReadStatusFilter,
  type ReadingTimeFilter,
  READING_TIME_RANGES,
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

  // Read Status handlers
  const handleReadStatusChange = (status: ReadStatusFilter) => {
    onFilterChange({ ...filters, readStatus: status })
  }

  // Reading Time handlers
  const handleReadingTimeToggle = (time: ReadingTimeFilter) => {
    const newReadingTime = filters.readingTime.includes(time)
      ? filters.readingTime.filter((t) => t !== time)
      : [...filters.readingTime, time]
    onFilterChange({ ...filters, readingTime: newReadingTime })
  }

  // Series handlers
  const handleSeriesChange = (slug: string | null) => {
    onFilterChange({ ...filters, series: slug })
  }

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

  const handleContentTypeToggle = (id: string) => {
    const newContentTypes = filters.contentTypes.includes(id)
      ? filters.contentTypes.filter((t) => t !== id)
      : [...filters.contentTypes, id]
    onFilterChange({ ...filters, contentTypes: newContentTypes })
  }

  const handleReset = () => {
    onFilterChange({
      readStatus: null,
      readingTime: [],
      series: null,
      games: [],
      topics: [],
      contentTypes: [],
      search: filters.search,
    })
  }

  const activeCount =
    (filters.readStatus ? 1 : 0) +
    filters.readingTime.length +
    (filters.series ? 1 : 0) +
    filters.games.length +
    filters.topics.length +
    filters.contentTypes.length

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
              {/* Read Status */}
              <FilterGroup title="Read Status" icon={<BookOpen className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: null, label: 'All' },
                    { value: 'unread' as const, label: 'Unread' },
                    { value: 'in_progress' as const, label: 'In Progress' },
                    { value: 'completed' as const, label: 'Completed' },
                  ].map((option) => (
                    <FilterChip
                      key={option.label}
                      label={option.label}
                      active={filters.readStatus === option.value}
                      onClick={() => handleReadStatusChange(option.value)}
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Reading Time */}
              <FilterGroup title="Reading Time" icon={<Clock className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(READING_TIME_RANGES) as ReadingTimeFilter[]).map((key) => (
                    <FilterChip
                      key={key}
                      label={`${READING_TIME_RANGES[key].label} (${READING_TIME_RANGES[key].description})`}
                      active={filters.readingTime.includes(key)}
                      onClick={() => handleReadingTimeToggle(key)}
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Series */}
              {filterOptions.series.length > 0 && (
                <FilterGroup title="Series" icon={<Layers className="w-4 h-4" />}>
                  <MobileFilterSelect
                    value={filters.series}
                    onChange={handleSeriesChange}
                    options={[
                      { value: null, label: 'All Series' },
                      ...filterOptions.series.map((s) => ({
                        value: s.slug,
                        label: s.name,
                        count: s.articleCount,
                      })),
                    ]}
                  />
                </FilterGroup>
              )}

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

              {/* Content Type */}
              {filterOptions.contentTypes.length > 0 && (
                <FilterGroup title="Content Type">
                  {filterOptions.contentTypes.map((contentType) => (
                    <FilterChip
                      key={contentType.id}
                      label={contentType.name}
                      active={filters.contentTypes.includes(contentType.id)}
                      onClick={() => handleContentTypeToggle(contentType.id)}
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
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-rga-gray text-sm font-medium mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
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

interface MobileFilterSelectOption {
  value: string | null
  label: string
  count?: number
}

interface MobileFilterSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: MobileFilterSelectOption[]
}

function MobileFilterSelect({ value, onChange, options }: MobileFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((o) => o.value === value) || options[0]

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm',
          value
            ? 'border-rga-green/50 text-rga-green bg-rga-green/10'
            : 'border-rga-gray/30 text-rga-gray'
        )}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform ml-2',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-black/30 border border-rga-green/10 rounded-lg overflow-hidden">
              {options.map((option, index) => {
                const isSelected = value === option.value
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors',
                      isSelected
                        ? 'bg-rga-green/10 text-rga-green'
                        : 'text-rga-gray hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    <div className="flex items-center gap-2">
                      {option.count !== undefined && (
                        <span className="text-xs opacity-60">{option.count}</span>
                      )}
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
