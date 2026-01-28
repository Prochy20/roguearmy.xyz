import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add green glow effect for emphasis on key elements like titles */
  glow?: boolean
}

/**
 * Cyberpunk-themed skeleton loader with horizontal scanline sweep.
 * Uses a translating gradient overlay instead of pulse for "data transmission" feel.
 */
function Skeleton({ className, glow = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-rga-gray/10 relative overflow-hidden',
        // Scanline sweep animation
        'after:absolute after:inset-0',
        'after:bg-linear-to-r after:from-transparent after:via-rga-green/10 after:to-transparent',
        'after:animate-[shimmer_2s_infinite]',
        // Optional glow for emphasis
        glow && 'shadow-[0_0_10px_rgba(0,255,65,0.15)]',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
