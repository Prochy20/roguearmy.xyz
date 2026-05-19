import type { DigestFrequency } from '@/lib/division2/digest.server'

/**
 * Frequency-driven accent palette for the digest detail surface.
 *
 * Tailwind v4 can't resolve interpolated class names, so each accent declares
 * one fully-spelled-out row of utility classes. Components import the row and
 * spread the relevant pieces. The same shape ships across all digest detail
 * chrome — hero frame ticks, ToC active state, callout borders, doc-strip
 * highlights, reading-widget bar — so flipping the digest frequency flips the
 * entire surface in one prop pass.
 */
export type AccentName = 'cyan' | 'mod'

export interface AccentTokens {
  /** Name passed to <CyberCorners color={...}/> and <CyberTag color={...}/>. */
  cornerColor: 'cyan' | 'mod'
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
  mod: {
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
}

export function frequencyAccent(frequency: DigestFrequency): AccentName {
  return frequency === 'weekly' ? 'cyan' : 'mod'
}
