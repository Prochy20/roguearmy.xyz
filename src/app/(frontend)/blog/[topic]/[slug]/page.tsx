import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTintClasses, formatArticleDate, getArticleUrl } from '@/lib/articles'
import {
  getArticleByTopicAndSlug,
  getArticleByTopicAndSlugWithDraft,
  getSeriesNavigation,
  getFeaturedArticles,
  getAllArticleParams,
} from '@/lib/articles.server'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getMemberProgressMap } from '@/lib/progress.server'
import { extractHeadingsFromLexical } from '@/lib/toc'
import { ReadProgressTracker } from '@/components/members/ReadProgressTracker'
import { cn } from '@/lib/utils'
import { BlogArticleHero } from './BlogArticleHero'
import { ArticleWithTOC } from './components/ArticleWithTOC'
import { ArticlePageClient } from './components/ArticlePageClient'
import { ReadingStatus } from './components/ReadingStatus'
import { BlogSeriesNavigation } from './BlogSeriesNavigation'
import { FeaturedArticles } from '@/components/members/FeaturedArticles'
import { ArticleTeaserView } from '@/components/blog/ArticleTeaserView'

interface ArticlePageProps {
  params: Promise<{ topic: string; slug: string }>
  searchParams: Promise<{ preview?: string }>
}

const siteUrl = 'https://roguearmy.xyz'

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { topic, slug } = await params
  const article = await getArticleByTopicAndSlug(topic, slug)

  if (!article) {
    return {
      title: 'Article Not Found | Rogue Army',
    }
  }

  const articleUrl = `${siteUrl}${getArticleUrl(article)}`

  return {
    title: `${article.title} | Rogue Army`,
    description: article.perex,
    openGraph: {
      type: 'article',
      url: articleUrl,
      title: article.title,
      description: article.perex,
      siteName: 'Rogue Army',
      images: [
        {
          url: article.heroImage.url,
          width: 1200,
          height: 630,
          alt: article.heroImage.alt,
        },
      ],
      publishedTime: article.publishedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.perex,
      images: [article.heroImage.url],
    },
  }
}

async function getActiveMemberId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  if (!session) return null

  // Verify member is active
  const payload = await getPayload({ config })
  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member || member.status !== 'active') {
      return null
    }

    return session.memberId
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  const params = await getAllArticleParams()
  return params
}

export default async function BlogArticlePage({ params, searchParams }: ArticlePageProps) {
  const { topic, slug } = await params
  const { preview } = await searchParams

  // Preview mode is used by Payload Live Preview (iframe with postMessage)
  const isPreview = preview === 'true'

  // Step 1: Parallel fetch article + memberId (independent operations)
  const [{ article, rawArticle }, memberId] = await Promise.all([
    getArticleByTopicAndSlugWithDraft(topic, slug, isPreview),
    getActiveMemberId(),
  ])

  if (!article || !rawArticle) {
    notFound()
  }

  // Check if user can view full content
  // In preview mode (Payload Live Preview iframe), allow full content for CMS editing
  // This is secure because Live Preview only works within authenticated Payload admin
  const canViewFullContent =
    isPreview || // Preview mode (Live Preview iframe or draft mode) can always view
    article.visibility === 'public' ||
    (article.visibility === 'members_only' && memberId !== null)

  // If can't view full content, show teaser view
  if (!canViewFullContent) {
    return <ArticleTeaserView article={article} />
  }

  const tint = getTintClasses(article.topic.tint)

  // Step 2: Series navigation (depends on article)
  const seriesNavigation = await getSeriesNavigation(article.id)

  // Extract curated article IDs from relatedArticles field
  const curatedArticleIds = (rawArticle.relatedArticles || []).map((a) =>
    typeof a === 'string' ? a : a.id
  )

  // Collect all article IDs that need progress (for parallel fetch below)
  const seriesArticleIds = seriesNavigation?.articleIds || []

  // Step 3: Parallel fetch featured articles + progress (independent after series)
  const [featuredArticles, progressMap] = await Promise.all([
    getFeaturedArticles(
      article.id,
      article.topic.id,
      article.games.map((g) => g.id),
      curatedArticleIds,
      seriesArticleIds
    ),
    // Defer progress fetch - we'll fetch with all IDs after we know featured articles
    Promise.resolve(undefined as Map<string, import('@/lib/progress.server').ArticleProgress> | undefined),
  ])

  // Now fetch progress for all articles if authenticated
  const progressArticleIds = [
    ...seriesArticleIds,
    ...featuredArticles.map((a) => a.id),
  ]

  const finalProgressMap = memberId && progressArticleIds.length > 0
    ? await getMemberProgressMap(memberId, progressArticleIds)
    : progressMap

  // Convert Map to serializable object for client component
  const seriesProgress = finalProgressMap && seriesNavigation
    ? Object.fromEntries(
        seriesNavigation.articleIds
          .filter((id) => finalProgressMap.has(id))
          .map((id) => [id, finalProgressMap.get(id)!])
      )
    : undefined

  const featuredProgress = finalProgressMap && featuredArticles.length > 0
    ? Object.fromEntries(
        featuredArticles
          .filter((a) => finalProgressMap.has(a.id))
          .map((a) => [a.id, finalProgressMap.get(a.id)!])
      )
    : undefined

  // Extract headings for TOC (server-side for Payload content)
  const initialHeadings =
    article.contentSource.type === 'payload'
      ? extractHeadingsFromLexical(article.contentSource.content?.content)
      : [] // Wiki content headings extracted client-side

  // Preview mode: use client component with live preview hook
  if (isPreview) {
    return (
      <ArticlePageClient
        initialArticle={article}
        rawArticle={rawArticle}
        slug={slug}
        seriesNavigation={seriesNavigation}
        seriesProgress={seriesProgress}
        featuredArticles={featuredArticles}
        featuredProgress={featuredProgress}
      />
    )
  }

  // Normal mode: server-rendered output
  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Reading status bar - bottom of screen */}
      <ReadingStatus readingTime={article.readingTime} />

      {/* Progress tracker - only for authenticated members */}
      {memberId && <ReadProgressTracker articleId={article.id} />}

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
      <BlogArticleHero
        articleId={article.id}
        slug={slug}
        title={article.title}
        heroImage={article.heroImage}
        topic={article.topic}
        tint={tint}
        publishedAt={article.publishedAt}
        readingTime={article.readingTime}
        contentType={article.contentType}
        games={article.games}
        series={article.series}
        isAuthenticated={!!memberId}
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
                <BlogSeriesNavigation
                  navigation={seriesNavigation}
                  seriesProgress={seriesProgress}
                  isAuthenticated={!!memberId}
                />
              )}

              {/* Featured articles - "You might also like" section (only show with exactly 3) */}
              {featuredArticles.length === 3 && (
                <FeaturedArticles
                  articles={featuredArticles}
                  progress={featuredProgress}
                />
              )}
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
