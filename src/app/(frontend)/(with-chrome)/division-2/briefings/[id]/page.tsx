import { notFound } from 'next/navigation'
import { EmptyDossier } from '@/components/division2/EmptyDossier'
import { FailRow } from '@/components/ui/FailRow'
import { BriefingDetailPage } from '@/components/division2/briefings/BriefingDetailPage'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasBriefingsAccess } from '@/lib/auth/badges'
import {
  buildBriefingDesignator,
  countMarkdownWords,
  enumerateSections,
  fetchBriefingById,
  fetchRecentBriefings,
  fetchWeeklyBriefings,
  injectSectionAnchors,
  promoteH1ToH2,
  type Briefing,
  type BriefingDetail,
  type BriefingSection,
} from '@/lib/division2/briefing.server'
import {
  buildCitationIndex,
  transformCitationMarkers,
} from '@/lib/division2/briefing.citations'

// Dynamic rendering is implicit: `params`, `searchParams`, and the cookie
// read inside `getMemberAuth()` each opt this route out of static
// prerendering. Data freshness comes from the `unstable_cache` TTL on
// `fetchBriefingById`, not the route-level dynamic mode.

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ as?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const result = await fetchBriefingById(id)
  if (!result.ok || !result.data) {
    return { title: 'Briefing | Division 2 · Rogue Army' }
  }
  return {
    title: `${result.data.title} | Division 2 · Rogue Army`,
    description: result.data.perex,
  }
}

export default async function Division2BriefingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { as: rawAs } = await searchParams
  const isPreviewingAsMember = rawAs === 'member'

  const [briefingResult, auth] = await Promise.all([
    fetchBriefingById(id),
    getMemberAuth(),
  ])

  if (!briefingResult.ok) {
    return (
      <FailWrapper>
        <FailRow
          code={briefingResult.error.code}
          status={briefingResult.error.status}
          returnTo="/division-2/briefings"
        />
      </FailWrapper>
    )
  }
  if (!briefingResult.data) notFound()

  const briefing = briefingResult.data
  const hasAccess = hasBriefingsAccess(auth.symbolicRoles, {
    devOverride: isPreviewingAsMember ? 'member' : null,
  })

  // Gate: non-boosters never read daily briefings via direct URL.
  if (briefing.frequency === 'daily' && !hasAccess) {
    return (
      <FailWrapper>
        <EmptyDossier kind="BOOSTER_REQUIRED" />
      </FailWrapper>
    )
  }

  const { transformed, sections } = transformBriefingBody(briefing)
  const wordCount = countMarkdownWords(briefing.content)
  const readMinutes = Math.max(1, Math.floor(wordCount / 200))
  const designator = buildBriefingDesignator(briefing)
  // Daily briefings are booster-gated. Weekly are public. The MEMBERS ONLY tag
  // mirrors the same boolean that powered the gate above.
  const isMembersOnly = briefing.frequency === 'daily'

  const [recent, weeklies] = await Promise.all([
    fetchRecentBriefings(30),
    fetchWeeklyBriefings({ limit: 20 }),
  ])

  const neighbors = recent.ok ? findNeighbors(recent.data, briefing, hasAccess) : { prev: null, next: null }
  const weekPeriodStart = resolveWeekPeriodStart(
    briefing,
    weeklies.ok ? weeklies.data.items : [],
  )
  const related = recent.ok
    ? findRelated(recent.data, briefing, hasAccess)
    : []

  return (
    <BriefingDetailPage
      briefing={briefing}
      transformedContent={transformed}
      sections={sections}
      designator={designator}
      wordCount={wordCount}
      readMinutes={readMinutes}
      isMembersOnly={isMembersOnly}
      weekPeriodStart={weekPeriodStart}
      prev={neighbors.prev}
      next={neighbors.next}
      related={related}
    />
  )
}

function FailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-10 px-4 pt-24 pb-24 sm:gap-14 sm:px-8 sm:pt-32 sm:pb-28 lg:px-12 lg:pt-36 lg:pb-36">
      {children}
    </div>
  )
}

interface TransformedBriefingBody {
  /** Markdown with citations + section anchors both injected. */
  transformed: string
  /** Section manifest shared between the body and the ToC. */
  sections: BriefingSection[]
}

/**
 * Two-step server transform applied to the briefing body before it reaches
 * the client renderer:
 *  1. Citation markers `(ref:UUID)` → `<sup>[N]</sup>` anchors.
 *  2. `## Title` → `<h2 id="sec-NN" data-sec-num="NN">Title</h2>` so the
 *     ToC and the body share the same section IDs by construction.
 * The section manifest is returned alongside the transformed string so the
 * ToC component can render without re-parsing the body.
 */
function transformBriefingBody(briefing: BriefingDetail): TransformedBriefingBody {
  // Promote any `# Title` in the body to `## Title` first — the page title
  // already serves as the document H1, so bare H1s in Ashley's content
  // should read as top-level sections, not competing document titles.
  const promoted = promoteH1ToH2(briefing.content)

  // Enumerate sections from the promoted markdown. Tries H2 first, falls
  // back to H3 when the body has no H2s — keeps the ToC alive for briefings
  // authored with `#` for title + `###` for sections (now also picks up
  // promoted `# → ##` H1s).
  const { level, sections } = enumerateSections(promoted)

  const index = buildCitationIndex(briefing.articles)
  const { output, unresolved } = transformCitationMarkers(promoted, index)
  if (process.env.NODE_ENV !== 'production' && unresolved.length > 0) {
    console.warn(
      `[briefing ${briefing.id}] unresolved citation markers:`,
      unresolved,
    )
  }

  const withSectionAnchors = injectSectionAnchors(output, sections, level)
  return { transformed: withSectionAnchors, sections }
}

/**
 * Walk the merged daily+weekly list to find chronological neighbors.
 * Non-boosters never reach this for dailies (gated above) — but for weeklies
 * they should only step between weeklies, so filter the list when applicable.
 */
function findNeighbors(
  all: Briefing[],
  current: Briefing,
  hasAccess: boolean,
): { prev: Briefing | null; next: Briefing | null } {
  const candidates = hasAccess
    ? all
    : all.filter((d) => d.frequency === 'weekly')
  const index = candidates.findIndex((d) => d.id === current.id)
  if (index === -1) return { prev: null, next: null }
  const next = index > 0 ? candidates[index - 1] : null
  const prev = index < candidates.length - 1 ? candidates[index + 1] : null
  return { prev, next }
}

/**
 * Pick up to 3 related briefings to surface below the sources table.
 *
 * Selection rule: prefer same-frequency siblings (a weekly's "related"
 * leans into more weeklies; daily → more dailies), so the cards read as
 * "more of what you're reading". Fall back to other-frequency entries if
 * the same-frequency pool runs short. Always excludes the current briefing.
 * Non-boosters never see daily entries — same gating as the neighbor walk.
 */
function findRelated(
  all: Briefing[],
  current: Briefing,
  hasAccess: boolean,
): Briefing[] {
  const pool = all.filter((d) => d.id !== current.id)
  const candidates = hasAccess
    ? pool
    : pool.filter((d) => d.frequency === 'weekly')
  const sameFreq = candidates.filter((d) => d.frequency === current.frequency)
  const otherFreq = candidates.filter((d) => d.frequency !== current.frequency)
  // Fill from same-frequency first, then top up with other-frequency.
  return [...sameFreq, ...otherFreq].slice(0, 3)
}

/**
 * Determine which weekly briefing contains this briefing's period — used by the
 * back-to-week footer link. Weekly briefing → itself. Daily briefing → the weekly
 * whose [periodStart, periodEnd] covers it.
 */
function resolveWeekPeriodStart(briefing: Briefing, weeklies: Briefing[]): string {
  if (briefing.frequency === 'weekly') return briefing.periodStart
  const containing = weeklies.find(
    (w) =>
      w.periodStart <= briefing.periodStart && briefing.periodStart <= w.periodEnd,
  )
  return containing?.periodStart ?? briefing.periodStart
}
