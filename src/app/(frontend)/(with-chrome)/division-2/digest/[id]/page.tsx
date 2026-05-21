import { notFound } from 'next/navigation'
import { EmptyDossier } from '@/components/shared/EmptyDossier'
import { FailRow } from '@/components/shared/FailRow'
import { DigestDetailPage } from '@/components/division2/digest/DigestDetailPage'
import { getMemberAuth } from '@/lib/auth/session.server'
import { hasDigestAccess } from '@/lib/auth/badges'
import {
  buildDigestDesignator,
  countMarkdownWords,
  enumerateSections,
  fetchDigestById,
  fetchRecentDigests,
  fetchWeeklyDigests,
  injectSectionAnchors,
  promoteH1ToH2,
  type Digest,
  type DigestDetail,
  type DigestSection,
} from '@/lib/division2/digest.server'
import {
  buildCitationIndex,
  transformCitationMarkers,
} from '@/lib/division2/digest.citations'

// Dynamic rendering is implicit: `params`, `searchParams`, and the cookie
// read inside `getMemberAuth()` each opt this route out of static
// prerendering. Data freshness comes from the `unstable_cache` TTL on
// `fetchDigestById`, not the route-level dynamic mode.

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ as?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const result = await fetchDigestById(id)
  if (!result.ok || !result.data) {
    return { title: 'Briefing | Division 2 · Rogue Army' }
  }
  return {
    title: `${result.data.title} | Division 2 · Rogue Army`,
    description: result.data.perex,
  }
}

export default async function Division2DigestDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { as: rawAs } = await searchParams
  const isPreviewingAsMember = rawAs === 'member'

  const [digestResult, auth] = await Promise.all([
    fetchDigestById(id),
    getMemberAuth(),
  ])

  if (!digestResult.ok) {
    return (
      <FailWrapper>
        <FailRow
          code={digestResult.error.code}
          status={digestResult.error.status}
          returnTo="/division-2/digest"
        />
      </FailWrapper>
    )
  }
  if (!digestResult.data) notFound()

  const digest = digestResult.data
  const hasAccess = hasDigestAccess(auth.symbolicRoles, {
    devOverride: isPreviewingAsMember ? 'member' : null,
  })

  // Gate: non-boosters never read daily briefings via direct URL.
  if (digest.frequency === 'daily' && !hasAccess) {
    return (
      <FailWrapper>
        <EmptyDossier kind="BOOSTER_REQUIRED" />
      </FailWrapper>
    )
  }

  const { transformed, sections } = transformDigestBody(digest)
  const wordCount = countMarkdownWords(digest.content)
  const readMinutes = Math.max(1, Math.floor(wordCount / 200))
  const designator = buildDigestDesignator(digest)
  // Daily digests are booster-gated. Weekly are public. The MEMBERS ONLY tag
  // mirrors the same boolean that powered the gate above.
  const isMembersOnly = digest.frequency === 'daily'

  const [recent, weeklies] = await Promise.all([
    fetchRecentDigests(30),
    fetchWeeklyDigests({ limit: 20 }),
  ])

  const neighbors = recent.ok ? findNeighbors(recent.data, digest, hasAccess) : { prev: null, next: null }
  const weekPeriodStart = resolveWeekPeriodStart(
    digest,
    weeklies.ok ? weeklies.data.items : [],
  )
  const related = recent.ok
    ? findRelated(recent.data, digest, hasAccess)
    : []

  return (
    <DigestDetailPage
      digest={digest}
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

interface TransformedDigestBody {
  /** Markdown with citations + section anchors both injected. */
  transformed: string
  /** Section manifest shared between the body and the ToC. */
  sections: DigestSection[]
}

/**
 * Two-step server transform applied to the digest body before it reaches
 * the client renderer:
 *  1. Citation markers `(ref:UUID)` → `<sup>[N]</sup>` anchors.
 *  2. `## Title` → `<h2 id="sec-NN" data-sec-num="NN">Title</h2>` so the
 *     ToC and the body share the same section IDs by construction.
 * The section manifest is returned alongside the transformed string so the
 * ToC component can render without re-parsing the body.
 */
function transformDigestBody(digest: DigestDetail): TransformedDigestBody {
  // Promote any `# Title` in the body to `## Title` first — the page title
  // already serves as the document H1, so bare H1s in Ashley's content
  // should read as top-level sections, not competing document titles.
  const promoted = promoteH1ToH2(digest.content)

  // Enumerate sections from the promoted markdown. Tries H2 first, falls
  // back to H3 when the body has no H2s — keeps the ToC alive for digests
  // authored with `#` for title + `###` for sections (now also picks up
  // promoted `# → ##` H1s).
  const { level, sections } = enumerateSections(promoted)

  const index = buildCitationIndex(digest.articles)
  const { output, unresolved } = transformCitationMarkers(promoted, index)
  if (process.env.NODE_ENV !== 'production' && unresolved.length > 0) {
    console.warn(
      `[digest ${digest.id}] unresolved citation markers:`,
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
  all: Digest[],
  current: Digest,
  hasAccess: boolean,
): { prev: Digest | null; next: Digest | null } {
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
 * Pick up to 3 related digests to surface below the sources table.
 *
 * Selection rule: prefer same-frequency siblings (a weekly's "related"
 * leans into more weeklies; daily → more dailies), so the cards read as
 * "more of what you're reading". Fall back to other-frequency entries if
 * the same-frequency pool runs short. Always excludes the current digest.
 * Non-boosters never see daily entries — same gating as the neighbor walk.
 */
function findRelated(
  all: Digest[],
  current: Digest,
  hasAccess: boolean,
): Digest[] {
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
 * Determine which weekly digest contains this digest's period — used by the
 * back-to-week footer link. Weekly digest → itself. Daily digest → the weekly
 * whose [periodStart, periodEnd] covers it.
 */
function resolveWeekPeriodStart(digest: Digest, weeklies: Digest[]): string {
  if (digest.frequency === 'weekly') return digest.periodStart
  const containing = weeklies.find(
    (w) =>
      w.periodStart <= digest.periodStart && digest.periodStart <= w.periodEnd,
  )
  return containing?.periodStart ?? digest.periodStart
}
