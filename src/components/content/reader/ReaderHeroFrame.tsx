import { ACCENT_TOKENS, type AccentName } from './accent'
import { ReaderHeroImage } from './ReaderHeroImage'

interface ReaderHeroFrameProps {
  accent: AccentName
  /** Remote image URL. Nullable — when missing OR the load fails at runtime,
   *  the frame renders a tactical NoSignalPanel placeholder in place of the
   *  image, preserving the corner ticks + film-strip metadata. */
  thumbnailUrl: string | null | undefined
  /** Short label rendered in the top-left documentary plate (e.g. WEEKLY, DAILY, ARTICLE). */
  kindLabel: string
  /** Pre-formatted period / publish date — e.g. "WEEK OF MAY 19" or "MAY 19 · TUE". */
  periodLabel: string
  /** Optional right-side byline label (e.g. "// AI · ASHLEY"). Hidden when omitted. */
  bylineLabel?: string
  /** Optional filename stamp used by the NoSignal placeholder (e.g. `IMG_7B2B`). */
  fileNumber?: string
}

/**
 * Wide cinematic hero frame.
 *
 * Composition:
 *  - Aspect ~21:9, full-width within the container.
 *  - Four corner ticks in accent color, hugging the outer border.
 *  - Inside the frame: the image, an accent-tinted radial backlight behind it,
 *    and a film-strip-style metadata bar pinned to the bottom — left half is
 *    the kind + period token, right half is the optional byline.
 *  - On the top-left of the frame, a faint slate label `// SPECIMEN` doubles
 *    as a "documentary plate" tag — sells the cyber/intel reading.
 */
export function ReaderHeroFrame({
  accent,
  thumbnailUrl,
  kindLabel,
  periodLabel,
  bylineLabel,
  fileNumber,
}: ReaderHeroFrameProps) {
  const a = ACCENT_TOKENS[accent]

  return (
    <figure className="relative">
      {/* Outer corner ticks — 4 of them, accent color, sit slightly outside */}
      <CornerTick position="tl" accent={accent} />
      <CornerTick position="tr" accent={accent} />
      <CornerTick position="bl" accent={accent} />
      <CornerTick position="br" accent={accent} />

      <div
        className={`relative overflow-hidden border ${a.borderSoft}`}
        style={{
          aspectRatio: '21 / 9',
          background: a.radialGlow,
        }}
      >
        {/* Image + vignette OR NoSignalPanel — a client child owns the
            onError state so the rest of the frame stays server-rendered. */}
        <ReaderHeroImage
          src={thumbnailUrl}
          accent={accent}
          fileNumber={fileNumber}
        />

        {/* Top-left documentary plate */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-2 border ${a.borderSoft} bg-void/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.32em] backdrop-blur-sm sm:top-4 sm:left-4`}
        >
          <span aria-hidden className={`inline-block h-1 w-1 ${a.bg}`} />
          <span className={a.textSoft}>SPECIMEN</span>
          <span aria-hidden className="text-text-muted/40">::</span>
          <span className="text-text-muted">{kindLabel}</span>
        </div>

        {/* Bottom film-strip metadata bar */}
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center justify-between border-t ${a.borderSoft} bg-void/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.32em] backdrop-blur-sm sm:px-5 sm:py-3 sm:text-[10px]`}
        >
          <span className={`${a.textSoft} truncate`}>
            // {kindLabel} · {periodLabel}
          </span>
          {bylineLabel && (
            <span className="text-text-muted">{bylineLabel}</span>
          )}
        </div>
      </div>
    </figure>
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
  const positions = {
    tl: '-top-1 -left-1',
    tr: '-top-1 -right-1',
    bl: '-bottom-1 -left-1',
    br: '-bottom-1 -right-1',
  } as const
  const horizontals = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  } as const
  const verticals = horizontals

  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 ${positions[position]}`}>
      <span
        className={`absolute ${horizontals[position]} ${a.bg}`}
        style={{ width: 18, height: 1 }}
      />
      <span
        className={`absolute ${verticals[position]} ${a.bg}`}
        style={{ width: 1, height: 18 }}
      />
    </span>
  )
}
