'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { X, Check, RotateCcw, ChevronDown, Layers, BookOpen, Gamepad2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/shared/GlowButton'
import { getTintClasses, type TintColor } from '@/lib/articles'
import {
  type SeriesFilterState,
  type SeriesFilterOptions,
  type SeriesCompletionStatus,
  type SeriesSize,
  SERIES_SIZE_RANGES,
  countActiveFilters,
  getDefaultSeriesFilterState,
} from '@/lib/series'

interface SeriesFilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  filterOptions: SeriesFilterOptions
  filters: SeriesFilterState
  onFilterChange: (filters: SeriesFilterState) => void
}

export function SeriesFilterBottomSheet({
  isOpen,
  onClose,
  filterOptions,
  filters,
  onFilterChange,
}: SeriesFilterBottomSheetProps) {
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

  // Completion Status handlers
  const handleCompletionStatusChange = (status: SeriesCompletionStatus) => {
    onFilterChange({ ...filters, completionStatus: status })
  }

  // Size handlers
  const handleSizeToggle = (size: SeriesSize) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    onFilterChange({ ...filters, sizes: newSizes })
  }

  const handleReset = () => {
    onFilterChange(getDefaultSeriesFilterState())
  }

  const activeCount = countActiveFilters(filters)

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
              {/* Completion Status */}
              <FilterGroup title="Progress" icon={<BookOpen className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all' as const, label: 'All' },
                    { value: 'not_started' as const, label: 'Not Started' },
                    { value: 'in_progress' as const, label: 'In Progress' },
                    { value: 'completed' as const, label: 'Completed' },
                  ].map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      active={filters.completionStatus === option.value}
                      onClick={() => handleCompletionStatusChange(option.value)}
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Size */}
              <FilterGroup title="Series Size" icon={<Layers className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SERIES_SIZE_RANGES) as SeriesSize[]).map((key) => (
                    <FilterChip
                      key={key}
                      label={`${SERIES_SIZE_RANGES[key].label} (${SERIES_SIZE_RANGES[key].description})`}
                      active={filters.sizes.includes(key)}
                      onClick={() => handleSizeToggle(key)}
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Games */}
              {filterOptions.games.length > 0 && (
                <FilterGroup title="Games" icon={<Gamepad2 className="w-4 h-4" />}>
                  <MobileFilterMultiSelect
                    values={filters.games}
                    onChange={(vals) => onFilterChange({ ...filters, games: vals })}
                    options={filterOptions.games.map((g) => ({
                      value: g.id,
                      label: g.name,
                      tint: g.tint,
                    }))}
                    placeholder="All Games"
                  />
                </FilterGroup>
              )}

              {/* Topics */}
              {filterOptions.topics.length > 0 && (
                <FilterGroup title="Topics" icon={<Tag className="w-4 h-4" />}>
                  <MobileFilterMultiSelect
                    values={filters.topics}
                    onChange={(vals) => onFilterChange({ ...filters, topics: vals })}
                    options={filterOptions.topics.map((t) => ({
                      value: t.id,
                      label: t.name,
                      tint: t.tint,
                    }))}
                    placeholder="All Topics"
                  />
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
  value: string
  label: string
  tint?: TintColor
}

interface MobileFilterMultiSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  options: MobileFilterSelectOption[]
  placeholder: string
}

function MobileFilterMultiSelect({
  values,
  onChange,
  options,
  placeholder,
}: MobileFilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedCount = values.length
  const displayLabel =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
        ? options.find((o) => o.value === values[0])?.label || placeholder
        : `${selectedCount} selected`

  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm',
          selectedCount > 0
            ? 'border-rga-green/50 text-rga-green bg-rga-green/10'
            : 'border-rga-gray/30 text-rga-gray'
        )}
      >
        <span className="truncate">{displayLabel}</span>
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
            <div className="mt-2 bg-black/30 border border-rga-green/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {options.map((option) => {
                const isSelected = values.includes(option.value)
                const tintClasses = option.tint ? getTintClasses(option.tint) : null
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors',
                      isSelected
                        ? tintClasses
                          ? `bg-black/20 ${tintClasses.text}`
                          : 'bg-rga-green/10 text-rga-green'
                        : 'text-rga-gray hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className={cn('w-4 h-4', tintClasses?.text)} />
                    )}
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
