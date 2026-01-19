'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipVariants = cva(
  [
    // Base styles
    'z-50 overflow-hidden px-3 py-1.5',
    'font-mono text-xs tracking-wide',
    'bg-bg-elevated/95 backdrop-blur-sm',
    'border',
    // Animations
    'animate-in fade-in-0 zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-2',
    'data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2',
    'data-[side=top]:slide-in-from-bottom-2',
    // Hide on touch devices
    'touch-device:hidden',
  ],
  {
    variants: {
      accent: {
        green: [
          'border-rga-green/30 text-rga-green',
          'shadow-[0_0_8px_rgba(0,255,65,0.3)]',
        ],
        cyan: [
          'border-rga-cyan/30 text-rga-cyan',
          'shadow-[0_0_8px_rgba(0,255,255,0.3)]',
        ],
        magenta: [
          'border-rga-magenta/30 text-rga-magenta',
          'shadow-[0_0_8px_rgba(255,0,255,0.3)]',
        ],
      },
    },
    defaultVariants: {
      accent: 'green',
    },
  }
)

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, accent, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipVariants({ accent, className }))}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
