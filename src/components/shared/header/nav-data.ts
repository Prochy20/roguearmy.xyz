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
] as const
