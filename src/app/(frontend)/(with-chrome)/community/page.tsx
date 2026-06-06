import { fetchAshleyService } from '@/lib/api/server'
import { getMemberAuth } from '@/lib/auth/session.server'
import type { components } from '@/lib/api/schema'
import { Hero } from '@/components/community/Hero'
import { PullStrip } from '@/components/community/PullStrip'
import { StatsSection } from '@/components/community/StatsSection'
import { LeaderboardTeaser } from '@/components/community/LeaderboardTeaser'
import { BeyondLobbies } from '@/components/community/BeyondLobbies'
import { LoreSection } from '@/components/community/LoreSection'
import { JoinCTA } from '@/components/community/JoinCTA'

type CommunityStats = components['schemas']['CommunityStatsDto']

export const metadata = {
  title: 'Community | Rogue Army',
  description:
    'A casual gaming community for adults across South Africa, the UK, and Europe. Drama-free, no skill gates, no engagement metrics — just the people, by the numbers.',
}

// Dynamic rendering is already forced by the cookie-based auth read in
// getMemberAuth(), so an explicit `force-dynamic` is redundant. Leaving it
// off means individual fetch() calls inside the render are uncached by
// default (Next 15 behavior) — exactly what we want for the live stats DTO
// without disabling caching globally.

export default async function CommunityPage() {
  const [stats, auth] = await Promise.all([
    fetchAshleyService<CommunityStats>((c) => c.GET('/api/community/stats')),
    getMemberAuth(),
  ])

  return (
    <>
      <Hero stats={stats} />
      <PullStrip />
      <StatsSection stats={stats} />
      {auth.status === 'active' && <LeaderboardTeaser />}
      <BeyondLobbies />
      <LoreSection />
      <JoinCTA />
    </>
  )
}
