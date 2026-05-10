'use server'

import { safeAshleyCall, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

/**
 * Fetch a 5-row window centered on the caller's rank for the
 * "around-me" expansion in the sticky bar.
 *
 * `myRank` is 1-indexed. Clamp the offset to 0 so ranks 1–3 still
 * get a full window starting at the top of the board.
 */
export async function getAroundMe(myRank: number): Promise<AshleyResult<LeaderboardEntry[]>> {
  const offset = Math.max(0, myRank - 3)
  const result = await safeAshleyCall<components['schemas']['LeaderboardResponseDto']>((c) =>
    c.GET('/api/leveling/leaderboard', {
      params: { query: { limit: 5, offset } },
    }),
  )
  if (!result.ok) return { ok: false, error: result.error }
  return { ok: true, data: result.data.items }
}
