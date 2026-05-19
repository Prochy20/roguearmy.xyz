import type { RoleGateKey } from '@/lib/auth/roleGate.types'

export interface NavSubLink {
  label: string
  href: string
  available: boolean
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
    href: '/division-2/escalation',
    blurb: 'Active operatives only · escalation, loot, tools',
    available: true,
    requiresAuth: true,
    requiresRole: 'division2Role',
    sub: [{ label: 'Escalation', href: '/division-2/escalation', available: true }],
  },
] as const
