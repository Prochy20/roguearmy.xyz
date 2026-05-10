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
    blurb: 'The bunker · landing page',
    available: true,
    sub: [
      { label: 'Hero', href: '/', available: true },
      { label: 'Games we play', href: '/#games', available: true },
    ],
  },
] as const
