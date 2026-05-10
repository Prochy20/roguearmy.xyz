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
      { label: 'Community', href: '/#community', available: true },
      { label: 'Games we play', href: '/#games', available: true },
    ],
  },
  {
    label: 'BLOG',
    href: '/blog',
    blurb: 'Field reports & deep dives',
    available: true,
    sub: [
      { label: 'Latest articles', href: '/blog', available: true },
      { label: 'Series', href: '/blog/series', available: true },
      { label: 'Bookmarks', href: '/blog/bookmarks', available: true },
      { label: 'Reading history', href: '/blog/history', available: true },
    ],
  },
  {
    label: 'MEMBERS',
    href: '/members',
    blurb: 'Operatives & ops',
    available: false,
    sub: [
      { label: 'Roster', href: '/members', available: false },
      { label: 'Manifesto', href: '/manifesto', available: true },
      { label: 'Twitch hub', href: '/twitch', available: false },
    ],
  },
] as const
