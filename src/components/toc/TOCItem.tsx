'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TOCHeading } from '@/lib/toc'

interface TOCItemProps {
  heading: TOCHeading
  isActive: boolean
  onClick: (id: string) => void
}

/**
 * Individual TOC link with cyberpunk styling.
 * Green active state, cyan hover, left accent line.
 */
export const TOCItem = forwardRef<HTMLButtonElement, TOCItemProps>(
  function TOCItem({ heading, isActive, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onClick(heading.id)}
        className={cn(
          'group relative w-full text-left font-mono text-xs leading-relaxed transition-all duration-200',
          'pl-3 py-1.5 border-l-2',
          // Indentation for H2 and H3 (H1 is top level)
          heading.level === 2 && 'ml-3',
          heading.level === 3 && 'ml-6',
          // Active state
          isActive
            ? 'text-rga-green border-l-rga-green'
            : 'text-rga-gray/70 border-l-transparent hover:text-rga-cyan hover:border-l-rga-cyan/50'
        )}
      >
        <span
          className={cn(
            'block line-clamp-2 transition-transform duration-200',
            'group-hover:translate-x-0.5',
            isActive && 'font-medium'
          )}
        >
          {heading.text}
        </span>

        {/* Active glow effect */}
        {isActive && (
          <span
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-rga-green blur-sm"
            aria-hidden="true"
          />
        )}
      </button>
    )
  }
)
