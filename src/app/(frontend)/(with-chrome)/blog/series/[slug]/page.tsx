import { notFound } from 'next/navigation'
import { getActiveMemberId } from '@/lib/auth/session.server'
import { getSeriesBySlug, getAllSeriesSlugs } from '@/lib/series.server'
import { getMemberProgressMap } from '@/lib/progress.server'
import { SeriesHero } from '@/components/article/SeriesHero'
import { SeriesArticleCard } from '@/components/article/SeriesArticleCard'

interface SeriesDetailPageProps {
  params: Promise<{ slug: string }>
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

  const memberId = await getActiveMemberId()

  const articleIds = series.articles.map((a) => a.id)
  const progressMap = memberId
    ? await getMemberProgressMap(memberId, articleIds)
    : new Map()

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
              <SeriesArticleCard
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
