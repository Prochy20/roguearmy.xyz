import { CommandConsolePage } from '@/components/division2/landing/CommandConsolePage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { hasBriefingsAccess } from '@/lib/auth/badges'
import { getMemberAuth } from '@/lib/auth/session.server'
import { todayUtcIso } from '@/lib/division2/format'
import { fetchLandingState } from '@/lib/division2/landing.server'

// Dynamic rendering is already implicit: `getMemberAuth()` reads cookies,
// which opts this route out of static prerendering. Per-tile freshness
// signals + the ribbon aggregate pill rely on `todayUtcIso()` running each
// request — that holds as long as render isn't memoized at build time, which
// the cookie read guarantees. Ashley fetches handle their own caching via
// `unstable_cache`, unaffected by route-level dynamic mode.

const DEFAULT_TITLE = 'Command Console | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'Live overview of Division 2 ops — escalation drops, content firehose, and weekly briefing, in one panel.'

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.landingPage?.seo
  return {
    title: seo?.title?.trim() || DEFAULT_TITLE,
    description: seo?.description?.trim() || DEFAULT_DESCRIPTION,
  }
}

export default async function Division2LandingPage() {
  // Auth gate happens first so the landing-state fetch can decide whether
  // to spend an Ashley round-trip pulling the daily-briefing peek.
  const auth = await getMemberAuth()
  const hasAccess = hasBriefingsAccess(auth.symbolicRoles)

  const [state, division2] = await Promise.all([
    fetchLandingState(todayUtcIso(), { includeDailies: hasAccess }),
    cachedFindGlobal('division2'),
  ])

  return (
    <CommandConsolePage
      state={state}
      content={division2.landingPage ?? null}
      hasAccess={hasAccess}
      perks={division2.briefingsPage?.perks ?? null}
    />
  )
}
