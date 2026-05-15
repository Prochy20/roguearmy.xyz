/**
 * Client-only persistence layer for the formation HUD. All state lives in
 * localStorage under a versioned key so future shape migrations are safe.
 *
 * Pure functions only — no React, no DOM events. Reads return EMPTY on any
 * SSR call, parse error, or QuotaExceeded condition. Writes are silent on
 * failure (private browsing, storage disabled, etc.).
 */

const STORAGE_KEY = 'rga.formation.v1'
const MAX_SNAPSHOTS = 30

export interface PointDesignation {
  discordId: string
  /** Cached at designation so the relieved card works even if op falls off the visible board. */
  displayName: string
  /** Cached level — same reason as displayName. */
  level: number
  /** Avatar hash or full URL — the schema is ambiguous so we just store what we got. */
  avatar: string | null
  /** Rank at last visit where we saw fresh data. */
  lastSeenRank: number
  /** XP at last visit where we saw fresh data. */
  lastSeenXp: number
  /** Unix ms when designation was set. */
  designatedAt: number
}

export interface ProgressSnapshot {
  ts: number
  rank: number
  xp: number
}

export interface DismissedRecord {
  discordId: string
  at: number
}

export interface FormationStorage {
  point: PointDesignation | null
  snapshots: ProgressSnapshot[]
  dismissedSuggestion: DismissedRecord | null
}

const EMPTY: FormationStorage = {
  point: null,
  snapshots: [],
  dismissedSuggestion: null,
}

export function emptyStorage(): FormationStorage {
  return { point: null, snapshots: [], dismissedSuggestion: null }
}

export function readStorage(): FormationStorage {
  if (typeof window === 'undefined') return emptyStorage()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStorage()
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return emptyStorage()
    const obj = parsed as Record<string, unknown>
    return {
      point: validatePoint(obj.point),
      snapshots: validateSnapshots(obj.snapshots),
      dismissedSuggestion: validateDismissed(obj.dismissedSuggestion),
    }
  } catch {
    return emptyStorage()
  }
}

export function writeStorage(next: FormationStorage): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // QuotaExceededError, private mode with storage disabled, etc.
  }
}

export function designatePoint(
  current: FormationStorage,
  point: PointDesignation,
): FormationStorage {
  // Designating a new point clears any prior "dismissed suggestion" marker so
  // the suggest state can re-fire later if this point is overtaken.
  return { ...current, point, dismissedSuggestion: null }
}

export function clearPoint(current: FormationStorage): FormationStorage {
  return { ...current, point: null }
}

export function recordVisit(
  current: FormationStorage,
  rank: number,
  xp: number,
  now: number = Date.now(),
): FormationStorage {
  const snapshots = [...current.snapshots, { ts: now, rank, xp }]
  // Cap to most-recent MAX_SNAPSHOTS to keep storage bounded.
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS)
  }
  return { ...current, snapshots }
}

export function updatePointSeen(
  current: FormationStorage,
  rank: number,
  xp: number,
): FormationStorage {
  if (!current.point) return current
  return {
    ...current,
    point: { ...current.point, lastSeenRank: rank, lastSeenXp: xp },
  }
}

export function dismissSuggestion(
  current: FormationStorage,
  discordId: string,
  now: number = Date.now(),
): FormationStorage {
  return { ...current, dismissedSuggestion: { discordId, at: now } }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Validators                                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

function validatePoint(value: unknown): PointDesignation | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (
    typeof v.discordId !== 'string' ||
    typeof v.displayName !== 'string' ||
    typeof v.level !== 'number' ||
    typeof v.lastSeenRank !== 'number' ||
    typeof v.lastSeenXp !== 'number' ||
    typeof v.designatedAt !== 'number'
  ) {
    return null
  }
  return {
    discordId: v.discordId,
    displayName: v.displayName,
    level: v.level,
    avatar: typeof v.avatar === 'string' ? v.avatar : null,
    lastSeenRank: v.lastSeenRank,
    lastSeenXp: v.lastSeenXp,
    designatedAt: v.designatedAt,
  }
}

function validateSnapshots(value: unknown): ProgressSnapshot[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((s): s is ProgressSnapshot => {
      if (!s || typeof s !== 'object') return false
      const x = s as Record<string, unknown>
      return (
        typeof x.ts === 'number' &&
        typeof x.rank === 'number' &&
        typeof x.xp === 'number'
      )
    })
    .slice(-MAX_SNAPSHOTS)
}

function validateDismissed(value: unknown): DismissedRecord | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.discordId !== 'string' || typeof v.at !== 'number') return null
  return { discordId: v.discordId, at: v.at }
}

export const _internals = { STORAGE_KEY, MAX_SNAPSHOTS, EMPTY }
