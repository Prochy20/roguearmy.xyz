import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { getTintClasses, formatArticleDate } from '@/lib/articles'
import {
  getArticleBySlug,
  getArticleBySlugWithDraft,
  getSeriesNavigation,
  getAllArticleSlugs,
} from '@/lib/articles.server'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getMemberProgressMap } from '@/lib/progress.server'
import { extractHeadingsFromLexical } from '@/lib/toc'
import { CyberButton } from '@/components/members/CyberButton'
import { ReadProgressTracker } from '@/components/members/ReadProgressTracker'
import { cn } from '@/lib/utils'
import { ArticleHero } from './ArticleHero'
import { ArticleWithTOC } from './ArticleWithTOC'
import { ArticlePageClient } from './ArticlePageClient'
import { BackToTop } from './BackToTop'
import { ReadingStatus } from './ReadingStatus'
import { SeriesNavigation } from './SeriesNavigation'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === 'true'

  // Use draft-aware fetch for preview mode
  const { article, rawArticle } = isPreview
    ? await getArticleBySlugWithDraft(slug, true)
    : { article: await getArticleBySlug(slug), rawArticle: null }

  if (!article) {
    notFound()
  }

  const tint = getTintClasses(article.topic.tint)
  const seriesNavigation = await getSeriesNavigation(article.id)

  // Get member's reading progress for series articles
  const memberId = await getMemberId()
  const seriesProgressMap =
    seriesNavigation && memberId
      ? await getMemberProgressMap(memberId, seriesNavigation.articleIds)
      : undefined

  // Convert Map to serializable object for client component
  const seriesProgress = seriesProgressMap
    ? Object.fromEntries(seriesProgressMap)
    : undefined

  // Extract headings for TOC (server-side for Payload content)
  const initialHeadings =
    article.contentSource.type === 'payload'
      ? extractHeadingsFromLexical(article.contentSource.content?.content)
      : [] // Wiki content headings extracted client-side

  // Preview mode: use client component with live preview hook
  if (isPreview && rawArticle) {
    return (
      <ArticlePageClient
        initialArticle={article}
        rawArticle={rawArticle}
        seriesNavigation={seriesNavigation}
        seriesProgress={seriesProgress}
      />
    )
  }

  // Normal mode: server-rendered output
  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Reading status bar - bottom of screen */}
      <ReadingStatus readingTime={article.readingTime} />

      {/* Progress tracker - persists reading progress to API */}
      <ReadProgressTracker articleId={article.id} />

      {/* Background atmospheric effects */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 100% 50% at 0% 0%, rgba(0,255,65,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 100% 100%, rgba(0,255,255,0.06) 0%, transparent 40%),
            radial-gradient(ellipse 60% 30% at 50% 50%, rgba(255,0,255,0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Hero Section - Full viewport */}
      <ArticleHero
        articleId={article.id}
        title={article.title}
        heroImage={article.heroImage}
        topic={article.topic}
        tint={tint}
        publishedAt={article.publishedAt}
        readingTime={article.readingTime}
        contentType={article.contentType}
        games={article.games}
        series={article.series}
      />

      {/* Content Section */}
      <main className="relative z-10">
        {/* Transition gradient from hero */}
        <div className="h-32 bg-gradient-to-b from-transparent to-void -mt-32 relative z-20" />

        {/* Article Body - Full width with internal rhythm */}
        <div className="bg-void relative">
          {/* Left accent line */}
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 hidden lg:block',
              'bg-gradient-to-b from-transparent via-current to-transparent opacity-20',
              tint.text
            )}
          />

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,720px)_1fr] gap-8 px-6 md:px-12 lg:px-0">
            {/* Left margin - empty spacer on large screens */}
            <div className="hidden lg:block" />

            {/* Center - Article content with fixed TOC */}
            <ArticleWithTOC
              contentSource={article.contentSource}
              initialHeadings={initialHeadings}
            >
              {/* Series navigation - only show if article is part of a series */}
              {seriesNavigation && (
                <SeriesNavigation
                  navigation={seriesNavigation}
                  seriesProgress={seriesProgress}
                />
              )}

              {/* Article footer */}
              <footer className="mt-20 pt-8 border-t border-rga-green/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CyberButton
                    href="/members"
                    iconLeft={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to all articles
                  </CyberButton>

                  <BackToTop />
                </div>
              </footer>
            </ArticleWithTOC>

            {/* Right margin - metadata on large screens */}
            <div className="hidden lg:block pt-12 pl-8">
              <div className="sticky top-24 space-y-8">
                {/* Mini metadata card */}
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Published
                    </span>
                    <p className="text-rga-gray mt-1">
                      {formatArticleDate(article.publishedAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Reading time
                    </span>
                    <p className="text-rga-gray mt-1">
                      {article.readingTime} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Topic
                    </span>
                    <p className={cn('mt-1', tint.text)}>
                      {article.topic.name}
                    </p>
                  </div>
                  {article.games.length > 0 && (
                    <div>
                      <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                        Games
                      </span>
                      <div className="mt-1 space-y-1">
                        {article.games.map((game) => (
                          <p key={game.id} className="text-rga-gray">
                            {game.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative element */}
                <div className="w-16 h-px bg-gradient-to-r from-rga-green/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom fade */}
      <div className="h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  )
}
