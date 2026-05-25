/**
 * Badge derivation from Ashley's symbolic role list.
 *
 * Two distinct concepts:
 *   - primary badge:  what the user IS (DEVELOPER > STAFF > MEMBER), with
 *                     BOOSTER as the primary only when nothing else applies
 *   - booster decoration: an additive perk indicator, shown alongside the
 *                     primary badge (or as the primary when there's nothing else)
 *
 * Kept as a single comparator so menu chrome and profile page can never drift.
 */

export const SYMBOLIC_ROLES = [
  'DISCORD_ROLE_DEVELOPER',
  'DISCORD_ROLE_TICKET_RESOLVER',
  'DISCORD_ROLE_AFK',
  'DISCORD_ROLE_QUARANTINE',
  'DISCORD_ROLE_PENDING_VERIFICATION',
  'DISCORD_ROLE_NOTIFY_ABOUT_PENDING_VERIFICATION',
  'DISCORD_ROLE_BOOSTER',
  'DISCORD_ROLE_STAFF',
] as const

export type SymbolicRole = (typeof SYMBOLIC_ROLES)[number]

export type PrimaryBadge = 'DEVELOPER' | 'STAFF' | 'BOOSTER' | 'MEMBER'

export function isSymbolicRole(value: unknown): value is SymbolicRole {
  return typeof value === 'string' && (SYMBOLIC_ROLES as readonly string[]).includes(value)
}

export function normalizeSymbolicRoles(input: unknown): SymbolicRole[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<SymbolicRole>()
  for (const v of input) if (isSymbolicRole(v)) seen.add(v)
  return [...seen]
}

export function pickPrimaryBadge(roles: readonly SymbolicRole[]): PrimaryBadge {
  if (roles.includes('DISCORD_ROLE_DEVELOPER')) return 'DEVELOPER'
  if (roles.includes('DISCORD_ROLE_STAFF')) return 'STAFF'
  if (roles.includes('DISCORD_ROLE_BOOSTER')) return 'BOOSTER'
  return 'MEMBER'
}

export function hasBoosterDecoration(roles: readonly SymbolicRole[]): boolean {
  if (!roles.includes('DISCORD_ROLE_BOOSTER')) return false
  // Only "decoration" when there's a competing functional badge — otherwise
  // BOOSTER is the primary badge and the decoration would be redundant.
  return roles.includes('DISCORD_ROLE_DEVELOPER') || roles.includes('DISCORD_ROLE_STAFF')
}

export function isQuarantined(roles: readonly SymbolicRole[]): boolean {
  return roles.includes('DISCORD_ROLE_QUARANTINE')
}

/**
 * Gate for premium briefing content (daily briefings) on /division-2/briefings.
 *
 * Grants access to BOOSTER + STAFF + DEVELOPER so the team can read everything
 * boosters can. Plain members see only weekly briefings on the list page and a
 * BOOSTER_REQUIRED dossier when navigating to a daily detail URL directly.
 *
 * The `devOverride: 'member'` option lets a developer running locally preview
 * the non-booster experience. The env check lives here, not at the call site,
 * so a stray `?as=member` in production can never demote a real booster.
 */
export function hasBriefingsAccess(
  roles: readonly SymbolicRole[],
  opts?: { devOverride?: 'member' | null },
): boolean {
  if (
    opts?.devOverride === 'member' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return false
  }
  return (
    roles.includes('DISCORD_ROLE_DEVELOPER') ||
    roles.includes('DISCORD_ROLE_STAFF') ||
    roles.includes('DISCORD_ROLE_BOOSTER')
  )
}
