import type { AshleyError, AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

export type CommunityStats = components['schemas']['CommunityStatsDto']

export const MOCK_STATS: CommunityStats = {
  totalMembers: 12480,
  joinedLast14d: 142,
  totalVoiceMinutes: 4_812_300,
  totalMessages: 1_204_500,
  generatedAt: '2026-05-20T18:42:00.000Z',
}

export const STATS_OK: AshleyResult<CommunityStats> = {
  ok: true,
  data: MOCK_STATS,
}

export const STATS_FAIL_UNAVAILABLE: AshleyResult<CommunityStats> = {
  ok: false,
  error: { code: 'unavailable', status: 503, message: 'upstream down' },
}

export const STATS_FAIL_FORBIDDEN: AshleyResult<CommunityStats> = {
  ok: false,
  error: { code: 'forbidden', status: 403 },
}

export const ERR_UNAVAILABLE: AshleyError = { code: 'unavailable', status: 503 }
export const ERR_NOT_FOUND: AshleyError = { code: 'not_found', status: 404 }
export const ERR_FORBIDDEN: AshleyError = { code: 'forbidden', status: 403 }
export const ERR_INVALID: AshleyError = { code: 'invalid', status: 422 }
export const ERR_UNKNOWN: AshleyError = { code: 'unknown' }
