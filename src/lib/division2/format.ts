/**
 * Calendar helpers for escalation rendering. All Date math is UTC-anchored
 * because Ashley's day/week values are calendar-UTC strings.
 */

/** YYYY-MM-DD in UTC. */
export function todayUtcIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Most-recent Tuesday ≤ today (UTC), as `YYYY-MM-DD`.
 *
 * Used to fetch the active escalation week explicitly rather than trusting
 * Ashley's `/weeks/current` endpoint — that endpoint can lag the actual
 * Tuesday rollover when upstream ingestion is delayed or when the API server
 * computes "today" in a non-UTC timezone.
 */
export function currentWeekStartUtc(): string {
  return weekStartForDayUtc(new Date().toISOString().slice(0, 10))
}

/** Tuesday ≤ given day (UTC), as `YYYY-MM-DD`. */
export function weekStartForDayUtc(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return day
  const dow = d.getUTCDay()
  // Days back to most recent Tuesday (inclusive).
  // (dow + 5) % 7 maps: Tue→0, Wed→1, Thu→2, Fri→3, Sat→4, Sun→5, Mon→6
  const daysBack = (dow + 5) % 7
  d.setUTCDate(d.getUTCDate() - daysBack)
  return d.toISOString().slice(0, 10)
}

/**
 * Monday ≤ given day (UTC), as `YYYY-MM-DD`. Used to bucket content briefings
 * into calendar weeks — Ashley publishes weekly briefings with periodStart on
 * a Monday, so this aligns daily briefings to the same week boundaries.
 */
export function mondayOfWeekUtc(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return day
  // (dow + 6) % 7 maps: Mon→0, Tue→1, Wed→2, Thu→3, Fri→4, Sat→5, Sun→6
  const daysBack = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - daysBack)
  return d.toISOString().slice(0, 10)
}

/** Step one calendar day backward in UTC. */
export function previousDayUtc(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return day
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Step one calendar day forward in UTC. */
export function nextDayUtc(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return day
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Normalize a day string from Ashley to `YYYY-MM-DD` UTC.
 *
 * The API contract documents the field as a pure date string ("2026-05-07")
 * but real responses sometimes ship a full ISO datetime — defensively
 * parsing as Date and re-serializing keeps day comparisons stable either way.
 */
export function normalizeDayIso(day: string): string {
  if (typeof day !== 'string') return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day
  const parsed = new Date(day)
  if (Number.isNaN(parsed.getTime())) return day
  return parsed.toISOString().slice(0, 10)
}

/** True if `weekStart` is a Tuesday YYYY-MM-DD string. */
export function isValidWeekStart(weekStart: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return false
  const date = new Date(`${weekStart}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return false
  // Re-serialize to catch impossible dates that JS happily rolls over
  // (e.g., "2026-02-30" becomes March 2). If it doesn't round-trip, it's bad.
  if (date.toISOString().slice(0, 10) !== weekStart) return false
  // UTC day-of-week — 2 is Tuesday.
  return date.getUTCDay() === 2
}

/** Hours between `fetchedAt` (ISO) and now. Negative if future, NaN if invalid. */
export function hoursSince(fetchedAt: string): number {
  const then = new Date(fetchedAt).getTime()
  if (Number.isNaN(then)) return NaN
  return (Date.now() - then) / (1000 * 60 * 60)
}

/**
 * Ashley ships `fetchedAt` as a Europe/Prague wall-clock timestamp formatted
 * like an ISO UTC string (e.g. `"2026-05-25T11:00:00Z"` that actually means
 * 11:00 CEST). Re-interpret those components as Prague local and return a
 * true UTC ISO string. DST-safe via `Intl`.
 */
export function ashleyTimestampToUtcIso(raw: string): string {
  const asIfUtc = new Date(raw)
  if (Number.isNaN(asIfUtc.getTime())) return raw
  const offsetMs = pragueOffsetMs(asIfUtc.getTime())
  return new Date(asIfUtc.getTime() - offsetMs).toISOString()
}

/** Milliseconds you'd add to a UTC instant to get the wall-clock in Prague. */
function pragueOffsetMs(epochMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Prague',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    dtf.formatToParts(new Date(epochMs)).map((p) => [p.type, p.value]),
  )
  const hour = parts.hour === '24' ? '00' : parts.hour
  const wallEpoch = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return wallEpoch - epochMs
}

/** Stale chip threshold — anything past 24h gets the warning. */
export const STALE_HOURS_THRESHOLD = 24

/** Format `YYYY-MM-DD` as "MAY 19" in en-US (uppercase, no year). */
export function formatDayShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d
    .toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .toUpperCase()
}

/** Format `YYYY-MM-DD` as "TUE · MAY 19" (uppercase). */
export function formatDayWithWeekday(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return iso
  const wd = d
    .toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' })
    .toUpperCase()
  return `${wd} · ${formatDayShort(iso)}`
}

/** UTC short weekday for a YYYY-MM-DD ISO date (e.g. "TUE"). */
export function weekdayShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase()
}

/**
 * Enumerate the 7 calendar days of an escalation week starting from
 * `weekStart` (Tuesday). Returns YYYY-MM-DD strings.
 */
export function enumerateWeekDays(weekStart: string): string[] {
  const out: string[] = []
  const base = new Date(`${weekStart}T00:00:00.000Z`)
  if (Number.isNaN(base.getTime())) return out
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
