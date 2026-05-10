import { fetchAshleyService } from '@/lib/api/server'
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

// Per-request fresh data: the stats DTO carries a generatedAt timestamp the
// hero shows, so static caching would lie. Next.js will still SSR each visit;
// adjust to revalidate when metrics tolerate staleness.
export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const stats = await fetchAshleyService<CommunityStats>((c) =>
    c.GET('/api/community/stats'),
  )

  return (
    <>
      <Hero stats={stats} />
      <PullStrip />
      <StatsSection stats={stats} />
      <LeaderboardTeaser />
      <BeyondLobbies />
      <LoreSection />
      <JoinCTA />
    </>
  )
}
