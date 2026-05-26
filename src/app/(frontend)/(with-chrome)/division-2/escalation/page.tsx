import { EscalationPage } from '@/components/division2/escalation/EscalationPage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import {
  fetchDailyByDay,
  fetchWeekByStart,
  type EscalationDailyDetail,
} from '@/lib/division2/escalation.server'
import type { AshleyResult } from '@/lib/api/server'
import { previousDayUtc, todayUtcIso, weekStartForDayUtc } from '@/lib/division2/format'

// Dynamic rendering is implicit via the `searchParams` read below. Data
// freshness is governed by the `unstable_cache` TTLs on `fetchDailyByDay`
// and `fetchWeekByStart`; the route-level `dynamic` directive doesn't
// affect `unstable_cache`, so declaring it here would have been redundant.

const DEFAULT_TITLE = 'Escalation Protocol | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'Active targeted-loot rotation for The Division 2 escalation — step through any day to see what drops from each mission.'

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.escalationPage?.seo
  return {
    title: seo?.title?.trim() || DEFAULT_TITLE,
    description: seo?.description?.trim() || DEFAULT_DESCRIPTION,
  }
}

interface PageProps {
  searchParams: Promise<{ day?: string }>
}

// On Tuesday rollover Ashley hasn't ingested the new week yet, so today's
// daily 404s. Walk back up to a full week to surface the most recent day
// that does have data; an explicit `?day=` in the URL is left alone so the
// day-stepper never silently drifts.
const MAX_FALLBACK_DAYS = 6

async function resolveDailyWithFallback(
  requestedDay: string,
  respectExplicit: boolean,
): Promise<{ resolvedDay: string; daily: AshleyResult<EscalationDailyDetail> }> {
  let cursor = requestedDay
  let lastDaily = await fetchDailyByDay(cursor)
  if (lastDaily.ok || respectExplicit) {
    return { resolvedDay: cursor, daily: lastDaily }
  }
  for (let i = 0; i < MAX_FALLBACK_DAYS; i++) {
    if (lastDaily.ok) return { resolvedDay: cursor, daily: lastDaily }
    if (lastDaily.error.code !== 'not_found') break
    cursor = previousDayUtc(cursor)
    lastDaily = await fetchDailyByDay(cursor)
  }
  return lastDaily.ok
    ? { resolvedDay: cursor, daily: lastDaily }
    : { resolvedDay: requestedDay, daily: await fetchDailyByDay(requestedDay) }
}

export default async function Division2EscalationPage({ searchParams }: PageProps) {
  const { day } = await searchParams
  const todayIso = todayUtcIso()
  // URL-typed future days clamp to today.
  const requestedDay = day && day <= todayIso ? day : todayIso
  const respectExplicit = Boolean(day) && day === requestedDay

  const { resolvedDay, daily } = await resolveDailyWithFallback(
    requestedDay,
    respectExplicit,
  )
  const weekStart = weekStartForDayUtc(resolvedDay)

  // True when we asked for today (no explicit `?day`) but had to walk back —
  // the page is showing the last available day while waiting on upstream.
  const awaitingTodayIngest = !respectExplicit && resolvedDay !== todayIso

  const [week, division2] = await Promise.all([
    fetchWeekByStart(weekStart),
    cachedFindGlobal('division2'),
  ])

  return (
    <EscalationPage
      daily={daily}
      week={week}
      targetDay={resolvedDay}
      awaitingTodayIngest={awaitingTodayIngest}
      content={division2.escalationPage ?? null}
    />
  )
}
