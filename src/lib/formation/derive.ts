/**
 * Pure derivation functions for the formation HUD. No React, no DOM, no
 * storage I/O — these functions transform server data + storage state into
 * the props shape the presentational components expect.
 */

import type { components } from '@/lib/api/schema'
import type { PointDesignation, ProgressSnapshot } from './storage'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

/**
 * Returns true if the caller has surpassed the designated POINT operative.
 *
 * Truth model: if we have fresh data for the operative (they're in the
 * currently-fetched range), use it. Otherwise compare caller's current rank
 * against the operative's last-seen rank — if the caller has climbed past
 * that stale rank, we infer overtake.
 */
export function detectOvertake(
  point: PointDesignation,
  currentPointEntry: LeaderboardEntry | null,
  callerRank: number,
): boolean {
  if (currentPointEntry) {
    return callerRank <= currentPointEntry.rank
  }
  return callerRank <= point.lastSeenRank
}

/**
 * Pick the closest operative above the caller from a list. "Closest" =
 * highest rank number (smallest gap). Returns null if the list is empty.
 */
export function pickSuggested(
  closeAbove: readonly LeaderboardEntry[],
): LeaderboardEntry | null {
  if (closeAbove.length === 0) return null
  return [...closeAbove].sort((a, b) => b.rank - a.rank)[0]
}

export interface WindowDelta {
  windowLabel: string
  xpDelta: number
  rankDelta: number
  fresh: boolean
}

/**
 * Compute the rolling-window delta for the self-progress strip. Finds the
 * snapshot closest to `now - windowMs` (without going beyond), labels it
 * honestly based on the actual snapshot's age, and returns signed deltas.
 *
 * Cases:
 *   - No snapshots → NO TELEMETRY, zeros
 *   - One snapshot → FIRST DEPLOY · {N}H AGO, zeros (nothing to compare against)
 *   - Multiple snapshots, oldest is younger than window → label by actual age
 *   - Multiple snapshots, has one in the window → label "LAST {N} DAYS"
 */
export function computeWindowDelta(
  snapshots: readonly ProgressSnapshot[],
  windowMs: number,
  now: number = Date.now(),
): WindowDelta {
  if (snapshots.length === 0) {
    return { windowLabel: 'NO TELEMETRY', xpDelta: 0, rankDelta: 0, fresh: false }
  }
  if (snapshots.length === 1) {
    const only = snapshots[0]
    return {
      windowLabel: `FIRST DEPLOY · ${formatAge(now - only.ts)}`,
      xpDelta: 0,
      rankDelta: 0,
      fresh: true,
    }
  }

  const latest = snapshots[snapshots.length - 1]
  const targetTs = now - windowMs

  // Find the snapshot closest to but not after targetTs. If all snapshots
  // are younger than targetTs (we haven't been visiting long enough), use
  // the oldest one we have.
  let anchor = snapshots[0]
  for (const s of snapshots) {
    if (s.ts <= targetTs && s.ts >= anchor.ts) anchor = s
  }
  if (anchor.ts > targetTs) {
    anchor = snapshots[0]
  }

  const ageMs = now - anchor.ts
  return {
    windowLabel: pickWindowLabel(ageMs, anchor.ts),
    xpDelta: latest.xp - anchor.xp,
    // Positive rankDelta = climbed (rank number decreased over time).
    rankDelta: anchor.rank - latest.rank,
    fresh: true,
  }
}

function pickWindowLabel(ageMs: number, anchorTs: number): string {
  if (ageMs < DAY_MS) return 'TODAY'
  const days = Math.round(ageMs / DAY_MS)
  if (days <= 9) return `LAST ${days} DAYS`
  return `SINCE ${formatDate(anchorTs)}`
}

/**
 * Humanize the time since POINT designation. Returns "4D 12H" / "08H" /
 * "23M" format suitable for the eyebrow `// POINT · LOCK 04D 12H`.
 */
export function formatDesignatedAgo(designatedAt: number, now: number = Date.now()): string {
  const ms = Math.max(0, now - designatedAt)
  if (ms < HOUR_MS) {
    const m = Math.max(1, Math.round(ms / 60_000))
    return `${String(m).padStart(2, '0')}M`
  }
  if (ms < DAY_MS) {
    const h = Math.round(ms / HOUR_MS)
    return `${String(h).padStart(2, '0')}H`
  }
  const days = Math.floor(ms / DAY_MS)
  const remHours = Math.round((ms - days * DAY_MS) / HOUR_MS)
  return `${String(days).padStart(2, '0')}D ${String(remHours).padStart(2, '0')}H`
}

function formatAge(ms: number): string {
  const abs = Math.max(0, ms)
  if (abs < HOUR_MS) {
    const m = Math.max(1, Math.round(abs / 60_000))
    return `${m}M AGO`
  }
  if (abs < DAY_MS) {
    const h = Math.round(abs / HOUR_MS)
    return `${h}H AGO`
  }
  const days = Math.round(abs / DAY_MS)
  return `${days}D AGO`
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}
