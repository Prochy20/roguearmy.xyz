'use client'

import { LayoutGrid, Grid3x3, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/hooks/useViewMode'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

const modes: { value: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { value: 'featured', icon: LayoutGrid, label: 'Featured view' },
  { value: 'grid', icon: Grid3x3, label: 'Grid view' },
  { value: 'list', icon: List, label: 'List view' },
]

/**
 * Cyberpunk-styled view mode toggle for article listings
 * Allows switching between featured, grid, and list views
 */
export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
}: ViewModeToggleProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm',
          className
        )}
        role="radiogroup"
        aria-label="View mode"
      >
        {modes.map(({ value, icon: Icon, label }) => {
          const isActive = viewMode === value

          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange(value)}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={label}
                  className={cn(
                    'relative flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200',
                    isActive
                      ? 'text-rga-green bg-rga-green/10'
                      : 'text-rga-gray/60 hover:text-rga-gray hover:bg-white/5'
                  )}
                >
                  {/* Active state glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-sm border border-rga-green/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]" />
                  )}

                  {/* Corner accents for active state */}
                  {isActive && (
                    <>
                      <span className="absolute top-0 left-0 w-1.5 h-px bg-rga-green" />
                      <span className="absolute top-0 left-0 w-px h-1.5 bg-rga-green" />
                      <span className="absolute bottom-0 right-0 w-1.5 h-px bg-rga-green" />
                      <span className="absolute bottom-0 right-0 w-px h-1.5 bg-rga-green" />
                    </>
                  )}

                  <Icon className="w-4 h-4 relative z-10" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
