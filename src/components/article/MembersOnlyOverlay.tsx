'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface MembersOnlyOverlayProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: {
    container: 'w-10 h-10',
    icon: 'w-4 h-4',
    corner: 'w-2 h-2',
  },
  md: {
    container: 'w-14 h-14',
    icon: 'w-6 h-6',
    corner: 'w-2.5 h-2.5',
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'w-7 h-7',
    corner: 'w-3 h-3',
  },
}

/**
 * Centered overlay for members-only content with pulsing animation
 * Used on article cards when user is not authenticated
 */
export function MembersOnlyOverlay({ size = 'lg', className }: MembersOnlyOverlayProps) {
  const config = sizeConfig[size]

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-bg-elevated/70 z-10',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-help">
              {/* Main icon container */}
              <div
                className={cn(
                  'relative rounded-full bg-linear-to-br from-rga-magenta/30 to-rga-magenta/10 border-2 border-rga-magenta/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.3)]',
                  config.container
                )}
              >
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-rga-magenta/15 blur-sm" />
                {/* Lock icon */}
                <Lock className={cn('relative text-rga-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]', config.icon)} />
              </div>

              {/* Corner indicators */}
              <div className={cn('absolute -top-1.5 -left-1.5 border-t-2 border-l-2 border-rga-magenta/70', config.corner)} />
              <div className={cn('absolute -top-1.5 -right-1.5 border-t-2 border-r-2 border-rga-magenta/70', config.corner)} />
              <div className={cn('absolute -bottom-1.5 -left-1.5 border-b-2 border-l-2 border-rga-magenta/70', config.corner)} />
              <div className={cn('absolute -bottom-1.5 -right-1.5 border-b-2 border-r-2 border-rga-magenta/70', config.corner)} />
            </div>
          </TooltipTrigger>
          <TooltipContent accent="magenta">Members only</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
