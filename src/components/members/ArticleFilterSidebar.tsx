'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, X, Check, Search, Gamepad2, FileText, Tag, Layers, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type FilterState,
  type FilterOptions,
  type TintColor,
  type ReadingTimeFilter,
  READING_TIME_RANGES,
  getTintClasses,
} from '@/lib/articles'

interface ArticleFilterSidebarProps {
  filterOptions: FilterOptions
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearAll?: () => void
}

export function ArticleFilterSidebar({
  filterOptions,
  filters,
  onFilterChange,
  onClearAll,
}: ArticleFilterSidebarProps) {
  const activeFilterCount =
    (filters.readStatus ? 1 : 0) +
    filters.readingTime.length +
    (filters.series ? 1 : 0) +
    filters.games.length +
    filters.topics.length +
    filters.contentTypes.length +
    (filters.search ? 1 : 0)

  const handleClearAll = () => {
    onFilterChange({
      readStatus: null,
      readingTime: [],
      series: null,
      games: [],
      topics: [],
      contentTypes: [],
      search: '',
    })
    onClearAll?.()
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-5">
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

        {/* Games - Multi-select Dropdown */}
        {filterOptions.games.length > 0 && (
          <FilterMultiDropdown
            label="Games"
            icon={<Gamepad2 className="w-3.5 h-3.5" />}
            values={filters.games}
            onChange={(vals) => onFilterChange({ ...filters, games: vals })}
            options={filterOptions.games.map((g) => ({
              value: g.id,
              label: g.name,
              tint: g.tint,
            }))}
            placeholder="All Games"
          />
        )}

        {/* Content Type - Multi-select Dropdown */}
        {filterOptions.contentTypes.length > 0 && (
          <FilterMultiDropdown
            label="Type"
            icon={<FileText className="w-3.5 h-3.5" />}
            values={filters.contentTypes}
            onChange={(vals) => onFilterChange({ ...filters, contentTypes: vals })}
            options={filterOptions.contentTypes.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            placeholder="All Types"
          />
        )}

        {/* Topics - Multi-select Dropdown */}
        {filterOptions.topics.length > 0 && (
          <FilterMultiDropdown
            label="Topics"
            icon={<Tag className="w-3.5 h-3.5" />}
            values={filters.topics}
            onChange={(vals) => onFilterChange({ ...filters, topics: vals })}
            options={filterOptions.topics.map((t) => ({
              value: t.id,
              label: t.name,
              tint: t.tint,
            }))}
            placeholder="All Topics"
          />
        )}

        {/* Series - Dropdown */}
        {filterOptions.series.length > 0 && (
          <FilterDropdown
            label="Series"
            icon={<Layers className="w-3.5 h-3.5" />}
            value={filters.series}
            onChange={(val) => onFilterChange({ ...filters, series: val })}
            options={[
              { value: null, label: 'All Series' },
              ...filterOptions.series.map((s) => ({
                value: s.slug,
                label: s.name,
                count: s.articleCount,
              })),
            ]}
          />
        )}

        {/* Reading Time - Pill buttons */}
        <div className="space-y-2.5">
          <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Length
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(READING_TIME_RANGES) as ReadingTimeFilter[]).map((key) => {
              const isActive = filters.readingTime.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => {
                    const newReadingTime = isActive
                      ? filters.readingTime.filter((t) => t !== key)
                      : [...filters.readingTime, key]
                    onFilterChange({ ...filters, readingTime: newReadingTime })
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-all',
                    isActive
                      ? 'border-rga-green bg-rga-green/20 text-rga-green'
                      : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
                  )}
                >
                  {READING_TIME_RANGES[key].description}
                </button>
              )
            })}
          </div>
        </div>

        {/* Read Status - Pill buttons */}
        <div className="space-y-2.5">
          <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: null, label: 'All' },
              { value: 'unread' as const, label: 'Unread' },
              { value: 'in_progress' as const, label: 'Reading' },
              { value: 'completed' as const, label: 'Done' },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => onFilterChange({ ...filters, readStatus: option.value })}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full border transition-all',
                  filters.readStatus === option.value
                    ? 'border-rga-green bg-rga-green/20 text-rga-green'
                    : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ============================================================================
// Compact Dropdown Components
// ============================================================================

interface DropdownOption {
  value: string | null
  label: string
  count?: number
}

interface FilterDropdownProps {
  label: string
  icon?: React.ReactNode
  value: string | null
  onChange: (value: string | null) => void
  options: DropdownOption[]
}

function FilterDropdown({ label, icon, value, onChange, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((o) => o.value === value) || options[0]
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    if (!isOpen) setSearch('')
  }, [isOpen])

  return (
    <div className="space-y-2.5">
      <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm',
            value
              ? 'border-rga-green/50 text-rga-green bg-rga-green/10'
              : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
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
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 bg-black/40 border border-rga-green/10 rounded-lg overflow-hidden">
                <div className="p-1.5 border-b border-rga-green/10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rga-gray/50" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-7 pr-2 py-1 bg-transparent border border-rga-gray/20 rounded text-xs text-white placeholder:text-rga-gray/50 focus:outline-none focus:border-rga-green/50"
                    />
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-rga-gray/50">No results</div>
                  ) : (
                    filteredOptions.map((option, i) => {
                      const isSelected = value === option.value
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            onChange(option.value)
                            setIsOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors',
                            isSelected
                              ? 'bg-rga-green/10 text-rga-green'
                              : 'text-rga-gray hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          <div className="flex items-center gap-1.5">
                            {option.count !== undefined && (
                              <span className="opacity-50">{option.count}</span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface MultiDropdownOption {
  value: string
  label: string
  tint?: TintColor
}

interface FilterMultiDropdownProps {
  label: string
  icon?: React.ReactNode
  values: string[]
  onChange: (values: string[]) => void
  options: MultiDropdownOption[]
  placeholder: string
}

function FilterMultiDropdown({
  label,
  icon,
  values,
  onChange,
  options,
  placeholder,
}: FilterMultiDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedCount = values.length
  const displayLabel =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
        ? options.find((o) => o.value === values[0])?.label || placeholder
        : `${selectedCount} selected`

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    if (!isOpen) setSearch('')
  }, [isOpen])

  return (
    <div className="space-y-2.5">
      <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm',
            selectedCount > 0
              ? 'border-rga-green/50 text-rga-green bg-rga-green/10'
              : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
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
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 bg-black/40 border border-rga-green/10 rounded-lg overflow-hidden">
                <div className="p-1.5 border-b border-rga-green/10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rga-gray/50" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-7 pr-2 py-1 bg-transparent border border-rga-gray/20 rounded text-xs text-white placeholder:text-rga-gray/50 focus:outline-none focus:border-rga-green/50"
                    />
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-rga-gray/50">No results</div>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = values.includes(option.value)
                      const tintClasses = option.tint ? getTintClasses(option.tint) : null
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleToggle(option.value)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors',
                            isSelected
                              ? tintClasses
                                ? `bg-black/20 ${tintClasses.text}`
                                : 'bg-rga-green/10 text-rga-green'
                              : 'text-rga-gray hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected && (
                            <Check className={cn('w-3.5 h-3.5', tintClasses?.text)} />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
