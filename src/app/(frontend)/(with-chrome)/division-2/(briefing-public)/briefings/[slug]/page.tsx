import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { EmptyDossier } from '@/components/division2/EmptyDossier'
import { FailRow } from '@/components/ui/FailRow'
import { BriefingDetailPage } from '@/components/division2/briefings/BriefingDetailPage'
import { BriefingTeaserView } from '@/components/division2/briefings/BriefingTeaserView'
import { getMemberAuth } from '@/lib/auth/session.server'
import { checkRoleGate } from '@/lib/auth/roleGate'
import { hasBriefingsAccess } from '@/lib/auth/badges'
import { formatDayShort } from '@/lib/division2/format'
import {
  buildBriefingDesignator,
  countMarkdownWords,
  enumerateSections,
  fetchBriefingByPrefix,
  fetchRecentBriefings,
  fetchWeeklyBriefings,
  injectSectionAnchors,
  parseSlugSegment,
  promoteH1ToH2,
  type Briefing,
  type BriefingDetail,
  type BriefingSection,
} from '@/lib/division2/briefing.server'
import {
  buildCitationIndex,
  transformCitationMarkers,
} from '@/lib/division2/briefing.citations'
import { getSiteUrl } from '@/lib/seo/siteUrl'

// Dynamic rendering is implicit: `params`, `searchParams`, and the cookie
// read inside `getMemberAuth()` each opt this route out of static
// prerendering. Data freshness comes from the `unstable_cache` TTL on
// `fetchBriefingById`, not the route-level dynamic mode.
//
// This page lives outside the `(gated)` route group so anonymous visitors
// can land on a shareable preview (`BriefingTeaserView`) and receive proper
// OG/JSON-LD metadata. All auth states resolve inside this file — the
// previous layout-level gate no longer covers this route.

const siteUrl = getSiteUrl()

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ as?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlugSegment(slug)
  if (!parsed) return { title: 'Briefing | Division 2 · Rogue Army' }
  const result = await fetchBriefingByPrefix(parsed.prefix)
  if (!result.ok || !result.data) {
    return { title: 'Briefing | Division 2 · Rogue Army' }
  }
  const briefing = result.data
  const canonicalPath = briefing.canonicalPath
  const hasThumb = Boolean(briefing.thumbnailUrl)
  const imageUrl = briefing.thumbnailUrl ?? '/images/banner.jpg'
  // YouTube thumbnails are 1280×720; the site banner fallback is 960×540.
  // Declare the true dimensions so unfurlers reserve correct space.
  const imageWidth = hasThumb ? 1280 : 960
  const imageHeight = hasThumb ? 720 : 540

  return {
    title: `${briefing.title} | Division 2 · Rogue Army`,
    description: briefing.perex,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      siteName: 'Rogue Army',
      title: briefing.title,
      description: briefing.perex,
      publishedTime: briefing.periodEnd,
      modifiedTime: briefing.updatedAt,
      images: [
        {
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: briefing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: briefing.title,
      description: briefing.perex,
      images: [imageUrl],
    },
  }
}

export default async function Division2BriefingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const { as: rawAs } = await searchParams
  const isPreviewingAsMember = rawAs === 'member'

  const parsed = parseSlugSegment(slug)
  if (!parsed) notFound()

  const [briefingResult, auth] = await Promise.all([
    fetchBriefingByPrefix(parsed.prefix),
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
  // Self-healing canonical: bare-prefix and stale-slug inputs 301 to the
  // current `briefing.canonicalPath`. Preserve `?as=` previews across the
  // redirect so the booster-preview affordance survives canonicalization.
  if (slug !== `${briefing.slug}-${parsed.prefix}`) {
    const suffix = rawAs ? `?as=${encodeURIComponent(rawAs)}` : ''
    redirect(`${briefing.canonicalPath}${suffix}`)
  }
  const designator = buildBriefingDesignator(briefing)
  const periodLabel = formatPeriodLabel(briefing)
  const dateLabel = formatDateLabel(briefing)
  const wordCount = countMarkdownWords(briefing.content)
  const readMinutes = Math.max(1, Math.floor(wordCount / 200))

  // JSON-LD is rendered for every viewer — describes the URL, not the
  // session. Paywall declaration tells crawlers the body is gated; the
  // `.briefing-locked-body` selector resolves in both the teaser and the
  // full detail page (the class was added to BriefingDetailPage for parity).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: briefing.title,
    description: briefing.perex,
    image: [briefing.thumbnailUrl ?? `${siteUrl}/images/banner.jpg`],
    datePublished: briefing.periodEnd,
    dateModified: briefing.updatedAt,
    author: { '@id': `${siteUrl}/#organization` },
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${briefing.canonicalPath}`,
    },
    isAccessibleForFree: false,
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: '.briefing-locked-body',
    },
  }

  const jsonLdTag = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )

  // Anonymous: shareable hero-only preview with magenta auth CTA. Skip the
  // recent/weekly fetches — they're only needed for the full reader chrome.
  if (!auth.authenticated) {
    return (
      <>
        {jsonLdTag}
        <BriefingTeaserView
          briefing={briefing}
          designator={designator}
          periodLabel={periodLabel}
          dateLabel={dateLabel}
          readMinutes={readMinutes}
        />
      </>
    )
  }

  // Logged-in tiers: previously handled by `(gated)/layout.tsx`. Since this
  // page now sits outside that layout, resolve the gate state here so the
  // FEATURE_PENDING / ROLE_REQUIRED dossiers still render for non-allowed
  // members.
  const gate = await checkRoleGate('division2Role')
  if (gate.state === 'unconfigured') {
    return (
      <>
        {jsonLdTag}
        <FailWrapper>
          <EmptyDossier kind="FEATURE_PENDING" />
        </FailWrapper>
      </>
    )
  }
  if (gate.state === 'denied') {
    return (
      <>
        {jsonLdTag}
        <FailWrapper>
          <EmptyDossier kind="ROLE_REQUIRED" />
        </FailWrapper>
      </>
    )
  }

  const hasAccess = hasBriefingsAccess(auth.symbolicRoles, {
    devOverride: isPreviewingAsMember ? 'member' : null,
  })

  // Gate: non-boosters never read daily briefings via direct URL.
  if (briefing.frequency === 'daily' && !hasAccess) {
    return (
      <>
        {jsonLdTag}
        <FailWrapper>
          <EmptyDossier kind="BOOSTER_REQUIRED" />
        </FailWrapper>
      </>
    )
  }

  const { transformed, sections } = transformBriefingBody(briefing)
  // Daily briefings are booster-gated. Weekly are public. The MEMBERS ONLY tag
  // mirrors the same boolean that powered the gate above.
  const isMembersOnly = briefing.frequency === 'daily'

  const [recent, weeklies] = await Promise.all([
    fetchRecentBriefings(30),
    fetchWeeklyBriefings({ limit: 20 }),
  ])

  const neighbors = recent.ok
    ? findNeighbors(recent.data, briefing, hasAccess)
    : { prev: null, next: null }
  const weekPeriodStart = resolveWeekPeriodStart(
    briefing,
    weeklies.ok ? weeklies.data.items : [],
  )
  const related = recent.ok
    ? findRelated(recent.data, briefing, hasAccess)
    : []

  return (
    <>
      {jsonLdTag}
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
    </>
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

/**
 * Format the period for the hero metadata strip (compact form).
 * Weekly → "MAY 19 → MAY 25". Daily → "MAY 19".
 */
function formatPeriodLabel(briefing: Briefing): string {
  if (briefing.frequency === 'weekly') {
    return `${formatDayShort(briefing.periodStart)} → ${formatDayShort(briefing.periodEnd)}`
  }
  return formatDayShort(briefing.periodStart)
}

/**
 * Format the date for the byline row (more readable than the period strip).
 * Weekly → "WEEK OF MAY 19". Daily → "MAY 19".
 */
function formatDateLabel(briefing: Briefing): string {
  if (briefing.frequency === 'weekly') {
    return `WEEK OF ${formatDayShort(briefing.periodStart)}`
  }
  return formatDayShort(briefing.periodStart)
}
