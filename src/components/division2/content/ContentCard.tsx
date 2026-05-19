import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { formatTimeago } from '@/lib/division2/content.format'
import type { ContentArticle, ContentSource } from '@/lib/division2/content.server'

/**
 * Static per-source class lookups — Tailwind cannot generate from
 * interpolated class names. One row per source covers stripe, chip text,
 * chip dot, and hover-glow utility.
 */
const SOURCE_CARD_CLASSES: Record<
  ContentSource,
  {
    stripe: string
    chipText: string
    chipDot: string
    hoverGlow: string
    label: string
  }
> = {
  YOUTUBE: {
    stripe: 'bg-source-youtube',
    chipText: 'text-source-youtube',
    chipDot: 'bg-source-youtube',
    hoverGlow: 'group-hover:shadow-[0_0_20px_var(--color-glow-source-youtube)]',
    label: 'YOUTUBE',
  },
  REDDIT: {
    stripe: 'bg-source-reddit',
    chipText: 'text-source-reddit',
    chipDot: 'bg-source-reddit',
    hoverGlow: 'group-hover:shadow-[0_0_20px_var(--color-glow-source-reddit)]',
    label: 'REDDIT',
  },
  UBISOFT: {
    stripe: 'bg-source-ubisoft',
    chipText: 'text-source-ubisoft',
    chipDot: 'bg-source-ubisoft',
    hoverGlow: 'group-hover:shadow-[0_0_20px_var(--color-glow-source-ubisoft)]',
    label: 'UBISOFT',
  },
}

/** Now-time threaded through props so timeago is stable across hydration. */
interface ContentCardProps {
  article: ContentArticle
  now: number
}

/**
 * Single-row card in the social-feed style. On `sm+` screens, the
 * thumbnail sits on the left (fixed 16:9 in a 240px frame) and content
 * occupies the rest. On mobile the layout stacks (thumb top, content
 * below) for one-thumb-readable touch targets.
 *
 * When `thumbnailUrl` is absent (typical Reddit text post), the thumb
 * slot collapses entirely and content expands to full row width — the
 * card becomes a clean text-headline strip without empty-image padding.
 *
 * The whole card is one `<a target="_blank">` — no nested clickable
 * elements, no JS click handler, the source URL is the only destination.
 */
export function ContentCard({ article, now }: ContentCardProps) {
  const cls = SOURCE_CARD_CLASSES[article.source]
  const summary = article.aiSummary || article.perex
  const author = article.authors[0]
  const timeago = formatTimeago(article.publishedAt, now)
  const contentType = article.contentType?.toUpperCase()
  const hasThumb = Boolean(article.thumbnailUrl)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-0 overflow-hidden border border-text-muted/15 bg-bg-elevated/60 transition-all hover:border-text-muted/40 sm:flex-row"
    >
      <div className={['absolute inset-x-0 top-0 h-[2px] z-10', cls.stripe].join(' ')} />

      {hasThumb && (
        <div className="relative w-full shrink-0 overflow-hidden bg-bg-surface sm:w-[240px] md:w-[280px]">
          <div className="aspect-16/9 w-full sm:aspect-auto sm:h-full sm:min-h-[140px]">
            <Image
              src={article.thumbnailUrl!}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 280px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              unoptimized={article.source === 'REDDIT'}
            />
          </div>
          {article.source === 'YOUTUBE' && (
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-void/0 transition-colors group-hover:bg-void/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-void/70 backdrop-blur-sm transition-transform group-hover:scale-110">
                <PlayIcon />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 pt-5 pb-4 sm:gap-3 sm:px-5 sm:pt-5 sm:pb-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
          <span aria-hidden className={['inline-block h-1.5 w-1.5 rounded-[1px]', cls.chipDot].join(' ')} />
          <span className={cls.chipText}>{cls.label}</span>
          {contentType && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">{contentType}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-[-0.005em] text-text-primary transition-colors group-hover:text-text-primary sm:text-xl md:text-[22px]">
          {article.title}
        </h3>

        {summary && (
          <p
            className={[
              'text-[15px] leading-relaxed text-text-secondary/90 sm:text-base',
              hasThumb ? 'line-clamp-2' : 'line-clamp-3',
            ].join(' ')}
          >
            {summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
          {author && <span className="max-w-[16rem] truncate">{author}</span>}
          {author && timeago && <span aria-hidden>·</span>}
          {timeago && <span>{timeago}</span>}
          <span
            aria-hidden
            className="ml-auto opacity-60 transition-opacity group-hover:opacity-100"
          >
            <ExternalLink size={12} strokeWidth={1.5} />
          </span>
        </div>
      </div>

      <div
        aria-hidden
        className={[
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          cls.hoverGlow,
        ].join(' ')}
      />
    </a>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-text-primary">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
