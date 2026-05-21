import React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import '@/app/globals.css'
import { ScanlineOverlay } from '@/components/effects/ScanlineOverlay'
import { MenuProvider } from '@/components/shared/header/MenuContext'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { getJwtSession } from '@/lib/auth/session.server'
import { checkRoleGate, type RoleGateKey } from '@/lib/auth/roleGate'
import type { RoleGateMap } from '@/lib/auth/roleGate.types'

// Keys here are evaluated for every authenticated request to populate the
// AuthProvider's `roleGates` map. Extend as new gated nav entries land.
const NAV_ROLE_GATE_KEYS: RoleGateKey[] = ['division2Role']

const siteUrl = 'https://roguearmy.xyz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: 'Rogue Army | Casual Gaming Community for Adults 25+',
  description:
    'Join 200+ gamers in a drama-free community. Division 2, Battlefield, Helldivers 2, and more. No toxicity, just good times.',
  keywords: [
    'gaming community',
    'adult gamers',
    'Division 2',
    'Battlefield',
    'casual gaming',
    'discord server',
  ],

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Rogue Army',
    title: 'Rogue Army | Casual Gaming Community for Adults 25+',
    description: 'Casual gaming community for adults 25+. No drama, just good times.',
    images: [
      {
        url: '/images/banner.jpg',
        width: 960,
        height: 540,
        alt: 'Rogue Army Gaming Community',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Rogue Army | Casual Gaming Community for Adults 25+',
    description: 'Casual gaming community for adults 25+. No drama, just good times.',
    images: ['/images/banner.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: siteUrl,
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  manifest: '/site.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Rogue Army',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
      description: 'Casual gaming community for adults 25+',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Rogue Army',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ],
}

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Get JWT session from server (cached, no DB hit)
  // This provides initial auth state to AuthProvider, eliminating the client-side fetch.
  // Badge fields ride along on the JWT — refreshed on login, stale until re-login,
  // which is fine for chrome rendering. The profile page reads fresh values via getMemberAuth.
  const session = await getJwtSession()

  // Resolve role gates server-side so the nav doesn't flash between paint and
  // first /api/auth/me round-trip. Anonymous sessions skip the gate entirely
  // (every key resolves to 'anonymous' without hitting the DB).
  const roleGates: RoleGateMap = {}
  if (session) {
    const results = await Promise.all(
      NAV_ROLE_GATE_KEYS.map(async (key) => [key, await checkRoleGate(key)] as const),
    )
    for (const [key, gate] of results) roleGates[key] = gate.state
  }

  const initialAuthState = session
    ? {
        isAuthenticated: true,
        member: session,
        roleGates,
      }
    : undefined

  // Chrome (Header / Footer) lives in (with-chrome)/layout.tsx so error,
  // not-found, and auth pages render without it.
  return (
    <AuthProvider initialState={initialAuthState}>
      <MenuProvider>
        {/* Inline so the structured data is in the SSR HTML — crawlers and
            social unfurlers don't run our JS bundle, and `afterInteractive`
            would inject this only after hydration. The `<` -> `<`
            escape is the documented Next.js JSON-LD pattern; it prevents
            a `</script>` sequence inside any string field from prematurely
            terminating the tag (XSS-safe; jsonLd is a static literal). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <ScanlineOverlay intensity="low" />
        {children}
        <Analytics />
      </MenuProvider>
    </AuthProvider>
  )
}
