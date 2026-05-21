import { EscalationPage } from '@/components/division2/escalation/EscalationPage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import {
  fetchDailyByDay,
  fetchWeekByStart,
} from '@/lib/division2/escalation.server'
import { todayUtcIso, weekStartForDayUtc } from '@/lib/division2/format'

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

export default async function Division2EscalationPage({ searchParams }: PageProps) {
  const { day } = await searchParams
  const todayIso = todayUtcIso()
  // URL-typed future days clamp to today.
  const targetDay = day && day <= todayIso ? day : todayIso
  const weekStart = weekStartForDayUtc(targetDay)

  // Daily for items + caches. Week as a missions fallback when the daily 404s
  // (e.g., early Tuesday before today's daily ingests).
  const [daily, week, division2] = await Promise.all([
    fetchDailyByDay(targetDay),
    fetchWeekByStart(weekStart),
    cachedFindGlobal('division2'),
  ])

  return (
    <EscalationPage
      daily={daily}
      week={week}
      targetDay={targetDay}
      content={division2.escalationPage ?? null}
    />
  )
}
