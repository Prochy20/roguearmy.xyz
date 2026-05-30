import { StatRibbon } from '@/components/ui/StatRibbon'
import { D2_ROOT, BRIEFINGS_ROOT } from '@/components/ui/trail-roots'
import { ReaderPageShell } from '@/components/content/reader/ReaderPageShell'
import { ReaderHeroFrame } from '@/components/content/reader/ReaderHeroFrame'
import { ReaderTitleBlock } from '@/components/content/reader/ReaderTitleBlock'
import { ReaderActions } from '@/components/content/reader/ReaderActions'
import { ReaderDocStrip } from '@/components/content/reader/ReaderDocStrip'
import { ReaderTldrCard } from '@/components/content/reader/ReaderTldrCard'
import { ReaderToc } from '@/components/content/reader/ReaderToc'
import { ReaderReadingWidget } from '@/components/content/reader/ReaderReadingWidget'
import { ReaderShortcuts } from '@/components/content/reader/ReaderShortcuts'
import { ReaderBody } from '@/components/content/reader/ReaderBody'
import {
  ReaderDetailFooter,
  type ReaderFooterNeighbor,
} from '@/components/content/reader/ReaderDetailFooter'
import type { AccentName } from '@/components/content/reader/accent'
import { BriefingSources } from './BriefingSources'
import { BriefingCard } from './BriefingCard'
import { frequencyAccent } from './accent-briefing'
import { formatDayShort } from '@/lib/division2/format'
import type { ReaderSection } from '@/lib/content/markdown-sections'
import type {
  Briefing,
  BriefingDetail,
} from '@/lib/division2/briefing.server'
import type { BriefingProgress } from '@/lib/progress.server'

interface BriefingDetailPageProps {
  briefing: BriefingDetail
  /** Markdown body — citation markers AND H2 anchors already injected. */
  transformedContent: string
  /** Pre-enumerated H2 sections; drives both the body and the ToC. */
  sections: ReaderSection[]
  /** Short doc designator like `WK17_2026` or `D_2026-04-21`. */
  designator: string
  /** Word count of the body — drives doc-strip and reading widget. */
  wordCount: number
  /** Read time in minutes, clamped to >= 1. */
  readMinutes: number
  /** True when the briefing is booster-gated (daily) — drives the PUBLIC/MEMBERS tag. */
  isMembersOnly: boolean
  /** Week the briefing belongs to — drives the back-to-week footer link. */
  weekPeriodStart: string
  prev: Briefing | null
  next: Briefing | null
  /** Up to 3 other briefings to surface as cards below the sources table. */
  related: Briefing[]
  /**
   * Briefing-id → progress map covering only the `related` cards. `null`
   * for anonymous viewers. Plain object so it crosses the prop boundary.
   */
  briefingProgress: Record<string, BriefingProgress> | null
}

/**
 * Reader for a single Ashley briefing. Composes the shared reader kit at
 * `components/content/reader/*` with briefing-specific slot content (Ashley
 * actions, sources/citations, related briefing cards, frequency-driven accent).
 *
 * Composition order (top to bottom of the eye's path):
 *   breadcrumb · tag row · title + dek + byline/actions · hero frame
 *      ↓
 *   [ToC]   doc-strip · TL;DR · prose body · sources   [reading widget]
 *      ↓
 *   footer (back-to-week + prev/next)
 */
export function BriefingDetailPage({
  briefing,
  transformedContent,
  sections,
  designator,
  wordCount,
  readMinutes,
  isMembersOnly,
  weekPeriodStart,
  prev,
  next,
  related,
  briefingProgress,
}: BriefingDetailPageProps) {
  const accent = frequencyAccent(briefing.frequency)
  const periodLabel = formatPeriodLabel(briefing)
  const dateLabel = formatDateLabel(briefing)

  // StatRibbon's local accent vocabulary is { green, cyan, mod, magenta } —
  // map the reader-accent (cyan|orange) onto its closest sibling for the
  // ribbon's numeric fields.
  const ribbonFieldAccent: 'cyan' | 'mod' = accent === 'cyan' ? 'cyan' : 'mod'
  const updatedShort = briefing.updatedAt.slice(0, 10)

  const stickyChrome = (
    <StatRibbon
      trail={[
        D2_ROOT,
        BRIEFINGS_ROOT,
        { label: `${designator}.md`, accent: ribbonFieldAccent },
      ]}
      fields={[
        {
          label: 'FREQ',
          value: briefing.frequency.toUpperCase(),
          accent: ribbonFieldAccent,
        },
        { label: 'PERIOD', value: periodLabel, accent: ribbonFieldAccent },
        {
          label: 'SOURCES',
          value: briefing.articleCount.toString(),
          accent: ribbonFieldAccent,
        },
        {
          label: 'UPDATED',
          value: /^\d{4}-\d{2}-\d{2}$/.test(updatedShort)
            ? formatDayShort(updatedShort)
            : '—',
          accent: 'green',
        },
      ]}
      pill={
        isMembersOnly
          ? { text: 'MEMBERS', ok: true, accent: 'magenta' }
          : { text: 'PUBLIC', ok: true, accent: 'green' }
      }
    />
  )

  const header = (
    <>
      <ReaderTitleBlock
        accent={accent}
        title={briefing.title}
        perex={briefing.perex}
        dateLabel={dateLabel}
        readMinutes={readMinutes}
        actions={<ReaderActions accent={accent} />}
      />
      <ReaderHeroFrame
        accent={accent}
        thumbnailUrl={briefing.thumbnailUrl}
        kindLabel={briefing.frequency.toUpperCase()}
        periodLabel={periodLabel}
        bylineLabel="// AI · ASHLEY"
        fileNumber={buildImageFileNumber(briefing.id)}
      />
    </>
  )

  const body = (
    <div className="briefing-locked-body flex flex-col gap-8 sm:gap-10">
      <ReaderDocStrip
        accent={accent}
        fields={[
          { label: 'DOC', value: designator, tone: 'accent' },
          { label: 'CLASS', value: briefing.frequency.toUpperCase(), tone: 'muted' },
          {
            label: 'WORDS',
            value: wordCount.toLocaleString('en-US'),
            tone: 'secondary',
          },
          {
            label: 'UPDATED',
            value: /^\d{4}-\d{2}-\d{2}$/.test(updatedShort)
              ? formatDayShort(updatedShort)
              : briefing.updatedAt,
            tone: 'secondary',
          },
        ]}
      />
      <ReaderTldrCard accent={accent} highlights={briefing.highlights} />
      <article className="briefing-body min-w-0">
        <ReaderBody
          accent={accent}
          source={{ type: 'markdown', content: transformedContent }}
        />
      </article>
      <BriefingSources accent={accent} articles={briefing.articles} />
      {related.length > 0 && (
        <RelatedBriefings
          accent={accent}
          briefings={related}
          briefingProgress={briefingProgress}
        />
      )}
    </div>
  )

  return (
    <ReaderPageShell
      accent={accent}
      stickyChrome={stickyChrome}
      header={header}
      toc={
        sections.length > 0 ? (
          <ReaderToc accent={accent} sections={sections} />
        ) : null
      }
      body={body}
      reading={
        <div className="flex flex-col gap-5">
          <ReaderReadingWidget accent={accent} wordCount={wordCount} />
          <ReaderShortcuts accent={accent} />
        </div>
      }
      footer={
        <ReaderDetailFooter
          accent={accent}
          backHref={`/division-2/briefings?week=${weekPeriodStart}`}
          backLabel="WEEK"
          backValue={formatDayShort(weekPeriodStart)}
          prev={briefingToNeighbor(prev)}
          next={briefingToNeighbor(next)}
        />
      }
    />
  )
}

/**
 * Build the NoSignalPanel filename stamp from a briefing id.
 * Mirrors the card's BRF_xxxx scheme but uses the IMG_ prefix so the
 * placeholder filename reads as image-feed metadata, not document metadata.
 */
function buildImageFileNumber(briefingId: string): string {
  const tail = briefingId.replace(/-/g, '').slice(-4).toUpperCase()
  return `IMG_${tail}`
}

/**
 * Adapt a Briefing to the reader footer's generic neighbor shape.
 * Label = frequency uppercased ("WEEKLY" / "DAILY"), sublabel = period date.
 */
function briefingToNeighbor(briefing: Briefing | null): ReaderFooterNeighbor | null {
  if (!briefing) return null
  return {
    href: briefing.canonicalPath,
    label: briefing.frequency.toUpperCase(),
    sublabel: formatDayShort(briefing.periodStart),
  }
}

/**
 * Format the period for the hero metadata strip (compact form).
 * Weekly → "MAY 19 → MAY 25". Daily → "MAY 19".
 */
function formatPeriodLabel(briefing: BriefingDetail): string {
  if (briefing.frequency === 'weekly') {
    return `${formatDayShort(briefing.periodStart)} → ${formatDayShort(briefing.periodEnd)}`
  }
  return formatDayShort(briefing.periodStart)
}

/**
 * Format the date for the byline row (more readable than the period strip).
 * Weekly → "WEEK OF MAY 19". Daily → "MAY 19".
 */
function formatDateLabel(briefing: BriefingDetail): string {
  if (briefing.frequency === 'weekly') {
    return `WEEK OF ${formatDayShort(briefing.periodStart)}`
  }
  return formatDayShort(briefing.periodStart)
}

/**
 * "Continue reading" deck — up to 3 related briefing cards in a responsive
 * grid. Reuses `BriefingCard` so the cards match the index/landing surfaces.
 * Single column on mobile, 2-up on `sm`, 3-up on `lg`.
 */
function RelatedBriefings({
  accent,
  briefings,
  briefingProgress,
}: {
  accent: AccentName
  briefings: Briefing[]
  briefingProgress: Record<string, BriefingProgress> | null
}) {
  return (
    <section className="mt-12 flex flex-col gap-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-text-muted/15 pb-3">
        <div className="flex flex-wrap items-baseline gap-3 font-mono">
          <span
            className={`text-[10px] tracking-[0.4em] ${
              accent === 'cyan' ? 'text-rga-cyan' : 'text-rga-mod'
            }`}
            style={{
              textShadow:
                accent === 'cyan'
                  ? '0 0 18px rgba(0,255,255,0.35)'
                  : '0 0 18px rgba(255,128,0,0.35)',
            }}
          >
            SEC_05
          </span>
          <span className="text-[10px] tracking-[0.3em] text-text-muted">
            // CONTINUE READING
          </span>
          <span className="text-[9px] tracking-[0.3em] text-text-muted/70 tabular-nums">
            x{String(briefings.length).padStart(2, '0')} BRIEFINGS
          </span>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {briefings.map((briefing) => (
          <BriefingCard
            key={briefing.id}
            briefing={briefing}
            progress={briefingProgress?.[briefing.id] ?? null}
          />
        ))}
      </div>
    </section>
  )
}
