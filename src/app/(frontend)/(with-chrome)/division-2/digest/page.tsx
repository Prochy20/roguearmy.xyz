import { DigestPage } from '@/components/division2/digest/DigestPage'
import type { WeekStepperState } from '@/components/division2/digest/WeekStepper'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasDigestAccess } from '@/lib/auth/badges'
import {
  fetchDailyDigestsForWeek,
  fetchWeeklyDigests,
  parseWeekParam,
  type Digest,
} from '@/lib/division2/digest.server'
import { formatDayShort } from '@/lib/division2/format'

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
  const requestedWeek = parseWeekParam(rawWeek)
  const isPreviewingAsMember = rawAs === 'member'
  const showDevToggle = process.env.NODE_ENV !== 'production'

  const auth = await getMemberAuth()
  const hasAccess = hasDigestAccess(auth.symbolicRoles, {
    devOverride: isPreviewingAsMember ? 'member' : null,
  })

  const [weekly, division2] = await Promise.all([
    fetchWeeklyDigests({ limit: 20 }),
    cachedFindGlobal('division2'),
  ])

  // Resolve the current week — URL match if provided, otherwise newest.
  const currentWeekly = weekly.ok ? pickCurrentWeekly(weekly.data.items, requestedWeek) : null

  // Boosters get daily fetches; non-boosters skip the call entirely.
  const dailies =
    hasAccess && currentWeekly
      ? await fetchDailyDigestsForWeek({
          periodStart: currentWeekly.periodStart,
          periodEnd: currentWeekly.periodEnd,
        })
      : null

  const stepper =
    weekly.ok && currentWeekly ? buildStepper(weekly.data.items, currentWeekly) : null

  // Only the newest week gets the LATEST hero treatment — paginating back
  // collapses the page to a uniform archive grid (no hero callout).
  const newestWeeklyId = weekly.ok ? weekly.data.items[0]?.id ?? null : null
  const isLatestWeek = currentWeekly?.id != null && currentWeekly.id === newestWeeklyId

  return (
    <DigestPage
      weekly={weekly}
      currentWeekly={currentWeekly}
      dailies={dailies}
      hasAccess={hasAccess}
      isPreviewingAsMember={isPreviewingAsMember}
      showDevToggle={showDevToggle}
      stepper={stepper}
      isLatestWeek={isLatestWeek}
      content={division2.digestPage ?? null}
    />
  )
}

/** Find the weekly matching `?week=` or fall back to the newest. */
function pickCurrentWeekly(items: Digest[], requested: string | null): Digest | null {
  if (items.length === 0) return null
  if (requested) {
    return items.find((d) => d.periodStart === requested) ?? null
  }
  return items[0]
}

/**
 * Build the stepper from the (date-desc) weeklies list. Prev = older entry
 * (next in array). Next = newer entry (previous in array). Both null at the
 * boundaries.
 */
function buildStepper(items: Digest[], current: Digest): WeekStepperState {
  const index = items.findIndex((d) => d.id === current.id)
  const newer = index > 0 ? items[index - 1] : null
  const older = index >= 0 && index < items.length - 1 ? items[index + 1] : null

  return {
    current: {
      periodStart: current.periodStart,
      periodEnd: current.periodEnd,
      label: `${formatDayShort(current.periodStart)} → ${formatDayShort(current.periodEnd)}`,
    },
    prev: older
      ? {
          periodStart: older.periodStart,
          href: urlForWeek(older.periodStart),
          label: formatDayShort(older.periodStart),
        }
      : null,
    next: newer
      ? {
          periodStart: newer.periodStart,
          href: urlForWeek(newer.periodStart),
          label: formatDayShort(newer.periodStart),
        }
      : null,
  }
}

function urlForWeek(periodStart: string): string {
  return `/division-2/digest?week=${periodStart}`
}
