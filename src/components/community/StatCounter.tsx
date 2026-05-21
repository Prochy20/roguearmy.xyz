'use client'

import { useEffect, useRef, useState } from 'react'
import { CountUp, formatCompact } from '@/components/ui/CountUp'

interface StatCounterProps {
  value: number
  /** Format with locale separators (e.g. 12,400). */
  locale?: boolean
  /** Format with compact notation (894812 → "894.8K"). Takes precedence over `locale`. */
  compact?: boolean
  /** Trigger threshold for IntersectionObserver, 0–1. */
  threshold?: number
  duration?: number
}

/**
 * Viewport-triggered wrapper around CountUp. Renders a zero-template until
 * the host element scrolls into view, then mounts CountUp which performs
 * the count animation. Single-shot — once triggered, never resets.
 */
export function StatCounter({
  value,
  locale = false,
  compact = false,
  threshold = 0.4,
  duration = 1400,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (armed) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [armed, threshold])

  return (
    <span ref={ref} className="tabular-nums">
      {armed ? (
        <CountUp
          value={value}
          duration={duration}
          locale={locale}
          compact={compact}
          reveal="count"
        />
      ) : (
        zeroTemplate(value, locale, compact)
      )}
    </span>
  )
}

function zeroTemplate(value: number, locale: boolean, compact: boolean): string {
  const formatted = compact
    ? formatCompact(value)
    : locale
      ? value.toLocaleString()
      : String(value)
  return formatted
    .split('')
    .map((c) => (/\d/.test(c) ? '0' : c))
    .join('')
}
