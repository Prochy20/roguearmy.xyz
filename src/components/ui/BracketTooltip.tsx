'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BracketTooltipProps {
  /** Title line, rendered with `titlePrefix` in the accent color. */
  title: string
  /** Prefix shown before the title; defaults to the terminal-style `// `. */
  titlePrefix?: string
  /** Optional body paragraph below the title. */
  body?: string
  /** Side of the trigger the popover sits on. */
  side?: 'top' | 'bottom'
  /** Title/accent color class, e.g. `text-rga-green` or `text-source-youtube`. */
  accentText?: string
  /** Box + caret border class, e.g. `border-rga-green/40`. */
  accentBorder?: string
  /** Corner-tick border class, e.g. `border-rga-green/80`. */
  cornerTick?: string
  /** Popover width utility. Defaults to content-sized. */
  widthClass?: string
  /** Set false to suppress the popover (e.g. right after a click). */
  armed?: boolean
  className?: string
  onPointerLeave?: () => void
  /** The trigger element. */
  children: ReactNode
}

/**
 * Hover/focus popover in the terminal-bracket style used by the D2 content
 * filters: corner ticks, a caret pointing at the trigger, and a `// TITLE`
 * header. CSS-only (no portal) so it stacks within whatever overlay hosts it.
 */
export function BracketTooltip({
  title,
  titlePrefix = '// ',
  body,
  side = 'bottom',
  accentText = 'text-rga-green',
  accentBorder = 'border-rga-green/40',
  cornerTick = 'border-rga-green/80',
  widthClass = 'w-max max-w-[280px]',
  armed = true,
  className,
  onPointerLeave,
  children,
}: BracketTooltipProps) {
  return (
    <div
      className={cn('group/tip relative inline-flex', className)}
      onPointerLeave={onPointerLeave}
    >
      {children}

      {armed && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none invisible absolute left-1/2 z-50 -translate-x-1/2 opacity-0',
            'transition-all delay-150 duration-150',
            'group-hover/tip:visible group-hover/tip:opacity-100',
            'group-focus-within/tip:visible group-focus-within/tip:opacity-100',
            widthClass,
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          <div
            className={cn(
              'relative border bg-[rgba(0,0,0,0.92)] px-3 py-2.5 font-mono leading-snug shadow-[0_10px_28px_-8px_rgba(0,0,0,0.9)] backdrop-blur-md',
              accentBorder,
            )}
          >
            <span
              aria-hidden
              className={cn('pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t', cornerTick)}
            />
            <span
              aria-hidden
              className={cn('pointer-events-none absolute -top-px -right-px h-2 w-2 border-r border-t', cornerTick)}
            />
            <span
              aria-hidden
              className={cn('pointer-events-none absolute -bottom-px -left-px h-2 w-2 border-b border-l', cornerTick)}
            />
            <span
              aria-hidden
              className={cn('pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r', cornerTick)}
            />

            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[rgba(0,0,0,0.92)]',
                accentBorder,
                side === 'top' ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-l border-t',
              )}
            />

            <div className={cn('text-[10px] uppercase tracking-[0.3em]', body && 'mb-1', accentText)}>
              {titlePrefix}
              {title}
            </div>
            {body && (
              <p className="text-[11px] leading-relaxed tracking-[0.02em] text-text-secondary">{body}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
