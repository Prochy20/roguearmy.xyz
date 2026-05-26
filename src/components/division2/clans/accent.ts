/**
 * Accent tokens for clan cards. Five values are admin-pickable; everything
 * else (left rail color, halo gradient stops, tag-chip palette) is derived
 * from this map so the card composition stays consistent across cards.
 *
 * Reusing CyberCorners colors where they exist (green/cyan/magenta) so the
 * boxed-corner frame inherits the same accent. New tokens (amber, azure)
 * map to the rga-amber / rga-azure CSS variables added in globals.css.
 */
export type ClanAccent = 'green' | 'amber' | 'azure' | 'cyan' | 'magenta'

export interface ClanAccentTheme {
  /** 4-px left rail color. */
  rail: string
  /** Soft halo behind the banner image — radial gradient via inline style. */
  haloRgb: string
  /** Tag-chip text + border tint. */
  text: string
  border: string
  fill: string
  /** Glow shadow class for the leader avatar ring. */
  ring: string
  /** Cyber-* component color, since CyberCorners only knows certain values. */
  cyberColor: 'green' | 'cyan' | 'magenta' | 'orange'
}

export const CLAN_ACCENTS: Record<ClanAccent, ClanAccentTheme> = {
  green: {
    rail: 'bg-rga-green',
    haloRgb: '0, 255, 65',
    text: 'text-rga-green',
    border: 'border-rga-green/45',
    fill: 'bg-rga-green/8',
    ring: 'ring-rga-green/40',
    cyberColor: 'green',
  },
  amber: {
    rail: 'bg-rga-amber',
    haloRgb: '255, 156, 42',
    text: 'text-rga-amber',
    border: 'border-rga-amber/45',
    fill: 'bg-rga-amber/8',
    ring: 'ring-rga-amber/45',
    // CyberCorners doesn't know rga-amber; orange is the closest existing tone.
    cyberColor: 'orange',
  },
  azure: {
    rail: 'bg-rga-azure',
    haloRgb: '42, 109, 255',
    text: 'text-rga-azure',
    border: 'border-rga-azure/45',
    fill: 'bg-rga-azure/10',
    ring: 'ring-rga-azure/45',
    // CyberCorners doesn't know rga-azure; cyan is the closest existing tone.
    cyberColor: 'cyan',
  },
  cyan: {
    rail: 'bg-rga-cyan',
    haloRgb: '0, 255, 255',
    text: 'text-rga-cyan',
    border: 'border-rga-cyan/45',
    fill: 'bg-rga-cyan/8',
    ring: 'ring-rga-cyan/40',
    cyberColor: 'cyan',
  },
  magenta: {
    rail: 'bg-rga-magenta',
    haloRgb: '255, 0, 255',
    text: 'text-rga-magenta',
    border: 'border-rga-magenta/45',
    fill: 'bg-rga-magenta/8',
    ring: 'ring-rga-magenta/40',
    cyberColor: 'magenta',
  },
}

const ACCENT_KEYS = Object.keys(CLAN_ACCENTS) as readonly ClanAccent[]

export function isClanAccent(value: unknown): value is ClanAccent {
  return typeof value === 'string' && (ACCENT_KEYS as readonly string[]).includes(value)
}

export function clanAccentOr(value: unknown, fallback: ClanAccent = 'green'): ClanAccent {
  return isClanAccent(value) ? value : fallback
}
