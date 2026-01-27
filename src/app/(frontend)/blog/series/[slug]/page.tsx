import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getSeriesBySlug, getAllSeriesSlugs } from '@/lib/series.server'
import { getMemberProgressMap } from '@/lib/progress.server'
import { SeriesHero } from '@/components/members/SeriesHero'
import { BlogSeriesArticleCard } from '@/components/blog/BlogSeriesArticleCard'

interface SeriesDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getOptionalMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export async function generateStaticParams() {
  const slugs = await getAllSeriesSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { slug } = await params
  const series = await getSeriesBySlug(slug)

  if (!series) {
    notFound()
  }

  const memberId = await getOptionalMemberId()

  // Get progress for all articles in this series (only for authenticated users)
  const articleIds = series.articles.map((a) => a.id)
  const progressMap = memberId
    ? await getMemberProgressMap(memberId, articleIds)
    : new Map()

  // Calculate completion count
  let completedCount = 0
  for (const progress of progressMap.values()) {
    if (progress.completed) {
      completedCount++
    }
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Hero section */}
      <SeriesHero
        name={series.name}
        description={series.description}
        heroImage={series.heroImage}
        articleCount={series.articles.length}
        completedCount={memberId ? completedCount : undefined}
      />

      {/* Article list */}
      <main className="relative z-10 bg-void">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            {series.articles.map((article, index) => (
              <BlogSeriesArticleCard
                key={article.id}
                article={article}
                order={index + 1}
                progress={progressMap.get(article.id) || null}
                index={index}
                isAuthenticated={!!memberId}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
