import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleUrl } from '@/lib/articles'
import {
  fetchWikiBody,
  getArticleByTopicAndSlug,
  getArticleByTopicAndSlugWithDraft,
  getSeriesNavigation,
  getFeaturedArticles,
  getAllArticleParams,
} from '@/lib/articles.server'
import { getActiveMemberId } from '@/lib/auth/session.server'
import { getMemberProgressMap } from '@/lib/progress.server'
import {
  transformReaderBody,
  type ReaderSection,
} from '@/lib/content/markdown-sections'
import { extractHeadingsFromLexical } from '@/lib/toc'
import { ReadProgressTracker } from '@/components/article/ReadProgressTracker'
import { ArticleTeaserView } from '@/components/article/ArticleTeaserView'
import { ArticleDetailPage } from '@/components/article/ArticleDetailPage'
import type { ReaderBodySource } from '@/components/content/reader/ReaderBody'
import { ArticlePageClient } from './components/ArticlePageClient'

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

export async function generateStaticParams() {
  const params = await getAllArticleParams()
  return params
}

export default async function BlogArticlePage({ params, searchParams }: ArticlePageProps) {
  const { topic, slug } = await params
  const { preview } = await searchParams

  // Preview mode is used by Payload Live Preview (iframe with postMessage).
  const isPreview = preview === 'true'

  const [{ article, rawArticle }, memberId] = await Promise.all([
    getArticleByTopicAndSlugWithDraft(topic, slug, isPreview),
    getActiveMemberId(),
  ])

  if (!article || !rawArticle) {
    notFound()
  }

  // Visibility gate — preview mode bypasses since it's authenticated by
  // Payload admin already.
  const canViewFullContent =
    isPreview ||
    article.visibility === 'public' ||
    (article.visibility === 'members_only' && memberId !== null)

  if (!canViewFullContent) {
    return <ArticleTeaserView article={article} />
  }

  // Fire the wiki fetch concurrently with the series/featured pipeline —
  // it has no dependency on either. Cuts ~1 round trip off the cold-cache
  // critical path for wiki articles. Resolved later, just before building
  // bodySource. Non-wiki articles get a fast resolved-null sentinel.
  const wikiBodyPromise =
    article.contentSource.type === 'wiki' && article.contentSource.outlineDocumentId
      ? fetchWikiBody(article.contentSource.outlineDocumentId)
      : Promise.resolve(null)

  // Series navigation (depends on article id).
  const seriesNavigation = await getSeriesNavigation(article.id)

  const curatedArticleIds = (rawArticle.relatedArticles || []).map((a) =>
    typeof a === 'string' ? a : a.id,
  )
  const seriesArticleIds = seriesNavigation?.articleIds || []

  const featuredArticles = await getFeaturedArticles(
    article.id,
    article.topic.id,
    article.games.map((g) => g.id),
    curatedArticleIds,
    seriesArticleIds,
  )

  const progressArticleIds = [
    ...seriesArticleIds,
    ...featuredArticles.map((a) => a.id),
  ]
  const finalProgressMap =
    memberId && progressArticleIds.length > 0
      ? await getMemberProgressMap(memberId, progressArticleIds)
      : undefined

  const seriesProgress =
    finalProgressMap && seriesNavigation
      ? Object.fromEntries(
          seriesNavigation.articleIds
            .filter((id) => finalProgressMap.has(id))
            .map((id) => [id, finalProgressMap.get(id)!]),
        )
      : undefined

  const featuredProgress =
    finalProgressMap && featuredArticles.length > 0
      ? Object.fromEntries(
          featuredArticles
            .filter((a) => finalProgressMap.has(a.id))
            .map((a) => [a.id, finalProgressMap.get(a.id)!]),
        )
      : undefined

  const highlights = Array.isArray(rawArticle.highlights)
    ? rawArticle.highlights.map((h) => h.text).filter((t): t is string => !!t)
    : []

  // Preview mode uses the client wrapper so live edits sync into the view.
  if (isPreview) {
    return (
      <ArticlePageClient
        initialArticle={article}
        rawArticle={rawArticle}
        seriesNavigation={seriesNavigation}
        seriesProgress={seriesProgress}
        featuredArticles={featuredArticles}
        featuredProgress={featuredProgress}
      />
    )
  }

  // Normal mode: build body source + sections server-side, render the shared
  // reader shell.
  let bodySource: ReaderBodySource
  let sections: ReaderSection[]
  let wordCount: number

  if (article.contentSource.type === 'wiki' && article.contentSource.outlineDocumentId) {
    const wiki = await wikiBodyPromise
    if (!wiki || !wiki.ok) {
      // Outline fetch failed — fall back to the teaser-style view so the
      // reader sees something other than an empty shell.
      return <ArticleTeaserView article={article} />
    }
    const transformed = transformReaderBody(wiki.data.markdown)
    bodySource = { type: 'markdown', content: transformed.transformed }
    sections = transformed.sections
    wordCount = transformed.wordCount
  } else if (article.contentSource.type === 'payload' && article.contentSource.content?.content) {
    const lexicalData = article.contentSource.content.content
    bodySource = { type: 'lexical', data: lexicalData }
    const headings = extractHeadingsFromLexical(lexicalData)
    sections = headings.map((h, i) => ({
      num: i + 1,
      numLabel: String(i + 1).padStart(2, '0'),
      text: h.text,
      id: h.id,
    }))
    // Approximate from reading time (200 wpm). Real word count would require
    // walking the Lexical AST; the estimate is close enough for the doc strip
    // and the reading widget's progress math.
    wordCount = Math.max(1, article.readingTime) * 200
  } else {
    notFound()
  }

  return (
    <>
      {memberId && <ReadProgressTracker articleId={article.id} />}
      <ArticleDetailPage
        article={article}
        bodySource={bodySource}
        sections={sections}
        wordCount={wordCount}
        highlights={highlights}
        featuredArticles={featuredArticles}
        featuredProgress={featuredProgress}
        seriesNavigation={seriesNavigation}
        isAuthenticated={!!memberId}
      />
    </>
  )
}
