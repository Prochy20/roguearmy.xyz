import { getPayload } from 'payload'
import config from '@payload-config'
import type { Game } from '@/payload-types'
import {
  Hero,
  GamesShowcase,
  StatsTicker,
  CommunityValues,
  AshleyTerminal,
  FinalCTA,
} from "@/components/home"

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
