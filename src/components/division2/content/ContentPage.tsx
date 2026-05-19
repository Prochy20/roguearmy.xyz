import { FailRow } from '@/components/shared/FailRow'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { ContentFilterChips } from './ContentFilterChips'
import { ContentFeed } from './ContentFeed'
import { substituteTokens } from '@/lib/division2/content.format'
import type { AshleyResult } from '@/lib/api/server'
import type { ContentList, ContentSource } from '@/lib/division2/content.server'
import type { Division2 } from '@/payload-types'

type ContentPageContent = NonNullable<Division2['contentPage']>

interface ContentPageProps {
  /** First-batch fetch result for the active filter. */
  initial: AshleyResult<ContentList>
  /** Active source filter (undefined = "All"). */
  source: ContentSource | undefined
  /** Page size — passed to the client feed so loadMore uses the same value. */
  limit: number
  /** Editable copy sourced from the Division 2 global. Fields fall back to
   *  built-in defaults if the admin clears them, so the page never goes blank. */
  content: ContentPageContent | null | undefined
}

const DEFAULTS = {
  heroKicker: '// DIVISION 2 · CONTENT FEED · LIVE INTEL',
  heroTitle: 'CONTENT',
  heroAccent: 'FEED',
  intro:
    'Aggregated dispatches from YouTube, Reddit, and Ubisoft — AI-filtered for Division 2 relevance. Every card links straight to source.',
  filterSectionLabel: '// FILTER BY SOURCE',
  feedSectionLabel: '// LIVE FEED',
  emptyFiltered: '// NO {SOURCE} CONTENT — TRY ANOTHER SOURCE',
  emptyAll: '// CONTENT FEED OFFLINE — UPSTREAM SYNC PENDING',
  endOfFeedLabel: '// END OF FEED · {COUNT} ITEMS',
} as const

/**
 * Server component. Lays out the content firehose page: hero header,
 * source filter chips, then either an inline FailRow (if Ashley failed),
 * an empty-state copy (if Ashley returned zero items), or the client-side
 * ContentFeed (which appends batches as the user scrolls).
 *
 * Hero + filter chips stay rendered even on failure — so the user can
 * still switch source filters and try again without losing context. This
 * is why the FailRow goes inline in the grid area, not as a full-page
 * replacement.
 */
export function ContentPage({ initial, source, limit, content }: ContentPageProps) {
  const heroKicker = content?.heroKicker?.trim() || DEFAULTS.heroKicker
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro
  const filterSectionLabel =
    content?.filterSectionLabel?.trim() || DEFAULTS.filterSectionLabel
  const feedSectionLabel = content?.feedSectionLabel?.trim() || DEFAULTS.feedSectionLabel
  const emptyFiltered = content?.emptyFiltered?.trim() || DEFAULTS.emptyFiltered
  const emptyAll = content?.emptyAll?.trim() || DEFAULTS.emptyAll
  const endOfFeedLabel = content?.endOfFeedLabel?.trim() || DEFAULTS.endOfFeedLabel

  return (
    <Shell>
      <header className="flex flex-col gap-7 sm:gap-9">
        <div className="flex min-w-0 flex-col gap-7">
          <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-rga-mod">
            {heroKicker}
          </div>

          <h1
            className="font-display uppercase leading-[0.85] tracking-[0.005em] text-balance break-words"
            style={{ fontSize: 'clamp(48px, 9vw, 144px)' }}
          >
            <HeroGlitch
              className="block"
              minInterval={4}
              maxInterval={10}
              intensity={8}
              dataCorruption
              scanlines
            >
              <span className="text-text-primary">{heroTitle}</span>
            </HeroGlitch>
            <HeroGlitch
              className="block"
              minInterval={5}
              maxInterval={12}
              intensity={7}
              dataCorruption={false}
              colors={['#ff8000', '#ffae42']}
            >
              <span
                className="text-rga-mod"
                style={{
                  textShadow:
                    '0 0 36px rgba(255,128,0,0.45), 0 0 80px rgba(255,128,0,0.18)',
                }}
              >
                {heroAccent}
              </span>
            </HeroGlitch>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {intro}
          </p>
        </div>
      </header>

      <ContentFilterChips active={source} sectionLabel={filterSectionLabel} />

      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.35em]">
          <span className="text-rga-mod">{feedSectionLabel}</span>
          {initial.ok && (
            <span className="text-text-muted">
              {initial.data.items.length} OF {initial.data.total}
            </span>
          )}
        </div>

        {!initial.ok ? (
          <FailRow
            code={initial.error.code}
            status={initial.error.status}
            returnTo="/division-2/content"
          />
        ) : initial.data.items.length === 0 ? (
          <EmptyCopy
            text={
              source
                ? substituteTokens(emptyFiltered, { source })
                : emptyAll
            }
          />
        ) : (
          <ContentFeed
            key={source ?? 'all'}
            initial={initial.data}
            source={source}
            limit={limit}
            endOfFeedLabel={endOfFeedLabel}
          />
        )}
      </section>
    </Shell>
  )
}

function EmptyCopy({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-text-muted/20 bg-bg-elevated/40 px-4 py-6 font-mono text-[12px] uppercase tracking-[0.3em] text-text-secondary">
      <span aria-hidden className="inline-block h-2 w-2 rounded-[1px] bg-text-muted/60" />
      <span>{text}</span>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pt-20 pb-20 sm:gap-14 sm:px-8 sm:pt-24 sm:pb-28 lg:px-16 lg:pt-32 lg:pb-36">
      {children}
    </div>
  )
}
