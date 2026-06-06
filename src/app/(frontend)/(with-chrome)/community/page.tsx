import { fetchAshleyService } from '@/lib/api/server'
import { getMemberAuth } from '@/lib/auth/session.server'
import { cachedFindGlobal } from '@/lib/payload/cached'
import type { components } from '@/lib/api/schema'
import { Hero } from '@/components/community/Hero'
import { PullStrip } from '@/components/community/PullStrip'
import { StatsSection } from '@/components/community/StatsSection'
import { LeaderboardTeaser } from '@/components/community/LeaderboardTeaser'
import { BeyondLobbies } from '@/components/community/BeyondLobbies'
import { LoreSection } from '@/components/community/LoreSection'
import { JoinCTA } from '@/components/community/JoinCTA'

type CommunityStats = components['schemas']['CommunityStatsDto']

export async function generateMetadata() {
  const page = await cachedFindGlobal('community-page')
  return {
    title: page.seo?.title ?? 'Community | Rogue Army',
    description:
      page.seo?.description ??
      'A casual gaming community for adults across South Africa, the UK, and Europe. Drama-free, no skill gates, no engagement metrics — just the people, by the numbers.',
  }
}

// Dynamic rendering is already forced by the cookie-based auth read in
// getMemberAuth(), so an explicit `force-dynamic` is redundant.

export default async function CommunityPage() {
  const [stats, auth, page, chrome] = await Promise.all([
    fetchAshleyService<CommunityStats>((c) => c.GET('/api/community/stats')),
    getMemberAuth(),
    cachedFindGlobal('community-page'),
    cachedFindGlobal('site-chrome'),
  ])

  const showLeaderboardTeaser =
    page.leaderboardTeaser?.enabled !== false && auth.status === 'active'

  return (
    <>
      <Hero
        stats={stats}
        content={page.hero}
        memberCountFloor={chrome.memberCountFloor ?? null}
      />
      {page.pullStrip?.enabled !== false && <PullStrip content={page.pullStrip} />}
      {page.stats?.enabled !== false && <StatsSection stats={stats} content={page.stats} />}
      {showLeaderboardTeaser && <LeaderboardTeaser content={page.leaderboardTeaser} />}
      {page.beyondLobbies?.enabled !== false && <BeyondLobbies content={page.beyondLobbies} />}
      {page.lore?.enabled !== false && <LoreSection content={page.lore} />}
      {page.joinCta?.enabled !== false && <JoinCTA content={page.joinCta} />}
    </>
  )
}
