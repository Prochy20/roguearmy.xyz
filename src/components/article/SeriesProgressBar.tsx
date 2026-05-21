import { cn } from '@/lib/utils'

interface SeriesProgressBarProps {
  completedCount: number
  totalCount: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

/**
 * Progress bar showing series completion (X of Y read)
 */
export function SeriesProgressBar({
  completedCount,
  totalCount,
  className,
  showLabel = true,
  size = 'md',
}: SeriesProgressBarProps) {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount >= totalCount && totalCount > 0

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-rga-gray/60 uppercase tracking-wider">Progress</span>
          <span className={cn('font-mono', isComplete ? 'text-rga-green' : 'text-rga-gray')}>
            {completedCount}/{totalCount}
          </span>
        </div>
      )}
      <div className={cn('relative bg-rga-green/10 overflow-hidden', sizeClasses[size])}>
        {/* Progress fill */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-all duration-500 ease-out',
            isComplete ? 'bg-rga-green' : 'bg-rga-cyan/70'
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Scanline effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
          }}
        />
      </div>
    </div>
  )
}
