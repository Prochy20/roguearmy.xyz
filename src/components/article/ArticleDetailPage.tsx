import { StatRibbon } from '@/components/ui/StatRibbon'
import { BLOG_ROOT } from '@/components/ui/trail-roots'
import { ReaderPageShell } from '@/components/content/reader/ReaderPageShell'
import { ReaderHeroFrame } from '@/components/content/reader/ReaderHeroFrame'
import { ReaderTitleBlock } from '@/components/content/reader/ReaderTitleBlock'
import { ReaderDocStrip } from '@/components/content/reader/ReaderDocStrip'
import { ReaderTldrCard } from '@/components/content/reader/ReaderTldrCard'
import { ReaderToc } from '@/components/content/reader/ReaderToc'
import { ReaderReadingWidget } from '@/components/content/reader/ReaderReadingWidget'
import { ReaderShortcuts } from '@/components/content/reader/ReaderShortcuts'
import { ReaderBody } from '@/components/content/reader/ReaderBody'
import {
  ReaderDetailFooter,
  type ReaderFooterNeighbor,
} from '@/components/content/reader/ReaderDetailFooter'
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton'
import { ShareButton } from '@/components/article/ShareButton'
import { FeaturedArticles } from '@/components/article/FeaturedArticles'
import {
  type Article,
  type SeriesNavigation,
  tintToAccent,
  formatArticleDate,
  getArticleUrl,
} from '@/lib/articles'
import type { ReaderBodySource } from '@/components/content/reader/ReaderBody'
import type { ReaderSection } from '@/lib/content/markdown-sections'
import type { ArticleProgress } from '@/lib/progress.server'

interface ArticleDetailPageProps {
  article: Article
  /** Discriminated body — markdown for wiki, lexical for payload. */
  bodySource: ReaderBodySource
  /** Pre-enumerated H2 sections (server-derived for markdown, AST-derived for lexical). */
  sections: ReaderSection[]
  /** Approximate body word count — drives doc strip + reading widget. */
  wordCount: number
  /** Bulleted TL;DR pulled from `article.highlights[].text`. Empty array hides the card. */
  highlights: readonly string[]
  /** Editor-curated + algorithmic "you might also like" deck (3 items). */
  featuredArticles: Article[]
  featuredProgress?: Record<string, ArticleProgress>
  /** Series context — drives the footer back link + prev/next siblings. */
  seriesNavigation: SeriesNavigation | null
  /** True when a member session is active — shows bookmark; gates progress tracker upstream. */
  isAuthenticated: boolean
}

/**
 * Reader for a single blog article. Composes the shared reader kit at
 * `components/content/reader/*` with article-specific slot content (bookmark
 * + share actions, FeaturedArticles deck, topic back link + series prev/next).
 *
 * Composition mirrors the briefing detail page so both surfaces read as one
 * site:
 *   breadcrumb · stat ribbon · title + perex + bookmark/share · hero frame
 *      ↓
 *   [ToC]   doc-strip · TL;DR · prose body · featured   [reading widget]
 *      ↓
 *   footer (back to topic + prev/next series article)
 */
export function ArticleDetailPage({
  article,
  bodySource,
  sections,
  wordCount,
  highlights,
  featuredArticles,
  featuredProgress,
  seriesNavigation,
  isAuthenticated,
}: ArticleDetailPageProps) {
  const accent = tintToAccent(article.topic.tint)
  const readMinutes = Math.max(1, article.readingTime)
  const publishedShort = formatArticleDate(article.publishedAt)
  // Doc identifiers — `topicCode` is the topic slug (used in body's DOC
  // strip) and `articleCode` is the article slug (used in trail leaf so the
  // leaf is unique per URL, not per topic). The trail leaf gets a length
  // budget because article slugs can grow long; the body strip has more
  // visual room and can carry the untruncated code.
  const topicCode = article.topic.slug.toUpperCase()
  const articleCode = article.slug.toUpperCase()
  const TRAIL_LEAF_MAX = 18
  const trailLeafCode =
    articleCode.length > TRAIL_LEAF_MAX
      ? `${articleCode.slice(0, TRAIL_LEAF_MAX - 1)}…`
      : articleCode

  // Chrome stays RGA-neutral, so the leaf only takes cyan for cyan-accent
  // articles (Ashley/analytics flavor). Orange/red article accents stay in
  // the body — they don't reach the ribbon.
  const leafAccent: 'cyan' | 'green' | undefined =
    accent === 'cyan' ? 'cyan' : accent === 'green' ? 'green' : undefined

  const stickyChrome = (
    <StatRibbon
      trail={[
        BLOG_ROOT,
        {
          label: article.topic.name,
          href: `/blog/${article.topic.slug}`,
        },
        { label: `${trailLeafCode}.md`, accent: leafAccent },
      ]}
      fields={[
        {
          label: 'READ',
          value: `${readMinutes} MIN`,
        },
        {
          label: 'PUBLISHED',
          value: publishedShort,
        },
      ]}
      pill={
        article.visibility === 'members_only'
          ? { text: 'MEMBERS', mode: 'warn' }
          : { text: 'PUBLIC', mode: 'info' }
      }
    />
  )

  const header = (
    <>
      <ReaderTitleBlock
        accent={accent}
        title={article.title}
        perex={article.perex}
        dateLabel={publishedShort.toUpperCase()}
        readMinutes={readMinutes}
        actions={
          <div className="flex items-center gap-3">
            <ShareButton articleSlug={article.slug} size="md" />
            {isAuthenticated && (
              <>
                <span aria-hidden className="h-3 w-px bg-text-muted/30" />
                <BookmarkButton targetType="article" targetId={article.id} size="md" />
              </>
            )}
          </div>
        }
      />
      {article.heroImage?.url && (
        <ReaderHeroFrame
          accent={accent}
          thumbnailUrl={article.heroImage.url}
          kindLabel={article.topic.name.toUpperCase()}
          periodLabel={publishedShort.toUpperCase()}
        />
      )}
    </>
  )

  const body = (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ReaderDocStrip
        accent={accent}
        fields={[
          { label: 'DOC', value: topicCode, tone: 'accent' },
          {
            label: 'CLASS',
            value: article.topic.name.toUpperCase(),
            tone: 'muted',
          },
          {
            label: 'WORDS',
            value: wordCount.toLocaleString('en-US'),
            tone: 'secondary',
          },
          {
            label: 'PUBLISHED',
            value: publishedShort.toUpperCase(),
            tone: 'secondary',
          },
        ]}
      />
      <ReaderTldrCard accent={accent} highlights={highlights} />
      <article className="reader-body min-w-0">
        <ReaderBody accent={accent} source={bodySource} sections={sections} />
      </article>
      {featuredArticles.length > 0 && (
        <FeaturedArticles
          articles={featuredArticles}
          progress={featuredProgress}
        />
      )}
    </div>
  )

  const seriesFooter = seriesNavigation
    ? {
        prev: seriesNavigation.previous
          ? articleToNeighbor(seriesNavigation.previous)
          : null,
        next: seriesNavigation.next
          ? articleToNeighbor(seriesNavigation.next)
          : null,
      }
    : { prev: null, next: null }

  return (
    <ReaderPageShell
      accent={accent}
      stickyChrome={stickyChrome}
      header={header}
      toc={
        sections.length > 0 ? (
          <ReaderToc accent={accent} sections={sections} />
        ) : null
      }
      body={body}
      reading={
        <div className="flex flex-col gap-5">
          <ReaderReadingWidget accent={accent} wordCount={wordCount} />
          <ReaderShortcuts accent={accent} />
        </div>
      }
      footer={
        <ReaderDetailFooter
          accent={accent}
          backHref={`/blog/${article.topic.slug}`}
          backLabel={article.topic.name.toUpperCase()}
          backValue={publishedShort.toUpperCase()}
          prev={seriesFooter.prev}
          next={seriesFooter.next}
        />
      }
    />
  )
}

/**
 * Adapt an Article to the reader footer's generic neighbor shape.
 * Label = topic name uppercased, sublabel = publish date.
 */
function articleToNeighbor(article: Article): ReaderFooterNeighbor {
  return {
    href: getArticleUrl(article),
    label: article.topic.name.toUpperCase(),
    sublabel: formatArticleDate(article.publishedAt).toUpperCase(),
  }
}
