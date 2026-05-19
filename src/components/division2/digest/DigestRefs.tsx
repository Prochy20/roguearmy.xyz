import { CyberTag } from '@/components/ui/CyberCorners'
import { formatDayShort } from '@/lib/division2/format'
import type { DigestArticle } from '@/lib/division2/digest.server'

interface DigestRefsProps {
  articles: DigestArticle[]
}

/**
 * Always-expanded numbered citation list rendered below the briefing body.
 * Each entry has an `id="ref-N"` anchor matching the in-body `<sup>` ordinals
 * so clicking a superscript scrolls the reader to the source.
 *
 * Ordering matches `articles[]` from Ashley (relevance desc), which is the
 * same order used by `buildCitationIndex`.
 */
export function DigestRefs({ articles }: DigestRefsProps) {
  if (articles.length === 0) return null
  return (
    <ol className="flex flex-col gap-3">
      {articles.map((article, i) => {
        const ordinal = i + 1
        const publishedShort = safePublishedShort(article.publishedAt)
        return (
          <li
            key={article.id}
            id={`ref-${ordinal}`}
            className="flex flex-col gap-2 border border-text-muted/15 bg-[rgba(0,0,0,0.4)] p-4 sm:flex-row sm:items-start sm:gap-5"
          >
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:pt-1">
              <span className="font-mono text-sm tracking-[0.2em] text-rga-mod">
                [{ordinal.toString().padStart(2, '0')}]
              </span>
              {article.source && (
                <CyberTag
                  className="text-[8px]"
                  color={sourceColor(article.source)}
                >
                  {article.source}
                </CyberTag>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words text-base font-medium text-text-primary transition-colors hover:text-rga-cyan sm:text-lg"
                >
                  {article.title}
                </a>
              ) : (
                <span className="break-words text-base font-medium text-text-primary sm:text-lg">
                  {article.title}
                </span>
              )}

              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted">
                {article.authors.length > 0 && (
                  <>
                    <span>// {article.authors.join(' · ')}</span>
                    <span aria-hidden className="h-2 w-px bg-text-muted/30" />
                  </>
                )}
                {publishedShort && <span>{publishedShort}</span>}
                {article.contentType && (
                  <>
                    <span aria-hidden className="h-2 w-px bg-text-muted/30" />
                    <span>{article.contentType.toUpperCase()}</span>
                  </>
                )}
              </div>

            </div>
          </li>
        )
      })}
    </ol>
  )
}

function safePublishedShort(iso: string): string | null {
  if (!iso) return null
  const day = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  return formatDayShort(day)
}

function sourceColor(source: string): 'source-youtube' | 'source-reddit' | 'source-ubisoft' | 'gray' {
  const s = source.toUpperCase()
  if (s === 'YOUTUBE') return 'source-youtube'
  if (s === 'REDDIT') return 'source-reddit'
  if (s === 'UBISOFT') return 'source-ubisoft'
  return 'gray'
}
