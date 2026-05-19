import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ACCENT_TOKENS, type AccentName } from './accent'
import type { Digest } from '@/lib/division2/digest.server'
import { formatDayShort } from '@/lib/division2/format'

interface DigestDetailFooterProps {
  accent: AccentName
  /** The week's periodStart for back-to-week navigation. */
  weekPeriodStart: string
  /** Chronologically older neighbor across all frequencies. */
  prev: Digest | null
  /** Chronologically newer neighbor across all frequencies. */
  next: Digest | null
}

/**
 * Foot of the digest detail page — back-to-week link + chronological
 * prev/next neighbor pair. Each neighbor button is its own mini frame card
 * so the trio reads as a navigation deck rather than three loose links.
 *
 * Hover state snaps to the page's accent channel, matching the rest of the
 * surface — cyan for weekly, mod-orange for daily.
 */
export function DigestDetailFooter({
  accent,
  weekPeriodStart,
  prev,
  next,
}: DigestDetailFooterProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <div className="flex flex-col gap-6 border-t border-text-muted/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`/division-2/digest?week=${weekPeriodStart}`}
        prefetch={false}
        className={`group/back inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted transition-colors ${a.textHover}`}
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-0.5" strokeWidth={1.5} />
        <span>BACK TO WEEK</span>
        <span aria-hidden className={`${a.textSoft}`}>
          ::
        </span>
        <span className="text-text-secondary tabular-nums">
          {formatDayShort(weekPeriodStart)}
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <NeighborLink digest={prev} direction="prev" accent={accent} />
        <NeighborLink digest={next} direction="next" accent={accent} />
      </div>
    </div>
  )
}

function NeighborLink({
  digest,
  direction,
  accent,
}: {
  digest: Digest | null
  direction: 'prev' | 'next'
  accent: AccentName
}) {
  const a = ACCENT_TOKENS[accent]
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const sr = direction === 'prev' ? 'Older' : 'Newer'

  if (!digest) {
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

  const label = `${digest.frequency.toUpperCase()} · ${formatDayShort(digest.periodStart)}`

  return (
    <Link
      href={`/division-2/digest/${digest.id}`}
      prefetch={false}
      aria-label={`${sr} digest · ${label}`}
      className={`inline-flex h-10 items-center gap-2 border border-text-muted/25 bg-void/40 px-3 font-mono text-[9px] uppercase tracking-[0.3em] text-text-secondary transition-colors ${a.textHover}`}
      style={{
        // The border hover color isn't easily expressed in Tailwind dynamic
        // arbitrary; nudge it via CSS variable on the element instead. The
        // `accent-border-hover` class below could be moved into globals if
        // this pattern recurs.
      }}
    >
      {direction === 'prev' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      <span>{label}</span>
      {direction === 'next' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
    </Link>
  )
}
