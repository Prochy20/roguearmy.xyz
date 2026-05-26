import type { RoleGateKey } from '@/lib/auth/roleGate.types'

export interface NavSubLink {
  label: string
  href: string
  available: boolean
  /** When true, hide this sub-link for visitors who aren't signed in. */
  requiresAuth?: boolean
}

export interface NavItem {
  label: string
  href: string
  blurb: string
  available: boolean
  /** When true, hide this entry for visitors who aren't signed in. */
  requiresAuth?: boolean
  /**
   * When set, hide this entry unless the resolved gate for the given Settings
   * key is `allowed`. Lookup happens client-side against the `roleGates` map
   * threaded through the auth context.
   */
  requiresRole?: RoleGateKey
  sub: readonly NavSubLink[]
}

export const NAV: readonly NavItem[] = [
  {
    label: 'HOMEPAGE',
    href: '/',
    blurb: 'Home base · landing page',
    available: true,
    sub: [],
  },
  {
    label: 'COMMUNITY',
    href: '/community',
    blurb: 'Casual gaming for adults · who, why, by the numbers',
    available: true,
    sub: [{ label: 'Staff', href: '/community/staff', available: true }],
  },
  {
    label: 'LEADERBOARD',
    href: '/leaderboard',
    blurb: 'Live XP standings · members only',
    available: true,
    requiresAuth: true,
    sub: [],
  },
  {
    label: 'MANIFESTO',
    href: '/manifesto',
    blurb: 'Charter, rules, privacy, terms · how this place runs',
    available: true,
    sub: [
      { label: 'Rules', href: '/manifesto#rules', available: true },
      { label: 'Privacy', href: '/manifesto#privacy', available: true },
      { label: 'Terms', href: '/manifesto#terms', available: true },
    ],
  },
  {
    label: 'DIVISION 2',
    href: '/division-2',
    blurb: 'Join our clans · escalation · briefings · live intel',
    available: true,
    // Public-by-default. The header swaps the click target to /division-2/clans
    // for anonymous + no-role viewers (see resolveDivision2Href). Sub-items
    // that need the D2 role advertise themselves but click-through hits the
    // gate; the public /division-2/clans sub-item is universal.
    sub: [
      // Clans is the public face — visible to everyone.
      { label: 'Clans', href: '/division-2/clans', available: true },
      // The rest sit behind the D2 role gate. Anonymous visitors don't see
      // them in the nav; signed-in members do (and any click-through hits
      // the layout's ROLE_REQUIRED dossier if they lack the role).
      { label: 'Escalation', href: '/division-2/escalation', available: true, requiresAuth: true },
      { label: 'Briefings', href: '/division-2/briefings', available: true, requiresAuth: true },
      { label: 'Content', href: '/division-2/content', available: true, requiresAuth: true },
    ],
  },
] as const
