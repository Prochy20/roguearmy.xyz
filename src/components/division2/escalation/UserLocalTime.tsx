'use client'

import { useEffect, useState } from 'react'

interface UserLocalTimeProps {
  /** True UTC ISO of the moment we want to display. */
  utcIso: string
  /** Text rendered server-side and during initial hydration. Replaced after
   *  mount with the same instant formatted in the user's resolved timezone. */
  fallback: string
}

/**
 * Renders `utcIso` as a wall-clock string in the visitor's resolved
 * timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
 *
 * Server output equals `fallback` so SSR is deterministic — the client
 * swap happens in a post-mount effect, which React treats as a state
 * update rather than a hydration mismatch.
 */
export function UserLocalTime({ utcIso, fallback }: UserLocalTimeProps) {
  const [local, setLocal] = useState<string | null>(null)

  useEffect(() => {
    const d = new Date(utcIso)
    if (Number.isNaN(d.getTime())) return
    const formatted = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(d)
    setLocal(formatted.toUpperCase())
  }, [utcIso])

  return <span>{local ?? fallback}</span>
}
