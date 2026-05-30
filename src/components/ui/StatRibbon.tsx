import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

export interface StatRibbonField {
  label: string
  value: ReactNode
  accent?: 'green' | 'cyan' | 'mod'
}

export interface TrailSegment {
  label: string
  /** Omit for the current page (leaf) — renders as non-link bright text. */
  href?: string
  /**
   * Optional accent for non-link segments (typically the leaf). Mirrors the
   * field accent vocabulary so a page can tint its leaf to match its body
   * accent — e.g. briefing detail tints the `D_2026-05-29.md` designator
   * cyan (weekly) or mod (daily) so it reads as a doc id, not chrome.
   */
  accent?: 'green' | 'cyan' | 'mod' | 'magenta'
}

export interface StatRibbonProps {
  /**
   * @deprecated Use `trail` instead. Kept temporarily while sibling pages
   * (content, clans, escalation, manifesto, …) migrate in phase 2.
   */
  prefix?: string
  trail?: TrailSegment[]
  fields: StatRibbonField[]
  pill: { text: string; ok: boolean; accent?: 'green' | 'mod' | 'magenta' }
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
      <StatusPill text={pill.text} ok={pill.ok} accent={pill.accent} />
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

/**
 * Color recipe for a non-link trail segment (leaf or static ancestor). Shares
 * the field accent vocabulary so a page's leaf tint can match its body accent.
 */
function trailAccentClass(accent: TrailSegment['accent']): string {
  switch (accent) {
    case 'green':
      return 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
    case 'cyan':
      return 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.5)]'
    case 'mod':
      return 'text-rga-mod [text-shadow:0_0_10px_rgba(255,128,0,0.5)]'
    case 'magenta':
      return 'text-rga-magenta [text-shadow:0_0_10px_rgba(255,0,255,0.5)]'
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
        : field.accent === 'mod'
          ? 'text-rga-mod [text-shadow:0_0_10px_rgba(255,128,0,0.5)]'
          : 'text-text-primary'

  return (
    <span className="inline-flex items-baseline gap-2">
      {field.label && <span className="text-text-muted">{field.label}</span>}
      <span className={`tabular-nums ${colorClass}`}>{field.value}</span>
    </span>
  )
}

function StatusPill({
  text,
  ok,
  accent = 'green',
}: {
  text: string
  ok: boolean
  accent?: 'green' | 'mod' | 'magenta'
}) {
  // Failure always renders magenta — distinguishes "we have no signal" from
  // the section's idle accent. Success uses the section's chosen accent.
  const okMap = {
    green: { text: 'text-rga-green', dot: 'bg-rga-green shadow-[0_0_8px_#00FF41] animate-pulse' },
    mod: { text: 'text-rga-mod', dot: 'bg-rga-mod shadow-[0_0_8px_#FF8000] animate-pulse' },
    magenta: { text: 'text-rga-magenta', dot: 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]' },
  } as const
  const failStyle = okMap.magenta
  const style = ok ? okMap[accent] : failStyle
  return (
    <span className={`inline-flex items-center gap-2 ${style.text}`}>
      <span aria-hidden className={`inline-block h-2 w-2 rounded-[1px] ${style.dot}`} />
      {text}
    </span>
  )
}
