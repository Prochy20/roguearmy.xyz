import { getPayload } from 'payload'
import config from '@payload-config'
import type { Game } from '@/payload-types'
import { Hero } from "@/components/home/Hero"
import { GamesShowcase } from "@/components/home/GamesShowcase"
import { StatsTicker } from "@/components/home/StatsTicker"
import { CommunityValues } from "@/components/home/CommunityValues"
import { AshleyTerminal } from "@/components/home/AshleyTerminal"
import { FinalCTA } from "@/components/home/FinalCTA"

export default async function HomePage() {
  const payload = await getPayload({ config })
  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 1 })
  const games = (homepage.games as Game[]) ?? []

  return (
    <>
      <Hero />
      <GamesShowcase games={games} />
      <StatsTicker />
      <CommunityValues />
      <AshleyTerminal />
      <FinalCTA />
    </>
  )
}
