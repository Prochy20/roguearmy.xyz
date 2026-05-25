'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { formatDayShort } from '@/lib/division2/format'
import { ACCENT_TOKENS, type AccentName } from '@/components/content/reader/accent'
import type { BriefingArticle } from '@/lib/division2/briefing.server'

interface BriefingSourcesProps {
  accent: AccentName
  articles: readonly BriefingArticle[]
}

const PAGE_SIZE = 5

/**
 * Paginated sources index, structured identically to the LIVE · INTEL FEED
 * panel on `/division-2`. Three-column row vocabulary:
 *
 *   [src-dot + 2-letter code] · [title] · [date]
 *
 * Rows live inside a single bordered card wrapped in `CyberCorners`. Hover
 * tints the row with the page accent at 5% opacity. Title truncates to a
 * single line. Click the row to open the source in a new tab.
 *
 * Pagination shows mono prev/next buttons + a row of accent dot pips, one
 * per page, with the active page rendered wider and glowing. State is local.
 *
 * Hash-anchor handler: `/briefings/X#ref-3` deep links still work even when
 * ref 3 is on a non-current page. The component switches to the page
 * containing the ref and scrolls the row into view. Covers the few citations
 * that fall back to in-page anchors (articles without external URLs).
 */
export function BriefingSources({ accent, articles }: BriefingSourcesProps) {
  const a = ACCENT_TOKENS[accent]
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const visible = useMemo(
    () => articles.slice(start, start + PAGE_SIZE),
    [articles, start],
  )

  useEffect(() => {
    if (articles.length === 0) return
    const seekToHash = () => {
      if (typeof window === 'undefined') return
      const match = window.location.hash.match(/^#ref-(\d+)$/)
      if (!match) return
      const n = parseInt(match[1], 10)
      if (!Number.isFinite(n) || n < 1 || n > articles.length) return
      const targetPage = Math.floor((n - 1) / PAGE_SIZE)
      setPage(targetPage)
      requestAnimationFrame(() => {
        document
          .getElementById(`ref-${n}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    seekToHash()
    window.addEventListener('hashchange', seekToHash)
    return () => window.removeEventListener('hashchange', seekToHash)
  }, [articles.length])

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  )

  if (articles.length === 0) return null

  return (
    <section className="mt-16 space-y-5">
      <PanelHeader
        accent={accent}
        code="SEC_04"
        label="// SOURCES"
        meta={`x${String(articles.length).padStart(2, '0')} CITED`}
        right={
          totalPages > 1 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted tabular-nums">
              PAGE{' '}
              <span className={a.text} style={{ textShadow: a.textGlow }}>
                {String(page + 1).padStart(2, '0')}
              </span>{' '}
              / {String(totalPages).padStart(2, '0')}
            </span>
          ) : null
        }
      />

      <CyberCorners color={a.cornerColor} size="md">
        <div className={`border ${a.borderSoft} bg-[rgba(0,0,0,0.5)]`}>
          <ul className="flex flex-col">
            {visible.map((article, idx) => (
              <SourceRow
                key={article.id}
                accent={accent}
                article={article}
                ordinal={start + idx + 1}
                isFirst={idx === 0}
              />
            ))}
          </ul>
        </div>
      </CyberCorners>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <PaginationButton
            accent={accent}
            direction="prev"
            onClick={goPrev}
            disabled={page === 0}
          />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === page ? 'page' : undefined}
                className={`h-1.5 transition-all ${
                  i === page
                    ? `${a.bg} w-6`
                    : 'w-3 bg-text-muted/25 hover:bg-text-muted/50'
                }`}
                style={
                  i === page
                    ? { boxShadow: `0 0 8px rgba(${a.rgb},0.7)` }
                    : undefined
                }
              />
            ))}
          </div>
          <PaginationButton
            accent={accent}
            direction="next"
            onClick={goNext}
            disabled={page >= totalPages - 1}
          />
        </div>
      )}
    </section>
  )
}

/* ── Header ──────────────────────────────────────────────────────────────── */

function PanelHeader({
  accent,
  code,
  label,
  meta,
  right,
}: {
  accent: AccentName
  code: string
  label: string
  meta?: string
  right?: React.ReactNode
}) {
  const a = ACCENT_TOKENS[accent]
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
      <div className="flex flex-wrap items-baseline gap-3 font-mono">
        <span
          className={`text-[10px] tracking-[0.4em] ${a.text}`}
          style={{ textShadow: a.textGlow }}
        >
          {code}
        </span>
        <span className="text-[10px] tracking-[0.3em] text-text-muted">
          {label}
        </span>
        {meta && (
          <span className="text-[9px] tracking-[0.3em] text-text-muted/70">
            {meta}
          </span>
        )}
      </div>
      {right}
    </header>
  )
}

/* ── Row ─────────────────────────────────────────────────────────────────── */

const SOURCE_DOT: Record<string, string> = {
  YOUTUBE: 'bg-source-youtube shadow-[0_0_6px_rgba(255,0,64,0.6)]',
  REDDIT: 'bg-source-reddit shadow-[0_0_6px_rgba(255,69,0,0.6)]',
  UBISOFT: 'bg-source-ubisoft shadow-[0_0_6px_rgba(0,161,251,0.6)]',
}

const SOURCE_LABEL: Record<string, string> = {
  YOUTUBE: 'YT',
  REDDIT: 'RD',
  UBISOFT: 'UB',
}

interface SourceRowProps {
  accent: AccentName
  article: BriefingArticle
  ordinal: number
  isFirst: boolean
}

function SourceRow({ accent, article, ordinal, isFirst }: SourceRowProps) {
  const dotClass = SOURCE_DOT[article.source] ?? 'bg-rga-gray/50'
  const codeLabel = SOURCE_LABEL[article.source] ?? article.source.slice(0, 2)
  const publishedShort = safePublishedShort(article.publishedAt)
  const separatorClass = isFirst
    ? ''
    : accent === 'cyan'
      ? 'border-t border-rga-cyan/10'
      : 'border-t border-rga-mod/10'
  const hoverClass =
    accent === 'cyan' ? 'hover:bg-rga-cyan/5' : 'hover:bg-rga-mod/5'

  const inner = (
    <>
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        <span
          aria-hidden
          className={`inline-block h-2 w-2 rounded-[1px] ${dotClass}`}
        />
        <span className="hidden tabular-nums sm:inline">{codeLabel}</span>
      </span>
      <span className="min-w-0 truncate font-mono text-sm leading-snug text-text-secondary transition-colors group-hover/row:text-text-primary">
        {article.title}
      </span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted tabular-nums">
        {publishedShort ?? '—'}
      </span>
    </>
  )

  const rowClass = `group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 transition-colors ${hoverClass}`

  return (
    <li id={`ref-${ordinal}`} className={`${separatorClass} scroll-mt-28`}>
      {article.url ? (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClass}
        >
          {inner}
        </a>
      ) : (
        <div className={rowClass}>{inner}</div>
      )}
    </li>
  )
}

/* ── Pagination button ───────────────────────────────────────────────────── */

interface PaginationButtonProps {
  accent: AccentName
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}

function PaginationButton({
  accent,
  direction,
  onClick,
  disabled,
}: PaginationButtonProps) {
  const a = ACCENT_TOKENS[accent]
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const label = direction === 'prev' ? 'PREV' : 'NEXT'
  const baseClass =
    'inline-flex h-9 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.32em] transition-colors'
  const enabledClass = `${a.borderSoft} bg-void/40 text-text-secondary ${a.textHover} hover:bg-void/60`
  const disabledClass =
    'border-text-muted/10 bg-void/20 text-text-muted/30 cursor-not-allowed'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      className={`${baseClass} ${disabled ? disabledClass : enabledClass}`}
    >
      {direction === 'prev' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
      <span>{label}</span>
      {direction === 'next' && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
    </button>
  )
}

function safePublishedShort(iso: string): string | null {
  if (!iso) return null
  const day = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  return formatDayShort(day)
}
