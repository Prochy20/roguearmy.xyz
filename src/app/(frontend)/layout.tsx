import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import '@/app/globals.css'
import { ScanlineOverlay } from '@/components/effects'

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

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <ScanlineOverlay intensity="low" />
      <main>{children}</main>
      <Analytics />
    </>
  )
}
