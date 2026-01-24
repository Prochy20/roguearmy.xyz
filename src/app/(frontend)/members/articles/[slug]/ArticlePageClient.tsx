'use client'

import { useMemo } from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { Eye, RefreshCw } from 'lucide-react'
import type { Article as PayloadArticle } from '@/payload-types'
import {
  type Article,
  type SeriesNavigation as SeriesNavType,
  getTintClasses,
  formatArticleDate,
  transformPayloadArticle,
} from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { extractHeadingsFromLexical } from '@/lib/toc'
import { cn } from '@/lib/utils'
import { ArticleHero } from './ArticleHero'
import { ArticleWithTOC } from './ArticleWithTOC'
import { ReadingStatus } from './ReadingStatus'
import { SeriesNavigation } from './SeriesNavigation'
import { FeaturedArticles } from '@/components/members/FeaturedArticles'

interface ArticlePageClientProps {
  initialArticle: Article
  rawArticle: PayloadArticle
  slug: string
  seriesNavigation: SeriesNavType | null
  seriesProgress?: Record<string, ArticleProgress>
  featuredArticles?: Article[]
  featuredProgress?: Record<string, ArticleProgress>
}

export function ArticlePageClient({
  initialArticle,
  rawArticle,
  slug,
  seriesNavigation,
  seriesProgress,
  featuredArticles,
  featuredProgress,
}: ArticlePageClientProps) {
  // Use browser origin for live preview - this ensures it works in any environment
  // since the admin panel and frontend are on the same domain
  const serverURL = typeof window !== 'undefined' ? window.location.origin : ''

  // Live preview hook - syncs with Payload admin panel
  const { data: liveData, isLoading } = useLivePreview<PayloadArticle>({
    initialData: rawArticle,
    serverURL,
    depth: 2,
  })

  // Transform live data to Article type, preserving series info
  const article = useMemo(() => {
    return transformPayloadArticle(liveData, initialArticle.series)
  }, [liveData, initialArticle.series])

  // Recalculate headings when content changes
  const headings = useMemo(() => {
    if (article.contentSource.type === 'payload') {
      return extractHeadingsFromLexical(article.contentSource.content?.content)
    }
    return []
  }, [article.contentSource])

  // Get tint classes for styling
  const tint = getTintClasses(article.topic.tint)

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Preview mode banner - replaces navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-md border-b border-rga-cyan/50">
        <div className="h-full flex items-center justify-center px-6">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-rga-cyan" />
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-rga-cyan">Preview Mode</p>
              <span className="text-rga-cyan/50">—</span>
              <p className="text-sm text-rga-gray">Changes sync in real-time</p>
            </div>
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-rga-cyan animate-spin ml-2" />
            )}
          </div>
        </div>

        {/* Gradient line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rga-cyan to-transparent" />
      </div>

      {/* Reading status bar - bottom of screen */}
      <ReadingStatus readingTime={article.readingTime} />

      {/* Note: ReadProgressTracker is intentionally omitted in preview mode
          to avoid phantom saves while editing */}

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
              initialHeadings={headings}
            >
              {/* Series navigation - only show if article is part of a series */}
              {seriesNavigation && (
                <SeriesNavigation
                  navigation={seriesNavigation}
                  seriesProgress={seriesProgress}
                />
              )}

              {/* Featured articles - "You might also like" section (only show with exactly 3) */}
              {featuredArticles && featuredArticles.length === 3 && (
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
