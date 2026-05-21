import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type ReadStatus = 'unread' | 'in_progress' | 'completed'

interface ReadStatusIndicatorProps {
  status: ReadStatus
  progress?: number
  className?: string
  size?: 'sm' | 'md'
}

/**
 * Visual indicator for article read status
 * - Unread: hollow gray circle
 * - In progress: cyan partial ring with percentage
 * - Completed: green checkmark
 */
export function ReadStatusIndicator({
  status,
  progress = 0,
  className,
  size = 'md',
}: ReadStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  if (status === 'completed') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-rga-green/20 text-rga-green',
                sizeClasses[size],
                className
              )}
              aria-label="Completed"
            >
              <Check className={iconSizes[size]} />
            </div>
          </TooltipTrigger>
          <TooltipContent accent="green">Completed</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (status === 'in_progress') {
    // SVG progress ring
    const radius = size === 'sm' ? 8 : 10
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference
    const svgSize = size === 'sm' ? 20 : 24
    const strokeWidth = size === 'sm' ? 2 : 2.5
    const progressText = `${Math.round(progress)}% read`

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn('relative flex items-center justify-center', sizeClasses[size], className)}
              aria-label={progressText}
            >
              <svg
                className="transform -rotate-90"
                width={svgSize}
                height={svgSize}
                viewBox={`0 0 ${svgSize} ${svgSize}`}
              >
                {/* Background circle */}
                <circle
                  cx={svgSize / 2}
                  cy={svgSize / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-rga-cyan/20"
                />
                {/* Progress arc */}
                <circle
                  cx={svgSize / 2}
                  cy={svgSize / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-rga-cyan transition-all duration-300"
                />
              </svg>
              {/* Center text */}
              <span className="absolute text-[8px] font-mono text-rga-cyan">
                {Math.round(progress)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent accent="cyan">{progressText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Unread - hollow circle
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'rounded-full border-2 border-rga-gray/30',
              sizeClasses[size],
              className
            )}
            aria-label="Unread"
          />
        </TooltipTrigger>
        <TooltipContent>Unread</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Determine read status from progress data
 */
export function getReadStatus(progress?: number, completed?: boolean): ReadStatus {
  if (completed) return 'completed'
  if (progress && progress > 0) return 'in_progress'
  return 'unread'
}
