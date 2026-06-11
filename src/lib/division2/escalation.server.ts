import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchAshleyService, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import {
  currentWeekStartUtc,
  normalizeDayIso,
  weekStartForDayUtc,
} from '@/lib/division2/format'

/**
 * Escalation read helpers.
 *
 * Service-identity Ashley calls (X-API-Key only — no member context needed,
 * the role gate lives at the layout). Each helper wraps `fetchAshleyService`
 * in `unstable_cache` with a TTL tuned to the underlying data's cadence:
 *
 *   - currentWeek (daily rotation @ UTC midnight) → 5 min
 *   - weeksList   (changes weekly @ Tuesday UTC)  → 30 min
 *   - weekByStart (archived weeks are immutable)  → 24 h
 *
 * Consumers receive `AshleyResult<T>` and pattern-match on `error.code` per
 * the existing convention (see `src/lib/api/server.ts`).
 */

export type EscalationWeekDetail = components['schemas']['EscalationWeekDetailDto']
export type EscalationWeekList = components['schemas']['EscalationWeekListDto']
export type EscalationWeekListItem = components['schemas']['EscalationWeekListItemDto']
export type EscalationMission = components['schemas']['EscalationMissionDto']
export type EscalationDailySummary = components['schemas']['EscalationDailySummaryDto']
export type EscalationDailyDetail = components['schemas']['EscalationDailyDetailDto']
export type EscalationLootItem = components['schemas']['EscalationLootItemDto']
export type EscalationPrototypeCache = components['schemas']['EscalationPrototypeCacheDto']
export type EscalationLootTypeRef = components['schemas']['EscalationLootTypeRefDto']

const LIST_TTL = 30 * 60 // 30 min
const ARCHIVED_TTL = 24 * 60 * 60 // 24 h
const CURRENT_WEEK_TTL = 5 * 60 // 5 min — current week may still be ingesting
const DAILY_TTL = 5 * 60 // 5 min — same cadence as the rotation
const DAILY_HISTORIC_TTL = 24 * 60 * 60 // older dailies are immutable


export function fetchWeekByStart(
  weekStart: string,
): Promise<AshleyResult<EscalationWeekDetail>> {
  // Use the short TTL for the active week — a 404 here on Tuesday rollover
  // must not stick around for 24h after upstream finally ingests.
  const ttl = weekStart === currentWeekStartUtc() ? CURRENT_WEEK_TTL : ARCHIVED_TTL
  const cached = unstable_cache(
    () =>
      fetchAshleyService<EscalationWeekDetail>((c) =>
        c.GET('/api/division2/escalation/weeks/{weekStart}', {
          params: { path: { weekStart } },
        }),
      ),
    ['division2-escalation-week', weekStart],
    { revalidate: ttl, tags: ['escalation', 'escalation-week'] },
  )
  return cached()
}

const cachedList = unstable_cache(
  () =>
    fetchAshleyService<EscalationWeekList>((c) =>
      c.GET('/api/division2/escalation/weeks'),
    ),
  ['division2-escalation-list'],
  { revalidate: LIST_TTL, tags: ['escalation', 'escalation-list'] },
)

export function fetchWeeksList(): Promise<AshleyResult<EscalationWeekList>> {
  return cachedList()
}

/**
 * Fetch a single day's escalation data directly. This is the *authoritative*
 * source for a specific day — it returns items + prototype caches + an
 * embedded week summary (weekStart + missions). Far more reliable than
 * pulling the whole week and digging through `dailies[]` for a single day,
 * because each day is keyed by its own URL and the response contract is
 * focused on that day.
 *
 * TTL is tighter for today (5 min) than for historic days (24h) since
 * historic data doesn't change. Each `day` gets its own cache entry so
 * day-stepper navigation is bursty-write, hot-read.
 */
export function fetchDailyByDay(day: string): Promise<AshleyResult<EscalationDailyDetail>> {
  // Any day in the current week may still be mid-ingestion — not just today —
  // so a 404 must keep the short TTL, or it sticks for 24h after upstream
  // finally publishes. Only archived weeks are immutable.
  const ttl =
    weekStartForDayUtc(day) === currentWeekStartUtc() ? DAILY_TTL : DAILY_HISTORIC_TTL
  const cached = unstable_cache(
    () =>
      fetchAshleyService<EscalationDailyDetail>((c) =>
        c.GET('/api/division2/escalation/dailies/{day}', {
          params: { path: { day } },
        }),
      ),
    ['division2-escalation-daily', day],
    { revalidate: ttl, tags: ['escalation', 'escalation-daily'] },
  )
  return cached()
}

/**
 * The day-stepper's forward ceiling: the latest day in the current escalation
 * week that has actually ingested. Returns `undefined` when `viewedDay` isn't
 * in the current week (archived weeks are complete — they have no frontier).
 *
 * Keeps the "current week vs archived" rule in the data layer alongside the
 * cache-TTL fetchers, rather than re-deriving it in the view. Takes the max of
 * `week.dailies` (defensive against unordered / datetime-form day strings)
 * instead of trusting the array tail.
 */
export function currentWeekFrontierDay(
  week: EscalationWeekDetail,
  viewedDay: string,
): string | undefined {
  if (weekStartForDayUtc(viewedDay) !== currentWeekStartUtc()) return undefined
  let latest: string | undefined
  for (const summary of week.dailies) {
    const day = normalizeDayIso(summary.day)
    if (!latest || day > latest) latest = day
  }
  return latest
}
