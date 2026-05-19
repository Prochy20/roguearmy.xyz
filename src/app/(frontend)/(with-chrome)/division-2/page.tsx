import { CommandConsolePage } from '@/components/division2/landing/CommandConsolePage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { hasDigestAccess } from '@/lib/auth/badges'
import { getMemberAuth } from '@/lib/auth/session.server'
import { todayUtcIso } from '@/lib/division2/format'
import { fetchLandingState } from '@/lib/division2/landing.server'

// Bypass the Next.js full-route cache: per-tile freshness signals + the
// ribbon's aggregate pill depend on real-time clock math, and the underlying
// Ashley fetches handle their own caching. Without this the prefetched RSC
// payload could serve a stale "6H AGO" indefinitely.
export const dynamic = 'force-dynamic'

const DEFAULT_TITLE = 'Command Console | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'Live overview of Division 2 ops — escalation drops, content firehose, and weekly digest, in one panel.'

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
  const hasAccess = hasDigestAccess(auth.symbolicRoles)

  const [state, division2] = await Promise.all([
    fetchLandingState(todayUtcIso(), { includeDailies: hasAccess }),
    cachedFindGlobal('division2'),
  ])

  return (
    <CommandConsolePage
      state={state}
      content={division2.landingPage ?? null}
      hasAccess={hasAccess}
      perks={division2.digestPage?.perks ?? null}
    />
  )
}
