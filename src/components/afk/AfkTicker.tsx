'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { computeDurationParts, formatDurationCompact, pad } from './duration'

interface AfkTickerProps {
  /** ISO 8601 timestamp the AFK session started. */
  createdAt: string
  /**
   * Layout mode:
   *  - "loud"   = big block units for SEC_02 of /afk
   *  - "compact" = two-unit inline form for /me pill
   */
  variant?: 'loud' | 'compact'
  className?: string
}

export function AfkTicker({ createdAt, variant = 'loud', className }: AfkTickerProps) {
  const start = new Date(createdAt).getTime()
  // Initialize to 0 so SSR and first client paint agree — `useEffect` fills
  // the real elapsed value on mount, avoiding the hydration-mismatch warning
  // that `Date.now()` in a lazy initializer would cause.
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  useEffect(() => {
    const tick = () => setElapsedMs(Math.max(0, Date.now() - start))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [start])

  if (variant === 'compact') {
    return (
      <span className={cn('font-mono tabular-nums', className)}>
        {formatDurationCompact(elapsedMs)}
      </span>
    )
  }

  // Slide the three-block window up to the largest non-zero unit so the
  // ticker stays compact at every scale — minutes for a 30s AFK, years for
  // a forgotten one.
  const blocks = pickBlocks(elapsedMs)

  return (
    <div
      className={cn(
        'flex items-end gap-5 font-display tabular-nums sm:gap-7',
        className,
      )}
    >
      {blocks.map((b) => (
        <Block key={b.unit} value={b.value} unit={b.unit} />
      ))}
    </div>
  )
}

type Block = { value: number; unit: 'Y' | 'MO' | 'D' | 'H' | 'M' | 'S' }

function pickBlocks(ms: number): [Block, Block, Block] {
  const p = computeDurationParts(ms)
  if (p.years > 0)
    return [
      { value: p.years, unit: 'Y' },
      { value: p.months, unit: 'MO' },
      { value: p.days, unit: 'D' },
    ]
  if (p.months > 0)
    return [
      { value: p.months, unit: 'MO' },
      { value: p.days, unit: 'D' },
      { value: p.hours, unit: 'H' },
    ]
  if (p.days > 0)
    return [
      { value: p.days, unit: 'D' },
      { value: p.hours, unit: 'H' },
      { value: p.minutes, unit: 'M' },
    ]
  return [
    { value: p.hours, unit: 'H' },
    { value: p.minutes, unit: 'M' },
    { value: p.seconds, unit: 'S' },
  ]
}

function Block({ value, unit }: Block) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="leading-none"
        style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
      >
        {pad(value)}
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted/80">
        {unit}
      </span>
    </div>
  )
}
