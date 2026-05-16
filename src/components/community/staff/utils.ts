import type { StaffAccent } from './types'

const ACCENTS: readonly StaffAccent[] = ['green', 'cyan', 'magenta'] as const

/**
 * Raw "r,g,b" string per accent — handy for inline `rgba(...)` fills in SVG,
 * where Tailwind classes can't reach. Mirrors the rga-* palette used by the cards.
 */
export const ACCENT_RGB: Record<StaffAccent, string> = {
  green: '0,255,65',
  cyan: '0,255,255',
  magenta: '255,0,255',
  dev: '204,255,0',
  admin: '255,0,102',
  mod: '255,128,0',
}

/**
 * Stable accent per profile, derived from the discordId snowflake so it never
 * shifts between renders. The order field is intentionally not used because
 * editors reorder rows — keying off discordId keeps the same person the same
 * colour even after a sort change.
 */
export function accentFor(discordId: string): StaffAccent {
  let h = 0
  for (let i = 0; i < discordId.length; i++) {
    h = (h * 31 + discordId.charCodeAt(i)) >>> 0
  }
  return ACCENTS[h % ACCENTS.length]
}

/**
 * Two-character initials cut from a display name. Splits on whitespace so
 * "VANGUARD" → "VA", "Alex Quinn" → "AQ". Handles single-word handles like
 * "Cipher" by taking the first two letters.
 */
export function initialsOf(displayName: string): string {
  const trimmed = displayName.trim()
  if (!trimmed) return '??'
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

/**
 * Operative ID derived from the profile order (1-indexed within the manifest).
 * Padded to three digits so OP_001 .. OP_999 align across the grid.
 */
export function operativeIdAt(index: number): string {
  return `OP_${String(index + 1).padStart(3, '0')}`
}

/**
 * Format an ISO timestamp to a tactical "MMM YYYY" string (e.g. "MAR 2019").
 * Used on the card's tenure data band — readable at small mono sizes, fits
 * the dossier register.
 */
export function formatMonthYear(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Format an ISO timestamp to a tactical "HH:MM UTC · DD MMM" string. */
export function formatSyncStamp(iso: string | null): string {
  if (!iso) return '— · —'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '— · —'
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][
    d.getUTCMonth()
  ]
  return `${hh}:${mm} UTC · ${day} ${mon}`
}

/**
 * Find the freshest cached_at across a manifest. The header surfaces this as
 * "LAST SYNCED" so readers can see how live the dossier is overall.
 */
export function freshestSync(stamps: ReadonlyArray<string | null>): string | null {
  let best: string | null = null
  let bestMs = -Infinity
  for (const s of stamps) {
    if (!s) continue
    const ms = Date.parse(s)
    if (!isNaN(ms) && ms > bestMs) {
      best = s
      bestMs = ms
    }
  }
  return best
}

interface LexicalNode {
  text?: string
  children?: LexicalNode[]
}

/**
 * Flatten a Lexical richText root to plain text for the card preview. The
 * card renders bio as a 3-line clamped paragraph, so we don't need any
 * formatting — just the words. When the future operative detail page wants
 * the full styled bio, switch to the proper Lexical JSX converter.
 */
export function lexicalToPlainText(richText: unknown): string | null {
  if (!richText || typeof richText !== 'object') return null
  const root = (richText as { root?: LexicalNode }).root
  if (!root) return null
  const text = walk(root).trim()
  return text.length > 0 ? text : null
}

function walk(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  return node.children
    .map((child) => walk(child))
    .filter((s) => s.length > 0)
    .join(' ')
}
