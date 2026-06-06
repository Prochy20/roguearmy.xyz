/**
 * Relative timeago for <7 days, absolute `MMM DD` otherwise. Stable across
 * server/client because it accepts a fixed `now` for the comparison —
 * server renders pass `Date.now()` once and the string never re-formats on
 * the client (no hydration drift).
 */
export function formatTimeago(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const diff = now - t
  const hour = 60 * 60 * 1000
  const day = 24 * hour
  if (diff < hour) {
    const m = Math.max(1, Math.floor(diff / (60 * 1000)))
    return `${m}m ago`
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`
  }
  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}d ago`
  }
  // Absolute "MMM DD" — uppercase to match site mono voice.
  const d = new Date(t)
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()
  const day2 = String(d.getUTCDate()).padStart(2, '0')
  return `${month} ${day2}`
}

/**
 * Token substitution for CMS-driven copy strings. Replaces `{SOURCE}`,
 * `{COUNT}`, `{source}`, `{count}` (case-insensitive) with the supplied
 * values. Returns the original string if no tokens are present.
 */
export function substituteTokens(
  template: string,
  tokens: { source?: string; count?: number | string },
): string {
  return template
    .replace(/\{source\}/gi, tokens.source ?? '')
    .replace(/\{count\}/gi, tokens.count !== undefined ? String(tokens.count) : '')
}
