import { DigestPage } from '@/components/division2/digest/DigestPage'
import type { WeekStepperState } from '@/components/division2/digest/WeekStepper'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasDigestAccess } from '@/lib/auth/badges'
import {
  fetchRecentDailyDigests,
  fetchWeeklyDigests,
  parseWeekParam,
  type Digest,
} from '@/lib/division2/digest.server'
import { formatDayShort, mondayOfWeekUtc, todayUtcIso } from '@/lib/division2/format'

// Dynamic rendering is already implicit: this page reads `searchParams`
// (?week, ?as) and `getMemberAuth()` reads cookies — either alone opts the
// route out of static prerendering. Data freshness is governed by the
// `unstable_cache` TTLs on the digest fetches, not by route-level dynamic.

const DEFAULT_TITLE = 'Digest Archive | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'AI-summarized weekly and daily digests for The Division 2 — distilled from the YouTube, Reddit, and Ubisoft firehose.'

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.digestPage?.seo
  return {
    title: seo?.title?.trim() || DEFAULT_TITLE,
    description: seo?.description?.trim() || DEFAULT_DESCRIPTION,
  }
}

interface PageProps {
  searchParams: Promise<{ week?: string; as?: string }>
}

export default async function Division2DigestPage({ searchParams }: PageProps) {
  const { week: rawWeek, as: rawAs } = await searchParams
  const requestedDay = parseWeekParam(rawWeek)
  const requestedWeekStart = requestedDay ? mondayOfWeekUtc(requestedDay) : null
  const isPreviewingAsMember = rawAs === 'member'
  const showDevToggle = process.env.NODE_ENV !== 'production'

  const auth = await getMemberAuth()
  const hasAccess = hasDigestAccess(auth.symbolicRoles, {
    devOverride: isPreviewingAsMember ? 'member' : null,
  })

  // Fetch weeklies + (booster-only) dailies in parallel; weeklies is the
  // primary call — its failure surfaces as the page-level error.
  const [weekliesResult, dailiesResult, division2] = await Promise.all([
    fetchWeeklyDigests({ limit: 20 }),
    hasAccess ? fetchRecentDailyDigests({ limit: 30 }) : Promise.resolve(null),
    cachedFindGlobal('division2'),
  ])

  const weeklies = weekliesResult.ok ? weekliesResult.data.items : []
  const dailies = dailiesResult?.ok ? dailiesResult.data : []
  // Merged feed, periodStart desc. Weeklies and dailies share the timeline —
  // a weekly's periodStart (Monday) places it at the start of its week.
  const merged: Digest[] = [...weeklies, ...dailies].sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  )

  // Calendar weeks (Mondays) that contain at least one digest, desc.
  const weekStartsInData = uniqueWeekStartsDesc(merged)

  // Active week: URL override if it points to a week with data; else newest
  // week with data; else today's Monday (gives a sensible empty state).
  const activeWeekStart =
    pickActiveWeekStart(requestedWeekStart, weekStartsInData) ??
    mondayOfWeekUtc(todayUtcIso())

  const digestsForWeek = filterToWeek(merged, activeWeekStart)
  const stepper = buildStepper(weekStartsInData, activeWeekStart)
  const isLatestWeek = activeWeekStart === weekStartsInData[0]

  return (
    <DigestPage
      weekly={weekliesResult}
      digestsForWeek={digestsForWeek}
      activeWeekStart={activeWeekStart}
      hasAccess={hasAccess}
      isPreviewingAsMember={isPreviewingAsMember}
      showDevToggle={showDevToggle}
      stepper={stepper}
      isLatestWeek={isLatestWeek}
      content={division2.digestPage ?? null}
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

function filterToWeek(merged: Digest[], weekStart: string): Digest[] {
  const weekEnd = addDaysUtc(weekStart, 7)
  return merged.filter(
    (d) => d.periodStart >= weekStart && d.periodStart < weekEnd,
  )
}

function uniqueWeekStartsDesc(merged: Digest[]): string[] {
  const set = new Set<string>()
  for (const d of merged) set.add(mondayOfWeekUtc(d.periodStart))
  return [...set].sort().reverse()
}

/**
 * Stepper bounds = data-driven. Prev / next jump to the nearest week that
 * actually has digests; the user can't paginate into an empty void. When the
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
  return `/division-2/digest?week=${weekStart}`
}

function addDaysUtc(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return iso
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
