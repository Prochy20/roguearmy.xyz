import type { AshleyErrorCode } from '@/lib/api/server'

/**
 * Landing-page formatting helpers.
 *
 * These exist separately from `lib/division2/format.ts` because the landing
 * page introduces vocabulary that only it uses — short tile-shaped error
 * strings, the "new in last N hours" window, and the freshness label
 * format ("6H AGO" / "JUST NOW") used by the StatRibbon LAST SYNC field.
 *
 * The error-string map intentionally lives next to the AshleyErrorCode
 * union so adding a code there forces a compile error here.
 */

/** Window the CONTENT tile counts "new" items against. */
export const NEW_WINDOW_HOURS = 24

/**
 * Tile-shaped one-line failure string for a given Ashley error code.
 * Keep these tight (≤ 24 chars after the optional status suffix) — they
 * render in place of the tile's headline-fact line, not as a full FailRow.
 *
 * Per the project's failure-UI convention, every code maps to a specific
 * pattern-matched string. The fallback is reserved for new codes added to
 * AshleyErrorCode after this map was last reviewed.
 */
export function tileMessageForError(code: AshleyErrorCode, status?: number): string {
  switch (code) {
    case 'unauthenticated':
      return 'SESSION REQUIRED'
    case 'unauthorized':
      return 'SESSION EXPIRED'
    case 'forbidden':
      return 'ACCESS DENIED'
    case 'not_found':
      return 'AWAITING FIRST SYNC'
    case 'invalid':
      return status ? `REQUEST REJECTED · ${status}` : 'REQUEST REJECTED'
    case 'unavailable':
      return status ? `UPSTREAM UNREACHABLE · ${status}` : 'UPSTREAM UNREACHABLE'
    case 'unknown':
    default:
      return 'OFFLINE'
  }
}

/**
 * "6H AGO" / "JUST NOW" / "—" age label for an ISO timestamp.
 * Uses integer hours past 1h; minutes below that.
 */
export function freshnessLabel(fetchedAt: string | null | undefined): string | null {
  if (!fetchedAt) return null
  const ms = Date.now() - new Date(fetchedAt).getTime()
  if (!Number.isFinite(ms) || Number.isNaN(ms)) return null
  if (ms < 0) return 'JUST NOW'
  const minutes = ms / (1000 * 60)
  if (minutes < 1) return 'JUST NOW'
  if (minutes < 60) return `${Math.floor(minutes)}M AGO`
  const hours = minutes / 60
  if (hours < 48) return `${Math.floor(hours)}H AGO`
  const days = hours / 24
  return `${Math.floor(days)}D AGO`
}

/**
 * Hours-precision freshness for the per-tile secondary line ("6H FRESH").
 * Distinct from `freshnessLabel` — that one is for the ribbon LAST SYNC
 * field and degrades to days; this one is hours-only and tunes to
 * STALE_HOURS_THRESHOLD (24h) boundaries.
 */
export function tileFreshnessLine(fetchedAt: string | null | undefined): string | null {
  if (!fetchedAt) return null
  const ms = Date.now() - new Date(fetchedAt).getTime()
  if (!Number.isFinite(ms) || Number.isNaN(ms)) return null
  if (ms < 0) return 'JUST FRESH'
  const hours = Math.max(0, Math.floor(ms / (1000 * 60 * 60)))
  if (hours === 0) return '< 1H FRESH'
  return `${hours}H FRESH`
}
