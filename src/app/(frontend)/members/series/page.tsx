import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getAllSeries, getSeriesWithProgress } from '@/lib/series.server'
import { SeriesGrid } from '@/components/members/SeriesGrid'
import { CyberButton } from '@/components/members/CyberButton'
import { HeroGlitch } from '@/components/effects'

async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export default async function SeriesListingPage() {
  const memberId = await getMemberId()

  // Get series with progress if member is authenticated, otherwise just counts
  const series = memberId
    ? await getSeriesWithProgress(memberId)
    : await getAllSeries()

  return (
    <div className="min-h-screen bg-void">
      {/* Simple header with back link */}
      <header className="sticky top-0 z-50 border-b border-rga-green/20 bg-void/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link
              href="/members"
              className="text-rga-green font-display text-xl tracking-wider hover:text-glow-green transition-all"
            >
              RGA
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <CyberButton
            href="/members"
            iconLeft={<ArrowLeft className="w-4 h-4" />}
            color="gray"
            className="mb-4"
          >
            Back to articles
          </CyberButton>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3">
            <HeroGlitch
              minInterval={4}
              maxInterval={10}
              intensity={8}
              dataCorruption
              scanlines
            >
              ARTICLE SERIES
            </HeroGlitch>
          </h1>
          <p className="text-rga-gray max-w-2xl">
            Deep-dive guide collections organized by topic. Work through each
            series at your own pace and track your progress.
          </p>
        </div>

        {/* Series grid */}
        <SeriesGrid series={series} />
      </main>
    </div>
  )
}
