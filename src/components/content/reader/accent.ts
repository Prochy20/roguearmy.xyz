/**
 * Accent palette for the shared reader surface.
 *
 * Used by every component under `components/content/reader/*` — page shell,
 * breadcrumb, hero frame, title block, doc strip, TL;DR, ToC, reading widget,
 * shortcuts, footer, body, and markdown overrides.
 *
 * Tailwind v4 can't resolve interpolated class names, so each accent declares
 * one fully-spelled-out row of utility classes. Components import the row and
 * spread the relevant pieces.
 *
 * Consumers map their domain concept to an accent:
 *  - Digests: weekly → cyan, daily → orange (via `frequencyAccent` in
 *    `components/division2/digest/accent-digest.ts`).
 *  - Articles: `article.topic.tint` → AccentName directly. Article tints
 *    today resolve to one of these five values via `mapPayloadColorToTint`
 *    in `src/lib/articles.ts`.
 *
 * Naming note: the `orange` row uses the brand `rga-mod` (rgb 255,128,0),
 * not Tailwind's `orange-500`. The accent is *named* orange because the
 * visual reads as orange to humans, but the underlying color tokens remain
 * `rga-mod` so it stays brand-aligned with everything else in the codebase
 * that still uses `'mod'` literals (DigestCard, BriefingPanel, etc.).
 */
export type AccentName = 'green' | 'cyan' | 'magenta' | 'orange' | 'red'

export interface AccentTokens {
  /** Name passed to <CyberCorners color={...}/> and <CyberTag color={...}/>. */
  cornerColor: 'green' | 'cyan' | 'magenta' | 'mod' | 'red'
  /** Foreground text utility. */
  text: string
  /** Hover-state text utility — must be literal for Tailwind to detect. */
  textHover: string
  /** Slightly dimmed foreground text utility (text-X/70). */
  textSoft: string
  /** Solid background fill utility. */
  bg: string
  /** Border at strong opacity for emphasized frames. */
  borderStrong: string
  /** Border at low opacity for ambient frames. */
  borderSoft: string
  /** Border at very low opacity for resting state. */
  borderFaint: string
  /** Inline style for accent-tinted text shadow glow. */
  textGlow: string
  /** Inline style for accent-tinted box shadow glow. */
  boxGlow: string
  /** Radial backlight inline gradient for frame glow. */
  radialGlow: string
  /** Semi-transparent fill at 5% opacity for callout bodies / panel tints. */
  bgWash: string
  /** Inline-style RGB for ad-hoc compositing (e.g. progress bar). */
  rgb: string
}

export const ACCENT_TOKENS: Record<AccentName, AccentTokens> = {
  green: {
    cornerColor: 'green',
    text: 'text-rga-green',
    textHover: 'hover:text-rga-green',
    textSoft: 'text-rga-green/70',
    bg: 'bg-rga-green',
    borderStrong: 'border-rga-green/60',
    borderSoft: 'border-rga-green/25',
    borderFaint: 'border-rga-green/12',
    textGlow: '0 0 18px rgba(0,255,65,0.35)',
    boxGlow: '0 0 28px -6px rgba(0,255,65,0.45)',
    radialGlow:
      'radial-gradient(circle at center, rgba(0,255,65,0.10) 0%, rgba(0,0,0,0) 65%)',
    bgWash: 'bg-rga-green/5',
    rgb: '0,255,65',
  },
  cyan: {
    cornerColor: 'cyan',
    text: 'text-rga-cyan',
    textHover: 'hover:text-rga-cyan',
    textSoft: 'text-rga-cyan/70',
    bg: 'bg-rga-cyan',
    borderStrong: 'border-rga-cyan/60',
    borderSoft: 'border-rga-cyan/25',
    borderFaint: 'border-rga-cyan/12',
    textGlow: '0 0 18px rgba(0,255,255,0.35)',
    boxGlow: '0 0 28px -6px rgba(0,255,255,0.45)',
    radialGlow:
      'radial-gradient(circle at center, rgba(0,255,255,0.10) 0%, rgba(0,0,0,0) 65%)',
    bgWash: 'bg-rga-cyan/5',
    rgb: '0,255,255',
  },
  magenta: {
    cornerColor: 'magenta',
    text: 'text-rga-magenta',
    textHover: 'hover:text-rga-magenta',
    textSoft: 'text-rga-magenta/70',
    bg: 'bg-rga-magenta',
    borderStrong: 'border-rga-magenta/60',
    borderSoft: 'border-rga-magenta/25',
    borderFaint: 'border-rga-magenta/12',
    textGlow: '0 0 18px rgba(255,0,255,0.35)',
    boxGlow: '0 0 28px -6px rgba(255,0,255,0.45)',
    radialGlow:
      'radial-gradient(circle at center, rgba(255,0,255,0.10) 0%, rgba(0,0,0,0) 65%)',
    bgWash: 'bg-rga-magenta/5',
    rgb: '255,0,255',
  },
  orange: {
    cornerColor: 'mod',
    text: 'text-rga-mod',
    textHover: 'hover:text-rga-mod',
    textSoft: 'text-rga-mod/70',
    bg: 'bg-rga-mod',
    borderStrong: 'border-rga-mod/60',
    borderSoft: 'border-rga-mod/25',
    borderFaint: 'border-rga-mod/12',
    textGlow: '0 0 18px rgba(255,128,0,0.35)',
    boxGlow: '0 0 28px -6px rgba(255,128,0,0.45)',
    radialGlow:
      'radial-gradient(circle at center, rgba(255,128,0,0.10) 0%, rgba(0,0,0,0) 65%)',
    bgWash: 'bg-rga-mod/5',
    rgb: '255,128,0',
  },
  red: {
    cornerColor: 'red',
    text: 'text-red-400',
    textHover: 'hover:text-red-400',
    textSoft: 'text-red-400/70',
    bg: 'bg-red-500',
    borderStrong: 'border-red-500/60',
    borderSoft: 'border-red-500/25',
    borderFaint: 'border-red-500/12',
    textGlow: '0 0 18px rgba(239,68,68,0.4)',
    boxGlow: '0 0 28px -6px rgba(239,68,68,0.5)',
    radialGlow:
      'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, rgba(0,0,0,0) 65%)',
    bgWash: 'bg-red-500/5',
    rgb: '239,68,68',
  },
}
