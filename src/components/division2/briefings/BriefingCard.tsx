import Link from 'next/link'
import { Lock } from 'lucide-react'
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton'
import { BriefingThumbnail } from './BriefingThumbnail'
import { formatDayShort, weekdayShort } from '@/lib/division2/format'
import type { Briefing } from '@/lib/division2/briefing.server'
import type { BriefingProgress } from '@/lib/progress.server'

/** Minimal progress shape the card consumes. Derived from the canonical
 * server type via `Pick` so the two can't drift — `import type` keeps the
 * server-only module out of the client bundle. */
export type BriefingCardProgress = Pick<BriefingProgress, 'progress' | 'completed'>

interface BriefingCardProps {
  briefing: Briefing
  /**
   * `standard` is the default uniform tile. `lead` is the most-recent entry
   * — it spans two grid columns (set by the caller) and switches to a
   * horizontal image-left / text-right layout at `lg+` so the larger
   * footprint reads as a featured headline instead of a stretched square.
   */
  tone?: 'standard' | 'lead'
  /**
   * Member's saved reading state for this briefing. `null` or `undefined`
   * (anonymous viewer / never visited) renders no progress affordance —
   * card looks identical to its zero-progress state.
   */
  progress?: BriefingCardProgress | null
  // Renders a lock overlay + LOST BOOSTER ACCESS caption. Used on
  // /me/bookmarks for daily briefings the member can no longer view.
  locked?: boolean
}

const STRIPE_BG =
  'repeating-linear-gradient(-45deg, transparent 0 12px, rgba(255,255,255,0.018) 12px 13px)'

/**
 * Uniform editorial card for a briefing entry — weekly and daily share the
 * exact same shape. The frequency only changes the accent color (cyan for
 * weekly roll-ups, mod / orange for daily briefings) so the grid reads as a
 * date-sorted feed rather than a hierarchy of importance.
 *
 * Card anatomy:
 *   • aspect-16/9 preview banner with an accent gradient overlay
 *   • bracket pill (`[ WEEKLY ]` / `[ DAILY ]`) + date stamp
 *   • display headline (line-clamp-3)
 *   • perex paragraph (line-clamp-3)
 *   • agent telemetry footer with `▸ @ASHLEY · 7D AGO · N SRC · BRF_xxxx.md`
 *   • subtle diagonal-stripe ground + corner quote glyph
 */
export function BriefingCard({
  briefing,
  tone = 'standard',
  progress,
  locked = false,
}: BriefingCardProps) {
  const isWeekly = briefing.frequency === 'weekly'
  const isLead = tone === 'lead'
  const accent = accentClasses(isWeekly ? 'cyan' : 'mod')
  // Treat zero-progress records as "no progress" for display purposes — the
  // tracker writes a row on the first scroll event, but readers haven't
  // visually "started" the briefing if they bounced before scrolling.
  const hasProgress = Boolean(progress && (progress.progress > 0 || progress.completed))
  const fileNumber = buildFileNumber(briefing)
  const age = formatAge(briefing.periodStart)
  const dateStamp = isWeekly
    ? `WK ${isoWeekNumber(briefing.periodStart)} · ${formatDayShort(briefing.periodStart)} → ${formatDayShort(briefing.periodEnd)}`
    : `${weekdayShort(briefing.periodStart)} · ${formatDayShort(briefing.periodStart)}`

  // Lead tone is a borderless editorial hero — image left / text right at
  // lg+, stacking to vertical on mobile. No outer card border, no bg, no
  // diagonal-stripe ground; just the bordered image and the floating text
  // block. Standard tone is the uniform bordered grid tile.
  const wrapperLayout = isLead
    ? 'flex h-full flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-10 lg:items-stretch'
    : 'flex h-full flex-col border bg-[rgba(8,8,8,0.95)]'

  const previewLayout = isLead
    ? `relative aspect-16/9 w-full overflow-hidden border lg:aspect-auto lg:w-1/2 lg:shrink-0 lg:self-stretch ${accent.cardBorder}`
    : `relative aspect-16/9 w-full overflow-hidden border-b ${accent.cardBorder}`

  const bodyLayout = isLead
    ? 'relative flex flex-1 flex-col gap-4 p-6 sm:p-8 lg:gap-5 lg:p-10'
    : 'relative flex flex-1 flex-col gap-3 p-5 sm:p-6'

  const headlineSize = isLead
    ? 'text-2xl sm:text-3xl lg:text-[40px] xl:text-[48px]'
    : 'text-xl sm:text-[22px]'

  const wrapperClassName = `group relative block h-full transition-colors ${wrapperLayout} ${
    isLead ? '' : `border ${accent.cardBorder} ${accent.cardBorderHover}`
  }`
  const wrapperStyle = isLead ? undefined : { backgroundImage: STRIPE_BG }
  const wrapperContent = (
    <>
      {isLead && <CornerTicks accent={isWeekly ? 'cyan' : 'mod'} />}
      <QuoteOrnament lead={isLead} />

      <div className={previewLayout}>
        <BriefingThumbnail
          src={briefing.thumbnailUrl}
          accent={isWeekly ? 'cyan' : 'mod'}
          fileNumber={fileNumber.replace(/^BRF_/, 'IMG_')}
        />
        {/* z-20 keeps the toggle reachable above the locked overlay so a
            member who lost booster can still remove the bookmark. */}
        <div className="absolute top-3 right-3 z-20">
          <BookmarkButton targetType="briefing" targetId={briefing.id} size="sm" />
        </div>
        {locked && (
          <div
            aria-label="Lost booster access"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(8,8,8,0.78)] backdrop-blur-[1px]"
          >
            <Lock className="h-7 w-7 text-text-secondary/80" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary">
              Lost booster access
            </span>
          </div>
        )}
      </div>

      <div className={bodyLayout}>
        <div className="flex flex-wrap items-center gap-2.5">
          <BracketPill
            label={briefing.frequency.toUpperCase()}
            accent={isWeekly ? 'cyan' : 'mod'}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-secondary">
            {isWeekly ? 'ROLL-UP' : 'BRIEFING'}
          </span>
          {isLead && (
            <span className="ml-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted">
              <span aria-hidden className={accent.cursorText}>◊</span>
              <span>LATEST</span>
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          {dateStamp}
        </span>

        <h3
          className={`break-words font-display uppercase leading-[1.05] text-text-primary line-clamp-3 transition-colors ${headlineSize} ${accent.headlineHover}`}
        >
          {briefing.title}
        </h3>

        {briefing.perex && (
          <p
            className={`text-[13.5px] leading-snug text-text-secondary/90 sm:text-sm ${
              isLead
                ? 'lg:text-[15px] line-clamp-4 lg:line-clamp-5'
                : 'line-clamp-3'
            }`}
          >
            {briefing.perex}
          </p>
        )}

        {/* Tactical CTA — lead only. The whole card is a Link; this span
            is a visual affordance that lights up with the parent hover. */}
        {isLead && (
          <span
            aria-hidden
            className={`mt-2 inline-flex w-fit items-center gap-3 border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.32em] transition-all duration-300 ${accent.ctaBorder} ${accent.ctaText} ${accent.ctaHoverFill} group-hover:gap-4`}
          >
            OPEN {isWeekly ? 'ROLL-UP' : 'BRIEFING'}
            <span className="font-display text-base">→</span>
          </span>
        )}

        <div className="mt-auto flex flex-col gap-2.5 pt-3">
          <span aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.06)]" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
            <span aria-hidden className={accent.cursorText}>{'▸'}</span>
            <span>{age}</span>
            <span aria-hidden className="text-text-muted/40">·</span>
            <span>{briefing.articleCount} SRC</span>
            <span aria-hidden className="text-text-muted/40">·</span>
            {/* Tail slot: BRF doc-id by default, READ chip swaps in when the
                member has progress on this briefing. Keeps the row at a
                constant 4 items — never wraps in the 4-col grid. BRF is
                pure flavor (no link, no action) so swapping it for state
                trades nothing the reader can use. */}
            {hasProgress && progress ? (
              <span>
                READ{' '}
                {progress.completed ? (
                  <span className="text-rga-green" aria-label="Read">
                    ✓
                  </span>
                ) : (
                  <span className={accent.openText}>
                    {Math.round(progress.progress)}%
                  </span>
                )}
              </span>
            ) : (
              <span>
                <span className="text-game-d2">{fileNumber}</span>
                <span className="text-text-muted/60">.md</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )

  if (locked) {
    return (
      <div
        aria-label="Locked — booster access required"
        className={wrapperClassName}
        style={wrapperStyle}
      >
        {wrapperContent}
      </div>
    )
  }

  return (
    <Link
      href={briefing.canonicalPath}
      prefetch={false}
      className={wrapperClassName}
      style={wrapperStyle}
    >
      {wrapperContent}
    </Link>
  )
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────

/**
 * Inline L-shaped corner brackets anchored to the card's own edges. Unlike
 * `CyberCorners`, this primitive sits *inside* the card with no padding
 * wrapper, so the ticks read as part of the card frame rather than floating
 * outside it. Each tick slides slightly outward on group hover.
 */
function CornerTicks({ accent }: { accent: 'cyan' | 'mod' }) {
  const colorClass = accent === 'cyan' ? 'border-rga-cyan' : 'border-game-d2'
  // Bigger L-brackets for the lead — 24px wide arms with 2px stroke so they
  // read unambiguously as targeting corners even at a glance. Positioned
  // 10px outside each edge so they float in the section's gutter.
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute z-10 -top-2.5 -left-2.5 h-6 w-6 border-t-2 border-l-2 ${colorClass} transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute z-10 -top-2.5 -right-2.5 h-6 w-6 border-t-2 border-r-2 ${colorClass} transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute z-10 -bottom-2.5 -left-2.5 h-6 w-6 border-b-2 border-l-2 ${colorClass} transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute z-10 -bottom-2.5 -right-2.5 h-6 w-6 border-b-2 border-r-2 ${colorClass} transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1`}
      />
    </>
  )
}

function BracketPill({ label, accent }: { label: string; accent: 'cyan' | 'mod' }) {
  const a = accentClasses(accent)
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.32em] transition-colors ${a.pillBorder} ${a.pillText} ${a.pillHoverFill}`}
    >
      {label}
    </span>
  )
}

function QuoteOrnament({ lead = false }: { lead?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 font-display leading-none text-text-muted/15 ${
        lead
          ? 'top-2 right-4 text-4xl sm:top-3 sm:right-5 sm:text-5xl lg:top-4 lg:right-6 lg:text-6xl'
          : 'top-2 right-4 text-4xl sm:top-3 sm:right-5 sm:text-5xl'
      }`}
    >
      ”
    </span>
  )
}

function accentClasses(accent: 'cyan' | 'mod') {
  if (accent === 'cyan') {
    return {
      cardBorder: 'border-rga-cyan/20',
      cardBorderHover: 'hover:border-rga-cyan/55',
      cursorText: 'text-rga-cyan',
      openText: 'text-rga-cyan',
      headlineHover: 'group-hover:text-rga-cyan',
      pillBorder: 'border-rga-cyan/55',
      pillText: 'text-rga-cyan',
      pillHoverFill: 'group-hover:bg-rga-cyan/15',
      ctaBorder: 'border-rga-cyan/55',
      ctaText: 'text-rga-cyan',
      ctaHoverFill: 'group-hover:bg-rga-cyan/15 group-hover:border-rga-cyan',
    } as const
  }
  return {
    cardBorder: 'border-game-d2/20',
    cardBorderHover: 'hover:border-game-d2/55',
    cursorText: 'text-game-d2',
    openText: 'text-game-d2',
    headlineHover: 'group-hover:text-game-d2',
    pillBorder: 'border-game-d2/55',
    pillText: 'text-game-d2',
    pillHoverFill: 'group-hover:bg-game-d2/15',
    ctaBorder: 'border-game-d2/55',
    ctaText: 'text-game-d2',
    ctaHoverFill: 'group-hover:bg-game-d2/15 group-hover:border-game-d2',
  } as const
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function buildFileNumber(briefing: Briefing): string {
  const tail = briefing.id.replace(/-/g, '').slice(-4).toUpperCase()
  return `BRF_${tail}`
}

function formatAge(iso: string): string {
  const then = new Date(`${iso}T00:00:00Z`).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'JUST IN'
  if (diffDays === 1) return '1D AGO'
  if (diffDays < 30) return `${diffDays}D AGO`
  const months = Math.round(diffDays / 30)
  if (months < 12) return `${months}M AGO`
  const years = Math.round(diffDays / 365)
  return `${years}Y AGO`
}

function isoWeekNumber(iso: string): number {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return 0
  const target = new Date(date.valueOf())
  const dayNr = (date.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = target.valueOf() - firstThursday.valueOf()
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000))
}
