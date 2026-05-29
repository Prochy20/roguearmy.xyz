'use client'

import { useMemo } from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { Eye, RefreshCw } from 'lucide-react'
import type { Article as PayloadArticle } from '@/payload-types'
import {
  type Article,
  type SeriesNavigation as SeriesNavType,
  transformPayloadArticle,
} from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { extractHeadingsFromLexical } from '@/lib/toc'
import { ArticleDetailPage } from '@/components/article/ArticleDetailPage'

interface ArticlePageClientProps {
  initialArticle: Article
  rawArticle: PayloadArticle
  seriesNavigation: SeriesNavType | null
  seriesProgress?: Record<string, ArticleProgress>
  featuredArticles: Article[]
  featuredProgress?: Record<string, ArticleProgress>
}

/**
 * Payload Live Preview wrapper for the article detail page. Subscribes to
 * the admin panel's live-update channel via `useLivePreview` and re-renders
 * the new shared reader shell as the editor types.
 *
 * Wiki articles can't be live-previewed (they're authored in Outline, not
 * Payload), so this path only handles `payload` content sources — the body
 * source is hardcoded to `lexical`. The route file routes wiki articles
 * through the server-rendered ArticleDetailPage instead.
 *
 * `ReadProgressTracker` is intentionally omitted in preview mode to avoid
 * phantom saves while editing.
 */
export function ArticlePageClient({
  initialArticle,
  rawArticle,
  seriesNavigation,
  seriesProgress: _seriesProgress,
  featuredArticles,
  featuredProgress,
}: ArticlePageClientProps) {
  // Use browser origin for live preview — works in any environment since the
  // admin panel and frontend share a domain.
  const serverURL = typeof window !== 'undefined' ? window.location.origin : ''

  const { data: liveData, isLoading } = useLivePreview<PayloadArticle>({
    initialData: rawArticle,
    serverURL,
    depth: 2,
  })

  const article = useMemo(() => {
    return transformPayloadArticle(liveData, initialArticle.series)
  }, [liveData, initialArticle.series])

  // Headings re-extract whenever Lexical content changes so the ToC tracks
  // the editor in real time.
  const sections = useMemo(() => {
    if (article.contentSource.type !== 'payload') return []
    const headings = extractHeadingsFromLexical(article.contentSource.content?.content)
    return headings.map((h, i) => ({
      num: i + 1,
      numLabel: String(i + 1).padStart(2, '0'),
      text: h.text,
      id: h.id,
    }))
  }, [article.contentSource])

  const wordCount = useMemo(() => {
    return article.readingTime * 200
  }, [article.readingTime])

  const highlights = useMemo(() => {
    return Array.isArray(liveData.highlights)
      ? liveData.highlights.map((h) => h.text).filter(Boolean)
      : []
  }, [liveData.highlights])

  if (article.contentSource.type !== 'payload' || !article.contentSource.content?.content) {
    return null
  }

  return (
    <>
      {/* Preview mode banner — replaces navigation. */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-md border-b border-rga-cyan/50">
        <div className="h-full flex items-center justify-center px-6">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-rga-cyan" />
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-rga-cyan">Preview Mode</p>
              <span className="text-rga-cyan/50">—</span>
              <p className="text-sm text-text-secondary">Changes sync in real-time</p>
            </div>
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-rga-cyan animate-spin ml-2" />
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-rga-cyan to-transparent" />
      </div>

      <ArticleDetailPage
        article={article}
        bodySource={{
          type: 'lexical',
          data: article.contentSource.content.content,
        }}
        sections={sections}
        wordCount={wordCount}
        highlights={highlights}
        featuredArticles={featuredArticles}
        featuredProgress={featuredProgress}
        seriesNavigation={seriesNavigation}
        isAuthenticated={false}
      />
    </>
  )
}
