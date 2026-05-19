import { FailRow } from '@/components/shared/FailRow'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { StatRibbon } from '@/components/shared/StatRibbon'
import { ContentFilterChips } from './ContentFilterChips'
import { ContentFeed } from './ContentFeed'
import { substituteTokens } from '@/lib/division2/content.format'
import type { AshleyResult } from '@/lib/api/server'
import type { ContentList, ContentSource } from '@/lib/division2/content.server'
import type { Division2 } from '@/payload-types'

/** Map minRelevance numeric tier → SCAN/TRACE/LOCK label for the StatRibbon. */
function modeLabelFor(min: number): string {
  if (min >= 5) return 'LOCK'
  if (min >= 4) return 'TRACE'
  return 'SCAN'
}

type ContentPageContent = NonNullable<Division2['contentPage']>

interface ContentPageProps {
  /** First-batch fetch result for the active filter. */
  initial: AshleyResult<ContentList>
  /** Active source filter (undefined = "All"). */
  source: ContentSource | undefined
  /** Active minimum relevance score (3 / 4 / 5). */
  minRelevance: number
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
  feedSectionLabel: '// LIVE FEED',
  feedBlurb:
    'Filter the feed by source above — YouTube creator content, Reddit discussion, or Ubisoft official news — or leave it on ALL for the combined firehose. Strictness ladder: SCAN sweeps wide (★3 and up), TRACE narrows to sharper signals (★4+), LOCK targets top-tier intel only (★5).',
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
export function ContentPage({
  initial,
  source,
  minRelevance,
  limit,
  content,
}: ContentPageProps) {
  const heroKicker = content?.heroKicker?.trim() || DEFAULTS.heroKicker
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro
  const feedSectionLabel = content?.feedSectionLabel?.trim() || DEFAULTS.feedSectionLabel
  const feedBlurb = content?.feedBlurb?.trim() || DEFAULTS.feedBlurb
  const emptyFiltered = content?.emptyFiltered?.trim() || DEFAULTS.emptyFiltered
  const emptyAll = content?.emptyAll?.trim() || DEFAULTS.emptyAll
  const endOfFeedLabel = content?.endOfFeedLabel?.trim() || DEFAULTS.endOfFeedLabel

  const sourceLabel = source ?? 'ALL'
  const modeLabel = modeLabelFor(minRelevance)
  const itemsValue = initial.ok
    ? `${initial.data.items.length}/${initial.data.total}`
    : '—'

  return (
    <Shell>
      <header className="flex flex-col gap-7 sm:gap-9">
        <StatRibbon
          prefix="// CONTENT FEED"
          fields={[
            { label: 'SOURCE', value: sourceLabel, accent: 'mod' },
            { label: 'MODE', value: modeLabel, accent: 'mod' },
            { label: 'ITEMS', value: itemsValue, accent: 'mod' },
          ]}
          pill={
            initial.ok
              ? { text: 'LIVE', ok: true, accent: 'mod' }
              : { text: 'OFFLINE', ok: false }
          }
        />

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

      {/*
        Sticky filter bar — docks at `top-0` (very top of the viewport)
        co-located with the chrome TopBar (which is `fixed top-0 z-50`).
        The TopBar's bar area is transparent except for the right-aligned
        MENU button, so this filter at `z-40` shines through its empty
        regions while the MENU button (z-50) floats on top-right.

        Content has a generous right pad so the chip row doesn't slide
        under the MENU button when the row is narrow.

        `-mx-*` + matching `px-*` makes the bar full-bleed despite living
        inside the page's padded Shell.
      */}
      <div className="sticky top-0 z-40 -mx-4 border-b border-text-muted/15 bg-void/90 px-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-16 lg:px-16">
        <div className="pr-24 sm:pr-28 lg:pr-36">
          <ContentFilterChips activeSource={source} activeMin={minRelevance} />
        </div>
      </div>

      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 border-b border-text-muted/15 pb-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.4em] text-rga-mod">
                SEC_03
              </span>
              <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
                {feedSectionLabel}
              </span>
            </div>
            {initial.ok && (
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                <span>
                  <span className="text-text-muted/70">// COUNT </span>
                  <span className="tabular-nums text-text-secondary">
                    {initial.data.items.length}
                  </span>
                  <span className="text-text-muted/70">/</span>
                  <span className="tabular-nums text-text-secondary">
                    {initial.data.total}
                  </span>
                </span>
                <span aria-hidden className="h-3 w-px bg-text-muted/20" />
                <span className="inline-flex items-center gap-1.5 text-rga-mod">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-[1px] bg-rga-mod shadow-[0_0_8px_#FF8000]"
                  />
                  LIVE
                </span>
              </div>
            )}
          </div>
          {feedBlurb && (
            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary/85 sm:text-[15px]">
              {feedBlurb}
            </p>
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
            key={`${source ?? 'all'}-${minRelevance}`}
            initial={initial.data}
            source={source}
            minRelevance={minRelevance}
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
    <div className="relative flex items-center gap-3 border border-text-muted/25 bg-[rgba(0,0,0,0.4)] px-5 py-8 font-mono text-[11px] uppercase tracking-[0.35em] text-text-secondary">
      <span aria-hidden className="pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t border-text-muted/60" />
      <span aria-hidden className="pointer-events-none absolute -top-px -right-px h-2 w-2 border-r border-t border-text-muted/60" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px h-2 w-2 border-b border-l border-text-muted/60" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r border-text-muted/60" />
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
