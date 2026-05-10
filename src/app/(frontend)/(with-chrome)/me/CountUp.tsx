'use client'

import { useEffect, useState } from 'react'

interface CountUpProps {
  value: number
  /** Total animation duration in ms. */
  duration?: number
  /** Optional delay before counting begins, ms. */
  delay?: number
  /** Zero-pad the displayed number to this many digits (e.g. 4 → "0006"). */
  padZeros?: number
  /** Format the number with grouping separators via toLocaleString(). */
  locale?: boolean
  /**
   * Reveal style:
   *   'count' (default) — ease-out count from 0 to value
   *   'glitch'          — scramble random digits then progressively lock
   *                       each position left-to-right over the duration
   */
  reveal?: 'count' | 'glitch'
}

/**
 * Animated number reveal. Two variants share the same formatting + timing
 * primitives so call sites can swap reveal styles by toggling one prop.
 *
 * Formatting is driven by simple data props (not a function) so this can be
 * called from a server component without crossing the RSC serialization boundary.
 */
export function CountUp({
  value,
  duration = 700,
  delay = 0,
  padZeros,
  locale = false,
  reveal = 'count',
}: CountUpProps) {
  const finalDisplay = formatNumber(value, padZeros, locale)
  // Initial state must be deterministic — useState's initializer runs on the
  // server during SSR *and* on the client during hydration, so anything random
  // (Math.random, Date.now) here causes a hydration mismatch. We zero-fill the
  // final template so layout is stable; the actual scramble / count animation
  // kicks off in useEffect, which only runs client-side after hydration.
  const [display, setDisplay] = useState(zeroTemplate(finalDisplay))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(finalDisplay)
      return
    }

    let raf = 0
    let started = false
    let startTime = 0

    const tick = (t: number) => {
      if (!started) {
        started = true
        startTime = t
      }
      const elapsed = t - startTime
      const progress = Math.min(1, elapsed / duration)

      if (reveal === 'glitch') {
        setDisplay(progressiveLock(finalDisplay, progress))
      } else {
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(formatNumber(Math.round(value * eased), padZeros, locale))
      }

      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    const startTimer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(startTimer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay, finalDisplay, reveal, padZeros, locale])

  return <>{display}</>
}

function formatNumber(n: number, padZeros: number | undefined, locale: boolean): string {
  if (padZeros && padZeros > 0) return String(n).padStart(padZeros, '0')
  if (locale) return n.toLocaleString()
  return String(n)
}

// Deterministic zero-fill of the final template. Used as the SSR / first-paint
// state so the server and client agree on layout before any client-only
// randomness kicks in.
function zeroTemplate(template: string): string {
  return template
    .split('')
    .map((c) => (/\d/.test(c) ? '0' : c))
    .join('')
}

// Lock digit positions one at a time from left to right as `progress` advances.
// Non-digit characters (commas, dots) stay fixed to keep formatting stable
// while the digits scramble around them.
function progressiveLock(template: string, progress: number): string {
  const chars = template.split('')
  const digitIdxs = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0)
  const lockedCount = Math.floor(progress * digitIdxs.length)
  const lockedSet = new Set(digitIdxs.slice(0, lockedCount))
  return chars
    .map((c, i) => {
      if (!/\d/.test(c)) return c
      if (lockedSet.has(i)) return c
      return randomDigit()
    })
    .join('')
}

function randomDigit(): string {
  return String(Math.floor(Math.random() * 10))
}
