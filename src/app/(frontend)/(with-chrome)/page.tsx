import { getPayload } from 'payload'
import config from '@payload-config'
import type { Game } from '@/payload-types'
import { Hero } from "@/components/home/Hero"
import { GamesShowcase } from "@/components/home/GamesShowcase"
import { StatsTicker } from "@/components/home/StatsTicker"
import { CommunityValues } from "@/components/home/CommunityValues"
import { AshleyTerminal } from "@/components/home/AshleyTerminal"
import { FinalCTA } from "@/components/home/FinalCTA"
import { HashScrollHandler } from "@/components/home/HashScrollHandler"
import { getMemberCount } from '@/lib/community.server'

export default async function HomePage() {
  const [payload, { count, floor }] = await Promise.all([
    getPayload({ config }),
    getMemberCount(),
  ])
  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 1 })
  const games = (homepage.games as Game[]) ?? []
  const memberCount = count ?? floor

  return (
    <>
      <HashScrollHandler />
      <Hero />
      <GamesShowcase games={games} />
      <StatsTicker memberCount={memberCount} />
      <CommunityValues />
      <AshleyTerminal />
      <FinalCTA />
    </>
  )
}
