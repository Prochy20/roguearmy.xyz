'use server'

import { safeAshleyCall, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

const ROSTER_PAGE_SIZE = 20

/**
 * Fetch a 5-row window centered on the caller's rank for the
 * "around-me" expansion in the sticky bar.
 *
 * `myRank` is 1-indexed. Clamp the offset to 0 so ranks 1–3 still
 * get a full window starting at the top of the board.
 */
export async function getAroundMe(myRank: number): Promise<AshleyResult<LeaderboardEntry[]>> {
  if (!Number.isInteger(myRank) || myRank < 1) {
    return { ok: false, error: { code: 'invalid' } }
  }
  const offset = Math.max(0, myRank - 3)
  const result = await safeAshleyCall<components['schemas']['LeaderboardResponseDto']>((c) =>
    c.GET('/api/leveling/leaderboard', {
      params: { query: { limit: 5, offset } },
    }),
  )
  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, data: result.data.items }
}

export interface RosterPage {
  /** Operatives strictly above the caller, in rank order. */
  items: LeaderboardEntry[]
  /** Total count of operatives above the caller. */
  total: number
}

/**
 * Paginated fetch of operatives above the caller, used by the
 * formation roster picker modal. Returns a fixed page size; the
 * client passes `offset` to load the next page.
 *
 * Filters out the caller and anyone equal-or-below in rank, because
 * a designation only makes sense for operatives above.
 */
export async function getRosterAbove(
  callerRank: number,
  offset: number,
): Promise<AshleyResult<RosterPage>> {
  if (!Number.isInteger(callerRank) || callerRank < 2) {
    return { ok: false, error: { code: 'invalid' } }
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, error: { code: 'invalid' } }
  }

  const result = await safeAshleyCall<components['schemas']['LeaderboardResponseDto']>((c) =>
    c.GET('/api/leveling/leaderboard', {
      params: { query: { limit: ROSTER_PAGE_SIZE, offset } },
    }),
  )
  if (!result.ok) return { ok: false, error: result.error }

  const items = result.data.items.filter((e) => e.rank < callerRank)
  return { ok: true, data: { items, total: callerRank - 1 } }
}
