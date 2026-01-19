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
 * Tactical HUD style badge with military targeting brackets
 * Corner brackets animate outward on hover with strong glow effect
 */
interface CyberTagProps {
  children: React.ReactNode
  className?: string
  color?: CornerColor
}

const tagColorConfig: Record<
  CornerColor,
  { bg: string; text: string; glow: string; gradient: string }
> = {
  green: {
    bg: 'bg-rga-green',
    text: 'text-rga-green',
    glow: 'shadow-[0_0_16px_rgba(0,255,65,0.5)]',
    gradient: 'from-rga-green/20 to-transparent',
  },
  cyan: {
    bg: 'bg-rga-cyan',
    text: 'text-rga-cyan',
    glow: 'shadow-[0_0_16px_rgba(0,255,255,0.5)]',
    gradient: 'from-rga-cyan/20 to-transparent',
  },
  magenta: {
    bg: 'bg-rga-magenta',
    text: 'text-rga-magenta',
    glow: 'shadow-[0_0_16px_rgba(255,0,255,0.5)]',
    gradient: 'from-rga-magenta/20 to-transparent',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    glow: 'shadow-[0_0_16px_rgba(249,115,22,0.5)]',
    gradient: 'from-orange-500/20 to-transparent',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    glow: 'shadow-[0_0_16px_rgba(239,68,68,0.5)]',
    gradient: 'from-red-500/20 to-transparent',
  },
  gray: {
    bg: 'bg-rga-gray/50',
    text: 'text-rga-gray',
    glow: '',
    gradient: 'from-rga-gray/10 to-transparent',
  },
}

export function CyberTag({ children, className, color = 'green' }: CyberTagProps) {
  const cfg = tagColorConfig[color]

  return (
    <span
      className={cn(
        'group/tag relative inline-flex items-center',
        'px-4 py-1.5 text-xs font-bold tracking-wider uppercase',
        'bg-void/90 backdrop-blur-sm',
        cfg.text,
        cfg.glow,
        className
      )}
    >
      {/* Corner brackets - top left */}
      <span
        className={cn(
          'absolute -top-px -left-px w-3 h-px transition-all duration-300 group-hover/tag:-translate-x-0.5 group-hover/tag:-translate-y-0.5',
          cfg.bg
        )}
      />
      <span
        className={cn(
          'absolute -top-px -left-px w-px h-3 transition-all duration-300 group-hover/tag:-translate-x-0.5 group-hover/tag:-translate-y-0.5',
          cfg.bg
        )}
      />

      {/* Corner brackets - top right */}
      <span
        className={cn(
          'absolute -top-px -right-px w-3 h-px transition-all duration-300 group-hover/tag:translate-x-0.5 group-hover/tag:-translate-y-0.5',
          cfg.bg
        )}
      />
      <span
        className={cn(
          'absolute -top-px -right-px w-px h-3 transition-all duration-300 group-hover/tag:translate-x-0.5 group-hover/tag:-translate-y-0.5',
          cfg.bg
        )}
      />

      {/* Corner brackets - bottom left */}
      <span
        className={cn(
          'absolute -bottom-px -left-px w-3 h-px transition-all duration-300 group-hover/tag:-translate-x-0.5 group-hover/tag:translate-y-0.5',
          cfg.bg
        )}
      />
      <span
        className={cn(
          'absolute -bottom-px -left-px w-px h-3 transition-all duration-300 group-hover/tag:-translate-x-0.5 group-hover/tag:translate-y-0.5',
          cfg.bg
        )}
      />

      {/* Corner brackets - bottom right */}
      <span
        className={cn(
          'absolute -bottom-px -right-px w-3 h-px transition-all duration-300 group-hover/tag:translate-x-0.5 group-hover/tag:translate-y-0.5',
          cfg.bg
        )}
      />
      <span
        className={cn(
          'absolute -bottom-px -right-px w-px h-3 transition-all duration-300 group-hover/tag:translate-x-0.5 group-hover/tag:translate-y-0.5',
          cfg.bg
        )}
      />

      {/* Inner backlight */}
      <span
        className={cn('absolute inset-0 opacity-20 bg-gradient-to-b', cfg.gradient)}
      />

      <span className="relative z-10">{children}</span>
    </span>
  )
}
