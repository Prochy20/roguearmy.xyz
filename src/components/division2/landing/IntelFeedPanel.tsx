import { CyberCorners } from '@/components/ui/CyberCorners'
import { PanelHeader } from '@/components/division2/landing/PanelHeader'
import { formatTimeago } from '@/lib/division2/content.format'
import type {
  ContentArticle,
  ContentSource,
} from '@/lib/division2/content.server'

const SOURCE_DOT: Record<ContentSource, string> = {
  YOUTUBE: 'bg-source-youtube shadow-[0_0_6px_rgba(255,0,64,0.6)]',
  REDDIT: 'bg-source-reddit shadow-[0_0_6px_rgba(255,69,0,0.6)]',
  UBISOFT: 'bg-source-ubisoft shadow-[0_0_6px_rgba(0,161,251,0.6)]',
}

const SOURCE_LABEL: Record<ContentSource, string> = {
  YOUTUBE: 'YT',
  REDDIT: 'RD',
  UBISOFT: 'UB',
}

interface IntelFeedPanelProps {
  articles: ContentArticle[]
  now: number
  /** How many top items to show. Defaults to 6. */
  limit?: number
}

/**
 * Compact "console terminal" feed of the most recent content items. One row
 * per article: source designator + title + age. No thumbnails, no perex, no
 * relevance stars — those live on the destination feed page. This widget
 * exists to answer: "what's hot right now?"
 */
export function IntelFeedPanel({
  articles,
  now,
  limit = 6,
}: IntelFeedPanelProps) {
  const top = articles.slice(0, limit)
  if (top.length === 0) return null

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h2
          className="font-display uppercase leading-[0.9] tracking-[0.005em] text-balance"
          style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
        >
          <span className="text-text-primary">LIVE </span>
          <span
            className="text-game-d2"
            style={{
              textShadow:
                '0 0 24px rgba(255,128,0,0.32), 0 0 56px rgba(255,128,0,0.14)',
            }}
          >
            INTEL
          </span>
        </h2>
        <PanelHeader
          code="SEC_01"
          label="// LIVE · INTEL FEED"
          meta={`TOP ${top.length}`}
          cta={{ href: '/division-2/content', label: 'OPEN CONTENT →' }}
          accent="mod"
        />
      </div>
      <CyberCorners color="mod" size="md">
        <div className="border border-game-d2/20 bg-[rgba(0,0,0,0.5)]">
          <ul className="flex flex-col">
            {top.map((article, idx) => (
              <li
                key={article.id}
                className={idx > 0 ? 'border-t border-game-d2/10' : ''}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-game-d2/5"
                >
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                    <span
                      aria-hidden
                      className={`inline-block h-2 w-2 rounded-[1px] ${SOURCE_DOT[article.source]}`}
                    />
                    <span className="hidden tabular-nums sm:inline">
                      {SOURCE_LABEL[article.source]}
                    </span>
                  </span>
                  <span className="min-w-0 truncate font-mono text-sm leading-snug text-text-secondary transition-colors group-hover/row:text-text-primary">
                    {article.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted tabular-nums">
                    {formatTimeago(article.fetchedAt, now)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CyberCorners>
    </section>
  )
}

