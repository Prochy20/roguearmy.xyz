'use client'

import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BlogFilterButtonProps {
  activeCount: number
  onClick: () => void
  className?: string
}

/**
 * Filter button with active count badge.
 * Styled to match ViewModeToggle for visual consistency.
 */
export function BlogFilterButton({
  activeCount,
  onClick,
  className,
}: BlogFilterButtonProps) {
  const hasActiveFilters = activeCount > 0

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'inline-flex items-center p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm',
          className
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              aria-label={hasActiveFilters ? `Filters (${activeCount} active)` : 'Filters'}
              className={cn(
                'relative flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200',
                hasActiveFilters
                  ? 'text-rga-green bg-rga-green/10'
                  : 'text-rga-gray/60 hover:text-rga-gray hover:bg-white/5'
              )}
            >
              {/* Active state glow */}
              {hasActiveFilters && (
                <div className="absolute inset-0 rounded-sm border border-rga-green/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]" />
              )}

              {/* Corner accents for active state */}
              {hasActiveFilters && (
                <>
                  <span className="absolute top-0 left-0 w-1.5 h-px bg-rga-green" />
                  <span className="absolute top-0 left-0 w-px h-1.5 bg-rga-green" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-px bg-rga-green" />
                  <span className="absolute bottom-0 right-0 w-px h-1.5 bg-rga-green" />
                </>
              )}

              <SlidersHorizontal className="w-4 h-4 relative z-10" />

              {/* Badge for active count */}
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold bg-rga-green text-void rounded-full z-20">
                  {activeCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {hasActiveFilters ? `${activeCount} filter${activeCount === 1 ? '' : 's'} active` : 'Filters'}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
