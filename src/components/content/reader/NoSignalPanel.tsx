import { ACCENT_TOKENS, type AccentName } from './accent'

interface NoSignalPanelProps {
  accent: AccentName
  /** Stamp rendered bottom-right (e.g. `IMG_7B2B`). Defaults to `IMG_NULL`. */
  fileNumber?: string
  /**
   * `card` is tuned for the 16:9 BriefingCard thumbnail (~250-360px tall).
   * `hero` is tuned for the 21:9 reader hero (~360-720px tall) — bigger
   * centerpiece, larger telemetry, more breathing room.
   */
  size?: 'card' | 'hero'
}

/**
 * Tactical "lost transmission" panel rendered when an image is missing OR
 * fails to load at runtime. No image asset — everything is gradients,
 * repeating patterns, and a small inline SVG glyph.
 *
 * Shared between the BriefingCard thumbnail slot and the ReaderHeroFrame so
 * both surfaces fail in exactly the same visual language. Pulls all color
 * from `ACCENT_TOKENS` so it works for every reader accent (cyan/orange/
 * green/magenta/red), not just the briefing-specific cyan/mod pair.
 */
export function NoSignalPanel({
  accent,
  fileNumber = 'IMG_NULL',
  size = 'card',
}: NoSignalPanelProps) {
  const a = ACCENT_TOKENS[accent]
  const isHero = size === 'hero'
  // Radial alpha derived from the accent's rgb token — Tailwind v4 can't
  // synthesize radial gradients from alpha utilities, so we go to raw rgba.
  const radialFill = `rgba(${a.rgb}, 0.10)`

  return (
    <div className="relative h-full w-full overflow-hidden bg-[rgba(6,6,6,0.95)]">
      {/* Diagonal stripe ground — matches card STRIPE_BG vocabulary. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent 0 10px, rgba(255,255,255,0.03) 10px 11px)',
        }}
      />

      {/* Accent radial glow centered behind the glyph. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${radialFill} 0%, transparent 65%)`,
        }}
      />

      {/* Horizontal scanlines — dead-feed screen feel. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.30) 2px 3px)',
        }}
      />

      {/* Roving tracking band — broken VHS playback cue. Anchored to ~58%
          to avoid colliding with the centerpiece glyph. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-[58%] opacity-30 ${
          isHero ? 'h-[10px]' : 'h-[6px]'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
        }}
      />

      {/* Top-left telemetry — pulsing accent dot + FEED · OFFLINE. */}
      <div
        className={`absolute flex items-center gap-2 font-mono uppercase tracking-[0.3em] ${
          isHero ? 'top-4 left-5 text-[10px] sm:top-5 sm:left-6' : 'top-3 left-4 text-[9px]'
        }`}
      >
        <span
          aria-hidden
          className={`block ${isHero ? 'h-2 w-2' : 'h-1.5 w-1.5'} ${a.bg} motion-safe:animate-pulse`}
        />
        <span className="text-text-muted/70">FEED</span>
        <span aria-hidden className="text-text-muted/30">·</span>
        <span className={a.text}>OFFLINE</span>
      </div>

      {/* Tactical corner ticks — two diagonally opposite so they read as a
          targeting frame without doubling the parent's own border. */}
      <span
        aria-hidden
        className={`absolute border-t border-r ${a.borderSoft} ${
          isHero ? 'top-3 right-3 h-4 w-4' : 'top-2 right-2 h-3 w-3'
        }`}
      />
      <span
        aria-hidden
        className={`absolute border-b border-l ${a.borderSoft} ${
          isHero ? 'bottom-3 left-3 h-4 w-4' : 'bottom-2 left-2 h-3 w-3'
        }`}
      />

      {/* Centerpiece — viewfinder SVG + NO SIGNAL caps. */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${a.text} ${
          isHero ? 'gap-4' : 'gap-2.5'
        }`}
      >
        <NoSignalGlyph size={size} />
        <span
          className={`font-mono uppercase ${
            isHero
              ? 'text-[12px] tracking-[0.5em] sm:text-[14px]'
              : 'text-[10px] tracking-[0.45em] sm:text-[11px]'
          }`}
        >
          NO SIGNAL
        </span>
      </div>

      {/* Bottom-right filename — mirrors the card body's BRF_xxxx.md stamp. */}
      <div
        className={`absolute font-mono uppercase tracking-[0.3em] text-text-muted/55 ${
          isHero ? 'bottom-4 right-5 text-[10px] sm:bottom-5 sm:right-6' : 'bottom-3 right-4 text-[9px]'
        }`}
      >
        <span className={a.text}>{fileNumber}</span>
        <span className="text-text-muted/40">.bin</span>
      </div>
    </div>
  )
}

/**
 * Inline SVG glyph — a "viewfinder" frame with corner ticks and crossed-out
 * interior. Inherits color from parent via `currentColor`.
 */
function NoSignalGlyph({ size }: { size: 'card' | 'hero' }) {
  const dims =
    size === 'hero'
      ? 'h-14 w-20 sm:h-16 sm:w-24 lg:h-20 lg:w-32'
      : 'h-9 w-14 sm:h-10 sm:w-16'
  return (
    <svg
      viewBox="0 0 64 44"
      className={dims}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden
    >
      {/* Outer frame */}
      <rect x="2" y="2" width="60" height="40" opacity="0.5" />
      {/* Reinforced corner ticks — read as a viewfinder reticle */}
      <path d="M2 9 L2 2 L9 2" opacity="0.95" />
      <path d="M55 2 L62 2 L62 9" opacity="0.95" />
      <path d="M2 35 L2 42 L9 42" opacity="0.95" />
      <path d="M55 42 L62 42 L62 35" opacity="0.95" />
      {/* Crossed diagonals — "feed cut" */}
      <path d="M6 6 L58 38" strokeDasharray="2 3" opacity="0.6" />
      <path d="M58 6 L6 38" strokeDasharray="2 3" opacity="0.6" />
      {/* Center bullet */}
      <circle cx="32" cy="22" r="1.5" fill="currentColor" stroke="none" opacity="0.95" />
    </svg>
  )
}
