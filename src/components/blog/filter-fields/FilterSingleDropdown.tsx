'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SingleDropdownOption {
  value: string | null
  label: string
  count?: number
}

export interface FilterSingleDropdownProps {
  label: string
  icon?: React.ReactNode
  value: string | null
  onChange: (value: string | null) => void
  options: SingleDropdownOption[]
  isOpen?: boolean
  onToggle?: () => void
}

/**
 * Single-select dropdown with search for filter fields.
 * Used for Series filter.
 */
export function FilterSingleDropdown({
  label,
  icon,
  value,
  onChange,
  options,
  isOpen: controlledIsOpen,
  onToggle,
}: FilterSingleDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const handleToggle = onToggle ?? (() => setInternalIsOpen(!internalIsOpen))
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
          onClick={handleToggle}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm',
            value
              ? 'border-rga-green/50 text-rga-green bg-rga-green/10'
              : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
          )}
        >
          <span className="truncate">{selectedOption?.label}</span>
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
                            if (onToggle) onToggle()
                            else setInternalIsOpen(false)
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
