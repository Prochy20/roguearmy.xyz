import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ACCENT_TOKENS, type AccentName } from './accent'

/**
 * One neighbor link slot. Both `prev` and `next` accept this same shape;
 * pass `null` to render an inert "OLDER" / "NEWER" placeholder.
 *
 * - `href`: target URL.
 * - `label`: leading uppercase token (e.g. "WEEKLY", "ARTICLE", "DAILY").
 * - `sublabel`: trailing text shown after a "·" separator (e.g. a date).
 */
export interface ReaderFooterNeighbor {
  href: string
  label: string
  sublabel: string
}

interface ReaderDetailFooterProps {
  accent: AccentName
  /** Left-side back link target. */
  backHref: string
  /** Uppercase label after "BACK TO" — e.g. "WEEK" or "BUILDS". */
  backLabel: string
  /** Trailing value after the back label's `::` separator (e.g. a date or topic name). */
  backValue: string
  /** Chronologically older neighbor. Null renders an inert placeholder. */
  prev: ReaderFooterNeighbor | null
  /** Chronologically newer neighbor. Null renders an inert placeholder. */
  next: ReaderFooterNeighbor | null
}

/**
 * Foot of the reader detail page — back link + chronological prev/next pair.
 * Each neighbor button is its own mini frame card so the trio reads as a
 * navigation deck rather than three loose links.
 *
 * Hover state snaps to the page's accent channel, matching the rest of the
 * surface.
 */
export function ReaderDetailFooter({
  accent,
  backHref,
  backLabel,
  backValue,
  prev,
  next,
}: ReaderDetailFooterProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <div className="flex flex-col gap-6 border-t border-text-muted/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={backHref}
        prefetch={false}
        className={`group/back inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted transition-colors ${a.textHover}`}
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-0.5" strokeWidth={1.5} />
        <span>BACK TO {backLabel}</span>
        <span aria-hidden className={`${a.textSoft}`}>
          ::
        </span>
        <span className="text-text-secondary tabular-nums">{backValue}</span>
      </Link>

      <div className="flex items-center gap-3">
        <NeighborLink neighbor={prev} direction="prev" accent={accent} />
        <NeighborLink neighbor={next} direction="next" accent={accent} />
      </div>
    </div>
  )
}

function NeighborLink({
  neighbor,
  direction,
  accent,
}: {
  neighbor: ReaderFooterNeighbor | null
  direction: 'prev' | 'next'
  accent: AccentName
}) {
  const a = ACCENT_TOKENS[accent]
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const sr = direction === 'prev' ? 'Older' : 'Newer'

  if (!neighbor) {
    return (
      <span
        aria-hidden
        className="inline-flex h-10 items-center gap-2 border border-text-muted/10 bg-void/40 px-3 font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted/35"
      >
        {direction === 'prev' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
        {direction === 'prev' ? 'OLDER' : 'NEWER'}
        {direction === 'next' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      </span>
    )
  }

  const label = `${neighbor.label} · ${neighbor.sublabel}`

  return (
    <Link
      href={neighbor.href}
      prefetch={false}
      aria-label={`${sr} · ${label}`}
      className={`inline-flex h-10 items-center gap-2 border border-text-muted/25 bg-void/40 px-3 font-mono text-[9px] uppercase tracking-[0.3em] text-text-secondary transition-colors ${a.textHover}`}
    >
      {direction === 'prev' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      <span>{label}</span>
      {direction === 'next' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
    </Link>
  )
}
