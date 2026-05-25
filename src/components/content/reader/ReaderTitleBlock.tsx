import { type ReactNode } from 'react'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface ReaderTitleBlockProps {
  accent: AccentName
  title: string
  perex: string
  /** Pre-formatted date label, e.g. "WEEK OF MAY 19" or "MAY 19". */
  dateLabel: string
  /** Computed read-time in minutes — already clamped to >= 1 upstream. */
  readMinutes: number
  /** Right-side action bar — bookmark/share for articles, copy/print for digests. */
  actions: ReactNode
}

/**
 * Headline + dek + byline / actions row.
 *
 * Typography: display font for the title at a fluid scale (clamp 28-56px),
 * uppercase, leading-[0.9] for tight stacking, accent-tinted text-shadow glow.
 * Title is wrapped in `HeroGlitch` to give it a periodic CRT-flicker + RGB-split
 * treatment — the document reads as a tactical packet "tuning in" every few
 * seconds. Glitch colors are paired to the page accent.
 *
 * Dek in body font, comfortable line-height. Byline reduced to date +
 * read-time only — no author. Authorship is whatever the caller renders into
 * `actions` (or omits).
 */
export function ReaderTitleBlock({
  accent,
  title,
  perex,
  dateLabel,
  readMinutes,
  actions,
}: ReaderTitleBlockProps) {
  const a = ACCENT_TOKENS[accent]
  const glitchColors = GLITCH_COLOR_PAIRS[accent]

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <h1
        className="break-words font-display uppercase leading-[0.9] text-text-primary"
        style={{
          fontSize: 'clamp(34px, 5.4vw, 64px)',
          textShadow: a.textGlow,
        }}
      >
        <HeroGlitch
          className="block"
          minInterval={6}
          maxInterval={14}
          intensity={6}
          dataCorruption={false}
          scanlines={false}
          colors={glitchColors}
        >
          <span>{title}</span>
        </HeroGlitch>
      </h1>

      {perex && (
        <p className="text-base leading-relaxed text-text-secondary sm:text-[17px] sm:leading-[1.7]">
          {perex}
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-text-muted/10 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          <span aria-hidden className={`inline-block h-1 w-1 ${a.bg}`} />
          <span className="text-text-secondary">{dateLabel}</span>
          <span aria-hidden className="text-text-muted/40">::</span>
          <span className="text-text-secondary tabular-nums">
            ~{readMinutes} MIN READ
          </span>
        </div>
        <div className="flex">{actions}</div>
      </div>
    </div>
  )
}

/**
 * RGB-split color pairs for the title HeroGlitch effect. Each accent picks
 * two near-complementary tones that read as "terminal interference" for that
 * channel. Tied to the accent so the glitch never reads as a different page.
 */
const GLITCH_COLOR_PAIRS: Record<AccentName, [string, string]> = {
  green: ['#00ff41', '#00ffff'],
  cyan: ['#00ffff', '#ff00ff'],
  magenta: ['#ff00ff', '#00ffff'],
  orange: ['#ff8000', '#ffae42'],
  red: ['#ff3344', '#ff8888'],
}
