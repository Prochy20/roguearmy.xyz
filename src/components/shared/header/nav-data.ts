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
  sub: readonly NavSubLink[]
}

export const NAV: readonly NavItem[] = [
  {
    label: 'HOMEPAGE',
    href: '/',
    blurb: 'Home base · landing page',
    available: true,
    sub: [
      { label: 'Hero', href: '/', available: true },
      { label: 'Games we play', href: '/#games', available: true },
    ],
  },
  {
    label: 'COMMUNITY',
    href: '/community',
    blurb: 'Casual gaming for adults · who, why, by the numbers',
    available: true,
    sub: [
      { label: 'By the numbers', href: '/community#sec-01', available: true },
      { label: 'Beyond random lobbies', href: '/community#sec-02', available: true },
      { label: 'Why this exists', href: '/community#sec-03', available: true },
      { label: 'Stand the watch', href: '/community#sec-04', available: true },
    ],
  },
  {
    label: 'LEADERBOARD',
    href: '/leaderboard',
    blurb: 'Live XP standings · members only',
    available: true,
    requiresAuth: true,
    sub: [
      { label: 'Top 20', href: '/leaderboard', available: true },
      { label: 'Your rank', href: '/leaderboard', available: true },
    ],
  },
] as const
