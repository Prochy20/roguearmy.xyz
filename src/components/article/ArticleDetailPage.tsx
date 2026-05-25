import { StatRibbon } from '@/components/ui/StatRibbon'
import { ReaderPageShell } from '@/components/content/reader/ReaderPageShell'
import { ReaderBreadcrumb } from '@/components/content/reader/ReaderBreadcrumb'
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
import { BookmarkButton } from '@/components/article/BookmarkButton'
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
  const designator = article.topic.slug.toUpperCase()

  // StatRibbon's local accent vocabulary is { green, cyan, mod, magenta } —
  // map the reader accent onto its closest sibling for the ribbon's numeric
  // fields.
  const ribbonFieldAccent: 'cyan' | 'mod' | 'green' =
    accent === 'cyan'
      ? 'cyan'
      : accent === 'orange' || accent === 'red'
        ? 'mod'
        : 'green'

  const header = (
    <>
      <StatRibbon
        prefix={`// ${article.topic.name.toUpperCase()} · ARTICLE`}
        fields={[
          {
            label: 'TOPIC',
            value: article.topic.name.toUpperCase(),
            accent: ribbonFieldAccent,
          },
          {
            label: 'READ',
            value: `${readMinutes} MIN`,
            accent: ribbonFieldAccent,
          },
          {
            label: 'PUBLISHED',
            value: publishedShort,
            accent: 'green',
          },
        ]}
        pill={
          article.visibility === 'members_only'
            ? { text: 'MEMBERS', ok: true, accent: 'magenta' }
            : { text: 'PUBLIC', ok: true, accent: 'green' }
        }
      />
      <ReaderBreadcrumb
        accent={accent}
        trail={[
          { href: '/blog', label: 'BLOG' },
          { href: `/blog/${article.topic.slug}`, label: article.topic.name.toUpperCase() },
        ]}
        designator={designator}
      />
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
                <BookmarkButton articleId={article.id} size="md" />
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
          { label: 'DOC', value: designator, tone: 'accent' },
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
