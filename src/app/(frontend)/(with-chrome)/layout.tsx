import React from 'react'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/header/Header'
import { getMemberCount } from '@/lib/community.server'
import { cachedFindGlobal } from '@/lib/payload/cached'
import type { SiteChrome } from '@/payload-types'

const LIVE_DEFAULT =
  'Casual gaming community for adults 25+. {members} operators on the one server that feels like home.'
const FALLBACK_DEFAULT =
  'Casual gaming community for adults 25+. The one server that feels like home.'

function composeTagline(chrome: SiteChrome, count: number | null): string {
  if (count === null) return chrome.tagline?.fallback ?? FALLBACK_DEFAULT
  const live = chrome.tagline?.live ?? LIVE_DEFAULT
  return live.includes('{members}') ? live.replace('{members}', `${count}+`) : live
}

/**
 * Sub-layout for "normal" pages that get the full site chrome (Header + Footer).
 *
 * Routes that should NOT have chrome (error.tsx, not-found.tsx, /auth/*) live
 * outside this route group at (frontend)/ — they inherit only the providers,
 * scanlines, and analytics from the parent (frontend)/layout.tsx.
 *
 * Adding a new chromeless surface? Put it at (frontend)/<your-route>/.
 * Adding a new normal page? Put it inside (with-chrome)/.
 */
export default async function WithChromeLayout({ children }: { children: React.ReactNode }) {
  // Both calls are per-request deduped via React.cache — even though
  // getMemberCount() internally also calls cachedFindGlobal('site-chrome'),
  // we still issue only one Mongo query per request.
  const [{ count }, chrome] = await Promise.all([
    getMemberCount(),
    cachedFindGlobal('site-chrome'),
  ])

  const tagline = composeTagline(chrome, count)

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer tagline={tagline} />
    </>
  )
}
