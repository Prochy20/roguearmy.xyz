'use client'

import { useEffect, useState } from 'react'

const PLACEHOLDER = '--:--:--'

function formatUtc(d: Date): string {
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  })
}

/**
 * Live UTC time, ticking every second. Renders a stable em-dash placeholder
 * during SSR + first paint so server and client agree on layout before the
 * effect kicks in. Honors prefers-reduced-motion: locks to a single read
 * instead of ticking.
 */
export function UtcClock() {
  const [time, setTime] = useState<string>(PLACEHOLDER)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setTime(formatUtc(new Date()))

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const id = window.setInterval(() => setTime(formatUtc(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="font-mono tabular-nums text-text-primary" suppressHydrationWarning>
      {time} UTC
    </span>
  )
}
