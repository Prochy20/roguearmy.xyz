import { ACCENT_TOKENS, type AccentName } from './accent'

interface DigestTldrCardProps {
  accent: AccentName
  highlights: readonly string[]
}

/**
 * "Takeaways" card — Ashley's TL;DR for operators who won't read the body.
 *
 * Composition:
 *  - Label row: `// TL;DR · TAKEAWAYS` + a count chip (e.g. "x04 ITEMS").
 *  - 2-column grid on md+ (single column below). Each cell pairs a mono
 *    accent ordinal (01, 02, ...) with the highlight text — the ordinals
 *    sit in their own column with `align-self: start` so wrapping text
 *    doesn't push them around.
 *  - The card itself has corner ticks, a thin faint border, and a slight
 *    bg-void tint that distinguishes it from the prose body below.
 *
 * Returns null when highlights is empty so the page doesn't render an empty
 * shell.
 */
export function DigestTldrCard({ accent, highlights }: DigestTldrCardProps) {
  if (highlights.length === 0) return null
  const a = ACCENT_TOKENS[accent]

  return (
    <section
      aria-label="Key takeaways"
      className={`relative border ${a.borderFaint} bg-void/45 p-5 backdrop-blur-sm sm:p-7`}
    >
      {/* Corner ticks */}
      <CornerTick position="tl" accent={accent} />
      <CornerTick position="tr" accent={accent} />
      <CornerTick position="bl" accent={accent} />
      <CornerTick position="br" accent={accent} />

      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.35em] ${a.textSoft}`}
          style={{ textShadow: a.textGlow }}
        >
          // TL;DR · TAKEAWAYS
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted tabular-nums">
          x{String(highlights.length).padStart(2, '0')} ITEMS
        </span>
      </div>

      <ol className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2">
        {highlights.map((highlight, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`shrink-0 pt-0.5 font-mono text-[11px] tabular-nums tracking-[0.15em] ${a.text}`}
              style={{ textShadow: a.textGlow }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
              {highlight}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function CornerTick({
  position,
  accent,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  accent: AccentName
}) {
  const a = ACCENT_TOKENS[accent]
  const placement = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  } as const
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${placement[position]} h-2.5 w-2.5`}
    >
      <span
        className={`absolute ${
          position.startsWith('t') ? 'top-0' : 'bottom-0'
        } ${position.endsWith('l') ? 'left-0' : 'right-0'} h-px w-2.5 ${a.bg}`}
      />
      <span
        className={`absolute ${
          position.startsWith('t') ? 'top-0' : 'bottom-0'
        } ${position.endsWith('l') ? 'left-0' : 'right-0'} h-2.5 w-px ${a.bg}`}
      />
    </span>
  )
}
