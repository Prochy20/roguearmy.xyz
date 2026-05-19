import { EscalationPage } from '@/components/division2/escalation/EscalationPage'
import {
  fetchDailyByDay,
  fetchWeekByStart,
} from '@/lib/division2/escalation.server'
import { todayUtcIso, weekStartForDayUtc } from '@/lib/division2/format'

export const metadata = {
  title: 'Escalation Protocol | Division 2 · Rogue Army',
  description:
    'Active targeted-loot rotation for The Division 2 escalation — step through any day to see what drops from each mission.',
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
  const [daily, week] = await Promise.all([
    fetchDailyByDay(targetDay),
    fetchWeekByStart(weekStart),
  ])

  return <EscalationPage daily={daily} week={week} targetDay={targetDay} />
}
