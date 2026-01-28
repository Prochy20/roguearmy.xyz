'use client'

import { cn } from '@/lib/utils'

export interface PillOption<T extends string | null> {
  value: T
  label: string
}

interface FilterPillsBaseProps {
  label: string
  icon?: React.ReactNode
}

interface FilterPillsSingleProps<T extends string | null> extends FilterPillsBaseProps {
  mode: 'single'
  value: T
  onChange: (value: T) => void
  options: PillOption<T>[]
}

interface FilterPillsMultiProps<T extends string> extends FilterPillsBaseProps {
  mode: 'multi'
  values: T[]
  onChange: (values: T[]) => void
  options: PillOption<T>[]
}

export type FilterPillsProps<T extends string | null> =
  | FilterPillsSingleProps<T>
  | FilterPillsMultiProps<T & string>

/**
 * Pill button group for filter fields.
 * Supports both single-select (radio) and multi-select (checkbox) modes.
 *
 * Used for Reading Time, Status, Completion Status, Size.
 */
export function FilterPills<T extends string | null>(props: FilterPillsProps<T>) {
  const { label, icon, options, mode } = props

  if (mode === 'single') {
    const { value, onChange } = props as FilterPillsSingleProps<T>
    return (
      <div className="space-y-2.5">
        <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => onChange(option.value)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full border transition-all',
                value === option.value
                  ? 'border-rga-green bg-rga-green/20 text-rga-green'
                  : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Multi-select mode
  const { values, onChange } = props as FilterPillsMultiProps<T & string>
  return (
    <div className="space-y-2.5">
      <label className="text-xs text-rga-gray/70 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = values.includes(option.value as T & string)
          return (
            <button
              key={option.value}
              onClick={() => {
                if (isActive) {
                  onChange(values.filter((v) => v !== option.value))
                } else {
                  onChange([...values, option.value as T & string])
                }
              }}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full border transition-all',
                isActive
                  ? 'border-rga-green bg-rga-green/20 text-rga-green'
                  : 'border-rga-gray/30 text-rga-gray hover:border-rga-gray/50'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
