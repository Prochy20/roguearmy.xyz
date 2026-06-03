import Image from 'next/image'
import { Star } from 'lucide-react'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { formatTimeago } from '@/lib/division2/content.format'
import type { ContentArticle, ContentSource } from '@/lib/division2/content.server'

/**
 * Per-source static class maps. Tailwind cannot resolve interpolated class
 * names, so each source declares its own row of statically-analyzable
 * classes. One row per source covers: stripe, chip text, thumbnail frame
 * border + corner ticks, hover glow, designator prefix, CyberCorners
 * color name, and display label.
 */
const SOURCE_CARD_CLASSES: Record<
  ContentSource,
  {
    border: string
    borderHover: string
    chipText: string
    chipDot: string
    frameBorder: string
    frameTick: string
    frameGlow: string
    hoverGlow: string
    cornerColor: 'source-youtube' | 'source-reddit' | 'source-ubisoft'
    designatorPrefix: string
    label: string
  }
> = {
  YOUTUBE: {
    border: 'border-source-youtube/20',
    borderHover: 'group-hover/card:border-source-youtube/55',
    chipText: 'text-source-youtube',
    chipDot: 'bg-source-youtube',
    frameBorder: 'border-source-youtube/25',
    frameTick: 'border-source-youtube/70',
    frameGlow:
      'radial-gradient(circle at center, rgba(255,0,64,0.10) 0%, rgba(0,0,0,0) 65%)',
    hoverGlow: 'group-hover/card:shadow-[0_0_30px_-6px_var(--color-glow-source-youtube)]',
    cornerColor: 'source-youtube',
    designatorPrefix: 'YT',
    label: 'YOUTUBE',
  },
  REDDIT: {
    border: 'border-source-reddit/20',
    borderHover: 'group-hover/card:border-source-reddit/55',
    chipText: 'text-source-reddit',
    chipDot: 'bg-source-reddit',
    frameBorder: 'border-source-reddit/25',
    frameTick: 'border-source-reddit/70',
    frameGlow:
      'radial-gradient(circle at center, rgba(255,69,0,0.10) 0%, rgba(0,0,0,0) 65%)',
    hoverGlow: 'group-hover/card:shadow-[0_0_30px_-6px_var(--color-glow-source-reddit)]',
    cornerColor: 'source-reddit',
    designatorPrefix: 'RD',
    label: 'REDDIT',
  },
  UBISOFT: {
    border: 'border-source-ubisoft/20',
    borderHover: 'group-hover/card:border-source-ubisoft/55',
    chipText: 'text-source-ubisoft',
    chipDot: 'bg-source-ubisoft',
    frameBorder: 'border-source-ubisoft/25',
    frameTick: 'border-source-ubisoft/70',
    frameGlow:
      'radial-gradient(circle at center, rgba(0,161,251,0.10) 0%, rgba(0,0,0,0) 65%)',
    hoverGlow: 'group-hover/card:shadow-[0_0_30px_-6px_var(--color-glow-source-ubisoft)]',
    cornerColor: 'source-ubisoft',
    designatorPrefix: 'UB',
    label: 'UBISOFT',
  },
}

interface ContentCardProps {
  article: ContentArticle
  /** Now-time threaded from the feed so timeago strings stay stable. */
  now: number
}

/**
 * Build the per-card designator from the source's real platform ID.
 * YouTube video IDs are 11 chars (`TPLW7Y7xtHk`), Reddit post IDs are
 * base-36 (`1thjjz0`), Ubisoft article IDs are long Contentful refs.
 * We uppercase and slice to a consistent 11-char window so all three
 * sources produce same-length designators in the UI.
 */
function buildDesignator(prefix: string, sourceId: string): string {
  const clean = sourceId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11)
  return `${prefix}_${clean}`
}

/**
 * RGA-style intercept-log entry. Designed to feel like a tactical SIGINT
 * record rather than a generic content card. The thumbnail sits in a
 * SpecimenFrame-style targeting frame (corner ticks + radial backlight in
 * the source color). The header strip carries a real platform-derived
 * designator. The title is font-display uppercase, like mission names on
 * the escalation page. Body copy stays in the body font so summaries
 * remain readable.
 *
 * Hover: CyberCorners brackets push outward, the card border brightens
 * to the source color at higher opacity, a soft source-color halo
 * appears via box-shadow, the thumbnail nudges a frame-zoom, and the
 * `// OPEN` chip in the footer brightens to full.
 *
 * The whole card is a single `<a target="_blank">` — no nested links,
 * no click handlers, no analytics middleware (yet).
 */
export function ContentCard({ article, now }: ContentCardProps) {
  const cls = SOURCE_CARD_CLASSES[article.source]
  const summary = article.perex
  const author = article.authors[0]
  const timeago = formatTimeago(article.publishedAt, now)
  const contentType = article.contentType?.toUpperCase()
  const hasThumb = Boolean(article.thumbnailUrl)
  const designator = buildDesignator(cls.designatorPrefix, article.sourceId)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/card block"
    >
      <CyberCorners color={cls.cornerColor} size="md">
        <article
          className={[
            'relative flex flex-col overflow-hidden border bg-[rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300 sm:flex-row',
            cls.border,
            cls.borderHover,
            cls.hoverGlow,
          ].join(' ')}
        >
          {/* Thumbnail — SpecimenFrame-style with corner ticks and source-tinted glow */}
          {hasThumb && (
            <div className="relative w-full shrink-0 p-3 sm:w-[280px] sm:p-3.5 md:w-[320px]">
              <div
                className={[
                  'relative aspect-16/9 w-full overflow-hidden border sm:aspect-auto sm:h-full sm:min-h-[160px]',
                  cls.frameBorder,
                ].join(' ')}
                style={{ background: cls.frameGlow }}
              >
                {/* Corner ticks — top-left, top-right, bottom-left, bottom-right */}
                <span
                  aria-hidden
                  className={['pointer-events-none absolute top-1 left-1 z-10 h-2 w-2 border-l border-t', cls.frameTick].join(' ')}
                />
                <span
                  aria-hidden
                  className={['pointer-events-none absolute top-1 right-1 z-10 h-2 w-2 border-r border-t', cls.frameTick].join(' ')}
                />
                <span
                  aria-hidden
                  className={['pointer-events-none absolute bottom-1 left-1 z-10 h-2 w-2 border-b border-l', cls.frameTick].join(' ')}
                />
                <span
                  aria-hidden
                  className={['pointer-events-none absolute bottom-1 right-1 z-10 h-2 w-2 border-b border-r', cls.frameTick].join(' ')}
                />

                <Image
                  src={article.thumbnailUrl!}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                  unoptimized={article.source === 'REDDIT'}
                />

                {/* YouTube play-overlay (the only source-specific embellishment) */}
                {article.source === 'YOUTUBE' && (
                  <div
                    aria-hidden
                    className="absolute inset-0 z-10 flex items-center justify-center bg-void/0 transition-colors group-hover/card:bg-void/30"
                  >
                    <div className="flex h-12 w-12 items-center justify-center border border-source-youtube/40 bg-void/70 backdrop-blur-sm transition-all group-hover/card:scale-110 group-hover/card:border-source-youtube/90 group-hover/card:bg-source-youtube/20">
                      <PlayIcon />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content column */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-3 px-5 pt-5 pb-4 sm:gap-3.5 sm:px-6 sm:pt-5 sm:pb-5">
            {/* Header strip: designator · source · contentType · relevance */}
            <header className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.3em]">
              <span className={cls.chipText}>{designator}</span>
              <span aria-hidden className="text-text-muted/50">·</span>
              <span className={['inline-flex items-center gap-1.5', cls.chipText].join(' ')}>
                <span aria-hidden className={['inline-block h-1.5 w-1.5 rounded-[1px]', cls.chipDot].join(' ')} />
                {cls.label}
              </span>
              {contentType && (
                <>
                  <span aria-hidden className="text-text-muted/50">·</span>
                  <span className="text-text-secondary">{contentType}</span>
                </>
              )}
              {typeof article.relevance === 'number' && (
                <>
                  <span aria-hidden className="text-text-muted/50">·</span>
                  <span
                    className={[
                      'inline-flex items-center gap-1 tabular-nums',
                      article.relevance >= 5
                        ? 'text-game-d2'
                        : article.relevance >= 4
                          ? 'text-text-primary/80'
                          : 'text-text-muted',
                    ].join(' ')}
                    title={`Relevance score: ${article.relevance}/5`}
                  >
                    <Star
                      size={11}
                      strokeWidth={0}
                      fill="currentColor"
                      aria-hidden
                      className="-mt-px"
                    />
                    <span>{article.relevance}</span>
                  </span>
                </>
              )}
            </header>

            {/* Transmission label + title */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-text-muted">
                // TRANSMISSION
              </span>
              <h3
                className="line-clamp-2 break-words font-display text-xl uppercase leading-[1.0] tracking-tight text-text-primary sm:text-2xl md:text-[26px]"
                style={{ textShadow: '0 0 18px rgba(255,255,255,0.06)' }}
              >
                {article.title}
              </h3>
            </div>

            {/* Brief label + summary */}
            {summary && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-text-muted">
                  // BRIEF
                </span>
                <p
                  className={[
                    'text-[14px] leading-relaxed text-text-secondary sm:text-[15px]',
                    hasThumb ? 'line-clamp-2' : 'line-clamp-3',
                  ].join(' ')}
                >
                  {summary}
                </p>
              </div>
            )}

            {/* Footer meta row */}
            <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-text-muted/10 pt-3 font-mono text-[10px] uppercase tracking-[0.3em]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted">
                {author && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-text-muted/70">// SRC</span>
                    <span className="max-w-[14rem] truncate text-text-secondary">{author}</span>
                  </span>
                )}
                {timeago && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-text-muted/70">// T-</span>
                    <span className="text-text-secondary tabular-nums">{timeago}</span>
                  </span>
                )}
              </div>
              <span
                className={[
                  'inline-flex items-center gap-1.5 opacity-70 transition-opacity group-hover/card:opacity-100',
                  cls.chipText,
                ].join(' ')}
              >
                <span>// OPEN</span>
                <ArrowIcon />
              </span>
            </footer>
          </div>
        </article>
      </CyberCorners>
    </a>
  )
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      className="text-source-youtube transition-colors group-hover/card:text-text-primary"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2 8l6-6M3 2h5v5" />
    </svg>
  )
}
