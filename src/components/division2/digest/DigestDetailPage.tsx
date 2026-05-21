import { StatRibbon } from '@/components/ui/StatRibbon'
import { DigestPageShell } from './DigestPageShell'
import { DigestBreadcrumb } from './DigestBreadcrumb'
import { DigestHeroFrame } from './DigestHeroFrame'
import { DigestTitleBlock } from './DigestTitleBlock'
import { DigestActions } from './DigestActions'
import { DigestDocStrip } from './DigestDocStrip'
import { DigestTldrCard } from './DigestTldrCard'
import { DigestToc } from './DigestToc'
import { DigestReadingWidget } from './DigestReadingWidget'
import { DigestShortcuts } from './DigestShortcuts'
import { DigestBriefing } from './DigestBriefing'
import { DigestSources } from './DigestSources'
import { DigestCard } from './DigestCard'
import { DigestDetailFooter } from './DigestDetailFooter'
import { frequencyAccent } from './accent'
import { formatDayShort } from '@/lib/division2/format'
import type {
  Digest,
  DigestDetail,
  DigestSection,
} from '@/lib/division2/digest.server'

interface DigestDetailPageProps {
  digest: DigestDetail
  /** Markdown body — citation markers AND H2 anchors already injected. */
  transformedContent: string
  /** Pre-enumerated H2 sections; drives both the body and the ToC. */
  sections: DigestSection[]
  /** Short doc designator like `WK17_2026` or `D_2026-04-21`. */
  designator: string
  /** Word count of the body — drives doc-strip and reading widget. */
  wordCount: number
  /** Read time in minutes, clamped to >= 1. */
  readMinutes: number
  /** True when the digest is booster-gated (daily) — drives the PUBLIC/MEMBERS tag. */
  isMembersOnly: boolean
  /** Week the digest belongs to — drives the back-to-week footer link. */
  weekPeriodStart: string
  prev: Digest | null
  next: Digest | null
  /** Up to 3 other digests to surface as cards below the sources table. */
  related: Digest[]
}

/**
 * Reader for a single Ashley digest. Three-column on desktop, single-column
 * on mobile/tablet. All chrome is frequency-tinted: cyan for weekly intel,
 * mod-orange for daily ops.
 *
 * Composition order (top to bottom of the eye's path):
 *   breadcrumb · tag row · title + dek + byline/actions · hero frame
 *      ↓
 *   [ToC]   doc-strip · TL;DR · prose body · sources   [reading widget]
 *      ↓
 *   footer (back-to-week + prev/next)
 */
export function DigestDetailPage({
  digest,
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
}: DigestDetailPageProps) {
  const accent = frequencyAccent(digest.frequency)
  const periodLabel = formatPeriodLabel(digest)
  const dateLabel = formatDateLabel(digest)

  // Field accent for the StatRibbon — restricted to green/cyan/mod by the
  // shared component. Maps the frequency-driven page accent into the matching
  // ribbon-field token.
  const ribbonFieldAccent: 'cyan' | 'mod' = accent === 'cyan' ? 'cyan' : 'mod'
  const updatedShort = digest.updatedAt.slice(0, 10)

  const header = (
    <>
      <StatRibbon
        prefix={`// DIVISION 2 · BRIEFING · ${digest.frequency.toUpperCase()}`}
        fields={[
          { label: 'PERIOD', value: periodLabel, accent: ribbonFieldAccent },
          {
            label: 'SOURCES',
            value: digest.articleCount.toString(),
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
      <DigestBreadcrumb accent={accent} designator={designator} />
      <DigestTitleBlock
        accent={accent}
        title={digest.title}
        perex={digest.perex}
        dateLabel={dateLabel}
        readMinutes={readMinutes}
        actions={<DigestActions accent={accent} />}
      />
      {digest.thumbnailUrl && (
        <DigestHeroFrame
          accent={accent}
          thumbnailUrl={digest.thumbnailUrl}
          frequency={digest.frequency}
          periodLabel={periodLabel}
        />
      )}
    </>
  )

  const body = (
    <div className="flex flex-col gap-8 sm:gap-10">
      <DigestDocStrip
        accent={accent}
        designator={designator}
        frequency={digest.frequency}
        wordCount={wordCount}
        updatedAt={digest.updatedAt}
      />
      <DigestTldrCard accent={accent} highlights={digest.highlights} />
      <article className="digest-body min-w-0">
        <DigestBriefing content={transformedContent} accent={accent} />
      </article>
      <DigestSources accent={accent} articles={digest.articles} />
      {related.length > 0 && (
        <RelatedDigests accent={accent} digests={related} />
      )}
    </div>
  )

  return (
    <DigestPageShell
      accent={accent}
      header={header}
      toc={
        sections.length > 0 ? (
          <DigestToc accent={accent} sections={sections} />
        ) : null
      }
      body={body}
      reading={
        <div className="flex flex-col gap-5">
          <DigestReadingWidget accent={accent} wordCount={wordCount} />
          <DigestShortcuts accent={accent} />
        </div>
      }
      footer={
        <DigestDetailFooter
          accent={accent}
          weekPeriodStart={weekPeriodStart}
          prev={prev}
          next={next}
        />
      }
    />
  )
}

/**
 * Format the period for the hero metadata strip (compact form).
 * Weekly → "MAY 19 → MAY 25". Daily → "MAY 19".
 */
function formatPeriodLabel(digest: DigestDetail): string {
  if (digest.frequency === 'weekly') {
    return `${formatDayShort(digest.periodStart)} → ${formatDayShort(digest.periodEnd)}`
  }
  return formatDayShort(digest.periodStart)
}

/**
 * Format the date for the byline row (more readable than the period strip).
 * Weekly → "WEEK OF MAY 19". Daily → "MAY 19".
 */
function formatDateLabel(digest: DigestDetail): string {
  if (digest.frequency === 'weekly') {
    return `WEEK OF ${formatDayShort(digest.periodStart)}`
  }
  return formatDayShort(digest.periodStart)
}

/**
 * "Continue reading" deck — up to 3 related digest cards in a responsive
 * grid. Reuses `DigestCard` so the cards match the index/landing surfaces.
 * Single column on mobile, 2-up on `sm`, 3-up on `lg`.
 */
function RelatedDigests({
  accent,
  digests,
}: {
  accent: ReturnType<typeof frequencyAccent>
  digests: Digest[]
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
            x{String(digests.length).padStart(2, '0')} BRIEFINGS
          </span>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {digests.map((digest) => (
          <DigestCard key={digest.id} digest={digest} />
        ))}
      </div>
    </section>
  )
}
