import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

export interface StatRibbonField {
  label: string
  value: ReactNode
  /**
   * Fields are neutral white by default — reserve an accent for values that
   * are themselves a status or a categorical marker (cyan for analytics /
   * Ashley-output content, green for OK state). Game brand colors (orange)
   * never appear in chrome.
   */
  accent?: 'green' | 'cyan'
}

export interface TrailSegment {
  label: string
  /** Omit for the current page (leaf) — renders as non-link bright text. */
  href?: string
  /**
   * Optional accent for non-link segments (typically the leaf). Vocabulary
   * matches `StatRibbonField` — chrome stays RGA-neutral, so no game brand
   * tokens. Cyan is the natural pick for Ashley-output identifiers (weekly
   * briefing `.md` designators); green for active/OK markers.
   */
  accent?: 'green' | 'cyan'
}

export interface StatRibbonProps {
  /**
   * @deprecated Use `trail` instead. Kept exclusively for `ContentPage`,
   * which still drives a single-segment prefix; remove this prop once that
   * page migrates to a trail.
   */
  prefix?: string
  trail?: TrailSegment[]
  fields: StatRibbonField[]
  /**
   * Three modes — `info` is the muted default (TODAY, VIEWING, LIVE, PUBLIC),
   * `warn` is soft attention (STALE, MEMBERS-ONLY) in yellow, `error` is
   * hard failure (LOCKED, OFFLINE) in rose. See Foundations/Colors page.
   */
  pill: { text: string; mode: 'info' | 'warn' | 'error' }
}

export function StatRibbon({ prefix, trail, fields, pill }: StatRibbonProps) {
  const hasLeft = (trail && trail.length > 0) || !!prefix
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.78)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted backdrop-blur-2xl backdrop-saturate-150">
      {trail && trail.length > 0 ? (
        <TrailCluster trail={trail} />
      ) : prefix ? (
        <span className="text-text-secondary">{prefix}</span>
      ) : null}

      {hasLeft && fields.length > 0 && (
        <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
      )}

      {fields.map((field, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />}
          <RibbonField field={field} />
        </Fragment>
      ))}

      <span className="ml-auto" />
      <StatusPill text={pill.text} mode={pill.mode} />
    </div>
  )
}

/**
 * Breadcrumb trail rendered with `›` separators. On mobile (<sm) collapses
 * to the last two segments (parent + leaf) to free vertical real estate —
 * top-level brand context drops out, the actionable parent + "you are here"
 * stay.
 */
function TrailCluster({ trail }: { trail: TrailSegment[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Breadcrumb">
      <span className="text-text-secondary">//</span>
      {trail.map((segment, i) => {
        const isLeaf = i === trail.length - 1
        // Hide everything except the last two segments on mobile.
        const hideSegment = i < trail.length - 2
        // Separator at position i sits BEFORE segment[i] — hide it whenever
        // segment[i-1] is hidden (the thing it would visually attach to).
        const hideSeparator = i > 0 && i - 1 < trail.length - 2
        const hideOnMobile = 'hidden sm:inline'
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span
                aria-hidden
                className={`text-text-muted ${hideSeparator ? hideOnMobile : ''}`}
              >
                ›
              </span>
            )}
            <TrailSegmentNode
              segment={segment}
              isLeaf={isLeaf}
              hiddenOnMobile={hideSegment}
            />
          </Fragment>
        )
      })}
    </nav>
  )
}

function TrailSegmentNode({
  segment,
  isLeaf,
  hiddenOnMobile,
}: {
  segment: TrailSegment
  isLeaf: boolean
  hiddenOnMobile: boolean
}) {
  const mobileClass = hiddenOnMobile ? 'hidden sm:inline' : ''
  if (isLeaf || !segment.href) {
    return (
      <span
        aria-current={isLeaf ? 'page' : undefined}
        className={`${trailAccentClass(segment.accent)} ${mobileClass}`}
      >
        {segment.label}
      </span>
    )
  }
  return (
    <Link
      href={segment.href}
      className={`text-text-secondary transition-colors hover:text-text-primary hover:underline focus-visible:text-text-primary focus-visible:underline focus-visible:outline-none ${mobileClass}`}
    >
      {segment.label}
    </Link>
  )
}

function trailAccentClass(accent: TrailSegment['accent']): string {
  switch (accent) {
    case 'green':
      return 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
    case 'cyan':
      return 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.5)]'
    default:
      return 'text-text-primary'
  }
}

function RibbonField({ field }: { field: StatRibbonField }) {
  const colorClass =
    field.accent === 'green'
      ? 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
      : field.accent === 'cyan'
        ? 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.5)]'
        : 'text-text-primary'

  return (
    <span className="inline-flex items-baseline gap-2">
      {field.label && <span className="text-text-muted">{field.label}</span>}
      <span className={`tabular-nums ${colorClass}`}>{field.value}</span>
    </span>
  )
}

/**
 * Three-mode status pill. `info` is the silent default — muted gray, no
 * pulse, communicates "nothing to act on." `warn` is yellow + pulse for
 * soft attention (STALE, MEMBERS-ONLY). `error` is rose + pulse for hard
 * failure (LOCKED, OFFLINE). Magenta is no longer used for failure — it
 * lives in decorative chromatic effects only.
 */
function StatusPill({
  text,
  mode,
}: {
  text: string
  mode: 'info' | 'warn' | 'error'
}) {
  const modeMap = {
    info: {
      text: 'text-text-secondary',
      dot: 'bg-text-secondary',
    },
    warn: {
      text: 'text-rga-yellow [text-shadow:0_0_10px_rgba(255,225,0,0.5)]',
      dot: 'bg-rga-yellow shadow-[0_0_8px_#FFE100] animate-pulse',
    },
    error: {
      text: 'text-status-error [text-shadow:0_0_10px_rgba(255,0,102,0.5)]',
      dot: 'bg-status-error shadow-[0_0_8px_#FF0066] animate-pulse',
    },
  } as const
  const style = modeMap[mode]
  return (
    <span className={`inline-flex items-center gap-2 ${style.text}`}>
      <span aria-hidden className={`inline-block h-2 w-2 rounded-[1px] ${style.dot}`} />
      {text}
    </span>
  )
}
