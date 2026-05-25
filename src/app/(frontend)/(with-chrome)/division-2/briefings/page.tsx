import { BriefingsPage } from '@/components/division2/briefings/BriefingsPage'
import type { WeekStepperState } from '@/components/division2/briefings/WeekStepper'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasBriefingsAccess } from '@/lib/auth/badges'
import {
  fetchRecentDailyBriefings,
  fetchWeeklyBriefings,
  parseWeekParam,
  type Briefing,
} from '@/lib/division2/briefing.server'
import { formatDayShort, mondayOfWeekUtc, todayUtcIso } from '@/lib/division2/format'

// Dynamic rendering is already implicit: this page reads `searchParams`
// (?week, ?as) and `getMemberAuth()` reads cookies — either alone opts the
// route out of static prerendering. Data freshness is governed by the
// `unstable_cache` TTLs on the briefing fetches, not by route-level dynamic.

const DEFAULT_TITLE = 'Briefings Archive | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'AI-summarized weekly and daily briefings for The Division 2 — distilled from the YouTube, Reddit, and Ubisoft firehose.'

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.briefingsPage?.seo
  return {
    title: seo?.title?.trim() || DEFAULT_TITLE,
    description: seo?.description?.trim() || DEFAULT_DESCRIPTION,
  }
}

interface PageProps {
  searchParams: Promise<{ week?: string; as?: string }>
}

export default async function Division2BriefingsPage({ searchParams }: PageProps) {
  const { week: rawWeek, as: rawAs } = await searchParams
  const requestedDay = parseWeekParam(rawWeek)
  const requestedWeekStart = requestedDay ? mondayOfWeekUtc(requestedDay) : null

  const auth = await getMemberAuth()
  // `?as=member` URL override (dev-only via the env check inside the helper)
  // still works for previewing the non-booster experience; the visible toggle
  // UI was removed for visual cleanliness.
  const hasAccess = hasBriefingsAccess(auth.symbolicRoles, {
    devOverride: rawAs === 'member' ? 'member' : null,
  })

  // Fetch weeklies + (booster-only) dailies in parallel; weeklies is the
  // primary call — its failure surfaces as the page-level error.
  const [weekliesResult, dailiesResult, division2] = await Promise.all([
    fetchWeeklyBriefings({ limit: 20 }),
    hasAccess ? fetchRecentDailyBriefings({ limit: 30 }) : Promise.resolve(null),
    cachedFindGlobal('division2'),
  ])

  const weeklies = weekliesResult.ok ? weekliesResult.data.items : []
  const dailies = dailiesResult?.ok ? dailiesResult.data : []
  // Merged feed, periodStart desc. Weeklies and dailies share the timeline —
  // a weekly's periodStart (Monday) places it at the start of its week.
  const merged: Briefing[] = [...weeklies, ...dailies].sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  )

  // Calendar weeks (Mondays) that contain at least one briefing, desc.
  const weekStartsInData = uniqueWeekStartsDesc(merged)

  // Active week: URL override if it points to a week with data; else newest
  // week with data; else today's Monday (gives a sensible empty state).
  const activeWeekStart =
    pickActiveWeekStart(requestedWeekStart, weekStartsInData) ??
    mondayOfWeekUtc(todayUtcIso())

  const briefingsForWeek = filterToWeek(merged, activeWeekStart)
  const stepper = buildStepper(weekStartsInData, activeWeekStart)
  const isLatestWeek = activeWeekStart === weekStartsInData[0]

  return (
    <BriefingsPage
      weekly={weekliesResult}
      briefingsForWeek={briefingsForWeek}
      activeWeekStart={activeWeekStart}
      hasAccess={hasAccess}
      stepper={stepper}
      isLatestWeek={isLatestWeek}
      content={division2.briefingsPage ?? null}
    />
  )
}

/**
 * Pick the calendar-week Monday to render. URL `?week=` wins when valid;
 * otherwise default to the newest week with data. Returns null when there's
 * no data at all (caller falls back to today's Monday for an empty state).
 */
function pickActiveWeekStart(
  requested: string | null,
  weekStartsInData: string[],
): string | null {
  if (requested) return requested
  return weekStartsInData[0] ?? null
}

function filterToWeek(merged: Briefing[], weekStart: string): Briefing[] {
  const weekEnd = addDaysUtc(weekStart, 7)
  return merged.filter(
    (d) => d.periodStart >= weekStart && d.periodStart < weekEnd,
  )
}

function uniqueWeekStartsDesc(merged: Briefing[]): string[] {
  const set = new Set<string>()
  for (const d of merged) set.add(mondayOfWeekUtc(d.periodStart))
  return [...set].sort().reverse()
}

/**
 * Stepper bounds = data-driven. Prev / next jump to the nearest week that
 * actually has briefings; the user can't paginate into an empty void. When the
 * active week itself has no data (e.g. the user typed a custom URL), prev /
 * next still point to the bracketing data-bearing weeks.
 */
function buildStepper(
  weekStartsDesc: string[],
  activeWeekStart: string,
): WeekStepperState | null {
  if (weekStartsDesc.length === 0) return null
  // Nearest neighbors: in a desc-sorted list, the first match `< active` is
  // the largest-below-active (nearest older), and the first match `> active`
  // when scanning ascending is the smallest-above-active (nearest newer).
  const older = weekStartsDesc.find((w) => w < activeWeekStart) ?? null
  const newer = [...weekStartsDesc].reverse().find((w) => w > activeWeekStart) ?? null

  return {
    current: {
      periodStart: activeWeekStart,
      periodEnd: addDaysUtc(activeWeekStart, 7),
      label: `${formatDayShort(activeWeekStart)} → ${formatDayShort(addDaysUtc(activeWeekStart, 6))}`,
    },
    prev: older
      ? {
          periodStart: older,
          href: urlForWeek(older),
          label: formatDayShort(older),
        }
      : null,
    next: newer
      ? {
          periodStart: newer,
          href: urlForWeek(newer),
          label: formatDayShort(newer),
        }
      : null,
  }
}

function urlForWeek(weekStart: string): string {
  return `/division-2/briefings?week=${weekStart}`
}

function addDaysUtc(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return iso
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
