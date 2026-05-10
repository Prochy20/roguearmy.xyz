'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BracketButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: 'cyan' | 'green' | 'white'
  active?: boolean
  children: ReactNode
}

const accentMap = {
  cyan: {
    bracket: 'bg-rga-cyan',
    glow: 'shadow-[0_0_6px_rgba(0,255,255,0.5)]',
    scan: 'via-rga-cyan/40',
    fill: 'bg-linear-to-b from-rga-cyan/10 to-transparent',
  },
  green: {
    bracket: 'bg-rga-green',
    glow: 'shadow-[0_0_6px_rgba(0,255,65,0.5)]',
    scan: 'via-rga-green/40',
    fill: 'bg-linear-to-b from-rga-green/10 to-transparent',
  },
  white: {
    bracket: 'bg-white',
    glow: 'shadow-[0_0_6px_rgba(255,255,255,0.5)]',
    scan: 'via-white/40',
    fill: 'bg-linear-to-b from-white/10 to-transparent',
  },
}

export const BracketButton = forwardRef<HTMLButtonElement, BracketButtonProps>(
  ({ accent = 'cyan', active = false, className, children, ...props }, ref) => {
    const c = accentMap[accent]
    const showOverlays = !active

    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          'group relative inline-flex items-center gap-2 px-4 py-2',
          'font-mono text-xs uppercase tracking-[0.2em] font-medium',
          'backdrop-blur-sm transition-colors duration-300',
          active ? 'bg-white text-void' : 'bg-void/80 text-white',
          className,
        )}
      >
        {showOverlays && (
          <>
            <Bracket position="tl" accent={c} />
            <Bracket position="tr" accent={c} />
            <Bracket position="bl" accent={c} />
            <Bracket position="br" accent={c} />

            <span className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className={cn('absolute inset-x-0 h-px bg-linear-to-r from-transparent to-transparent animate-scan', c.scan)} />
            </span>

            <span
              className={cn(
                'absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none',
                'group-hover:opacity-100',
                c.fill,
              )}
            />
          </>
        )}

        <span className="relative inline-flex items-center gap-2">{children}</span>
      </button>
    )
  },
)
BracketButton.displayName = 'BracketButton'

interface BracketProps {
  position: 'tl' | 'tr' | 'bl' | 'br'
  accent: (typeof accentMap)[keyof typeof accentMap]
}

function Bracket({ position, accent }: BracketProps) {
  const horizontal: Record<BracketProps['position'], string> = {
    tl: '-top-px -left-px group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
    tr: '-top-px -right-px group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
    bl: '-bottom-px -left-px group-hover:-translate-x-0.5 group-hover:translate-y-0.5',
    br: '-bottom-px -right-px group-hover:translate-x-0.5 group-hover:translate-y-0.5',
  }

  return (
    <>
      <span
        className={cn(
          'absolute w-3 h-px transition-all duration-300 group-hover:w-4',
          accent.bracket,
          accent.glow,
          horizontal[position],
        )}
      />
      <span
        className={cn(
          'absolute w-px h-3 transition-all duration-300 group-hover:h-4',
          accent.bracket,
          accent.glow,
          horizontal[position],
        )}
      />
    </>
  )
}
