import { cn } from '@/lib/utils'

type CornerColor = 'green' | 'cyan' | 'magenta' | 'orange' | 'red' | 'gray'

interface CyberCornersProps {
  children: React.ReactNode
  className?: string
  /** Corner accent color */
  color?: CornerColor
  /** Size of corner brackets */
  size?: 'sm' | 'md' | 'lg'
  /** Which corners to show */
  corners?: ('tl' | 'tr' | 'bl' | 'br')[]
  /** Add glow effect */
  glow?: boolean
}

const colorMap: Record<CornerColor, { line: string; glow: string }> = {
  green: {
    line: 'bg-rga-green',
    glow: 'shadow-[0_0_6px_rgba(0,255,65,0.5)]',
  },
  cyan: {
    line: 'bg-rga-cyan',
    glow: 'shadow-[0_0_6px_rgba(0,255,255,0.5)]',
  },
  magenta: {
    line: 'bg-rga-magenta',
    glow: 'shadow-[0_0_6px_rgba(255,0,255,0.5)]',
  },
  orange: {
    line: 'bg-orange-500',
    glow: 'shadow-[0_0_6px_rgba(249,115,22,0.5)]',
  },
  red: {
    line: 'bg-red-500',
    glow: 'shadow-[0_0_6px_rgba(239,68,68,0.5)]',
  },
  gray: {
    line: 'bg-rga-gray/40',
    glow: '',
  },
}

const sizeMap = {
  sm: { length: 12, offset: 4, gap: 2 },
  md: { length: 16, offset: 6, gap: 3 },
  lg: { length: 24, offset: 8, gap: 4 },
}

/**
 * Cyberpunk corner brackets - frames content from OUTSIDE
 * L-shaped targeting brackets positioned around the container
 * Subtle scale on hover
 */
export function CyberCorners({
  children,
  className,
  color = 'green',
  size = 'sm',
  corners = ['tl', 'tr', 'bl', 'br'],
  glow = true,
}: CyberCornersProps) {
  const { line, glow: glowClass } = colorMap[color]
  const { length, offset, gap } = sizeMap[size]
  const glowStyle = glow ? glowClass : ''

  return (
    <div
      className={cn('relative group/cyber', className)}
      style={{ padding: `${offset + gap}px` }}
    >
      {/* The actual content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Corner brackets - positioned outside the content */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Top-left bracket - moves up-left on hover */}
        {corners.includes('tl') && (
          <div className="absolute top-0 left-0 transition-transform duration-300 ease-out group-hover/cyber:-translate-x-1 group-hover/cyber:-translate-y-1">
            <div
              className={cn(line, glowStyle)}
              style={{ width: length, height: 1 }}
            />
            <div
              className={cn(line, glowStyle)}
              style={{ width: 1, height: length }}
            />
          </div>
        )}

        {/* Top-right bracket - moves up-right on hover */}
        {corners.includes('tr') && (
          <div className="absolute top-0 right-0 transition-transform duration-300 ease-out group-hover/cyber:translate-x-1 group-hover/cyber:-translate-y-1">
            <div
              className={cn('ml-auto', line, glowStyle)}
              style={{ width: length, height: 1 }}
            />
            <div
              className={cn('ml-auto', line, glowStyle)}
              style={{ width: 1, height: length }}
            />
          </div>
        )}

        {/* Bottom-left bracket - moves down-left on hover */}
        {corners.includes('bl') && (
          <div className="absolute bottom-0 left-0 transition-transform duration-300 ease-out group-hover/cyber:-translate-x-1 group-hover/cyber:translate-y-1">
            <div
              className={cn(line, glowStyle)}
              style={{ width: 1, height: length }}
            />
            <div
              className={cn(line, glowStyle)}
              style={{ width: length, height: 1 }}
            />
          </div>
        )}

        {/* Bottom-right bracket - moves down-right on hover */}
        {corners.includes('br') && (
          <div className="absolute bottom-0 right-0 transition-transform duration-300 ease-out group-hover/cyber:translate-x-1 group-hover/cyber:translate-y-1">
            <div
              className={cn('ml-auto', line, glowStyle)}
              style={{ width: 1, height: length }}
            />
            <div
              className={cn('ml-auto', line, glowStyle)}
              style={{ width: length, height: 1 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Inline cyber corners for small elements like tags/badges
 * Uses CSS borders instead of positioned elements for better sizing
 */
interface CyberTagProps {
  children: React.ReactNode
  className?: string
  color?: CornerColor
}

export function CyberTag({ children, className, color = 'green' }: CyberTagProps) {
  const colorStyles: Record<CornerColor, string> = {
    green: 'border-rga-green/60 shadow-[0_0_8px_rgba(0,255,65,0.15)]',
    cyan: 'border-rga-cyan/60 shadow-[0_0_8px_rgba(0,255,255,0.15)]',
    magenta: 'border-rga-magenta/60 shadow-[0_0_8px_rgba(255,0,255,0.15)]',
    orange: 'border-orange-500/60 shadow-[0_0_8px_rgba(249,115,22,0.15)]',
    red: 'border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
    gray: 'border-rga-gray/30',
  }

  const cornerColors: Record<CornerColor, string> = {
    green: 'bg-rga-green',
    cyan: 'bg-rga-cyan',
    magenta: 'bg-rga-magenta',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gray: 'bg-rga-gray/50',
  }

  return (
    <span
      className={cn(
        'relative inline-flex items-center',
        // Clip corners using clip-path for sharp cyberpunk look
        '[clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)]',
        // Base styling
        'px-3 py-1 text-xs font-medium tracking-wide uppercase',
        'bg-void/80 backdrop-blur-sm border',
        colorStyles[color],
        className
      )}
    >
      {/* Corner accent marks */}
      <span className={cn('absolute top-0 left-0 w-[6px] h-px', cornerColors[color])} />
      <span className={cn('absolute top-0 left-0 w-px h-[6px]', cornerColors[color])} />
      <span className={cn('absolute bottom-0 right-0 w-[6px] h-px', cornerColors[color])} />
      <span className={cn('absolute bottom-0 right-0 w-px h-[6px]', cornerColors[color])} />
      {children}
    </span>
  )
}
