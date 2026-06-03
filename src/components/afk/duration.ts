/**
 * Shared duration formatting for AFK surfaces. Scales from seconds up to
 * years using the Gregorian-year average (365.2425d / 1y, ≈30.4369d / 1mo)
 * so that 12 × month === year exactly. Calendar variance is invisible at
 * display resolution — a 95-day AFK reading "3MO 04D" beats "95D 04H".
 */

export interface DurationParts {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86_400
const SECONDS_PER_MONTH = 2_629_746
const SECONDS_PER_YEAR = 31_556_952

export function computeDurationParts(ms: number): DurationParts {
  let remaining = Math.floor(Math.max(0, ms) / MS_PER_SECOND)
  const years = Math.floor(remaining / SECONDS_PER_YEAR)
  remaining -= years * SECONDS_PER_YEAR
  const months = Math.floor(remaining / SECONDS_PER_MONTH)
  remaining -= months * SECONDS_PER_MONTH
  const days = Math.floor(remaining / SECONDS_PER_DAY)
  remaining -= days * SECONDS_PER_DAY
  const hours = Math.floor(remaining / SECONDS_PER_HOUR)
  remaining -= hours * SECONDS_PER_HOUR
  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE)
  const seconds = remaining - minutes * SECONDS_PER_MINUTE
  return { years, months, days, hours, minutes, seconds }
}

/**
 * Compact two-unit form for tables + the /me pill. Picks the two largest
 * non-zero units; falls back to seconds-only when under a minute.
 */
export function formatDurationCompact(ms: number): string {
  const { years, months, days, hours, minutes, seconds } = computeDurationParts(ms)
  if (years > 0) return `${years}Y ${pad(months)}MO`
  if (months > 0) return `${months}MO ${pad(days)}D`
  if (days > 0) return `${days}D ${pad(hours)}H`
  if (hours > 0) return `${hours}H ${pad(minutes)}M`
  if (minutes > 0) return `${minutes}M ${pad(seconds)}S`
  return `${seconds}S`
}

export function pad(n: number): string {
  return n.toString().padStart(2, '0')
}
