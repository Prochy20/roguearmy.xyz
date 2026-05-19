'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import type { ContentSource } from '@/lib/division2/content.server'

/** Match the rga-overlay-out animation duration in globals.css. */
const SHEET_CLOSE_DURATION = 200

/**
 * SessionStorage key used to hand scrollY across the chip-click filter
 * change. Saved synchronously on click, read + cleared on the next
 * ContentFeed mount via useLayoutEffect (before paint, so no flicker).
 *
 * Without this, transitions to the bare pathname (`/division-2/content`
 * with all params cleared) reliably scroll to top even when Link's
 * `scroll={false}` is set — Next.js's scroll restoration treats
 * pathname-only transitions differently from query-param transitions.
 */
export const FILTER_SCROLL_KEY = 'd2-content-filter-scroll'

const SOURCES: ContentSource[] = ['YOUTUBE', 'REDDIT', 'UBISOFT']
const RELEVANCE_TIERS = [3, 4, 5] as const
type RelevanceTier = (typeof RELEVANCE_TIERS)[number]
const DEFAULT_MIN: RelevanceTier = 3

/**
 * Verbal labels for relevance tiers framed as SIGINT scan modes:
 *   SCAN  — sweep wide, take everything at the floor (3+)
 *   TRACE — follow sharper signals (4+)
 *   LOCK  — target acquired, top-tier only (5)
 * The raw ★N score still appears on each card so the data is never hidden.
 */
const RELEVANCE_LABEL: Record<RelevanceTier, string> = {
  3: 'SCAN',
  4: 'TRACE',
  5: 'LOCK',
}

/**
 * Per-chip help blurbs. Surface on hover (desktop) or focus (keyboard)
 * via the popover panel attached to each chip — chip-specific content
 * rather than a generic INFO panel.
 */
const RELEVANCE_HELP: Record<
  RelevanceTier,
  { title: string; body: string }
> = {
  3: {
    title: 'SCAN — broad sweep',
    body: 'All intel at ★3 or better. The default floor — show me everything that\'s at least decent.',
  },
  4: {
    title: 'TRACE — narrower band',
    body: 'Only ★4 and ★5. Sharper signals, fewer items — high-quality intel only.',
  },
  5: {
    title: 'LOCK — target acquired',
    body: 'Only ★5. Top-tier confirmed-relevant intel — the apex of the feed.',
  },
}

/**
 * Tailwind requires statically-analyzable class names — we cannot
 * interpolate `text-${color}` and expect JIT to pick it up. So source
 * accent classes are hard-coded per source. Short labels used in the
 * filter bar to keep it compact; cards still show the full source name.
 */
const SOURCE_CHIP_CLASSES: Record<
  ContentSource,
  {
    activeText: string
    activeBorder: string
    activeDot: string
    activeTick: string
    short: string
    long: string
    helpTitle: string
    helpBody: string
  }
> = {
  YOUTUBE: {
    activeText: 'text-source-youtube',
    activeBorder: 'border-source-youtube/60',
    activeDot: 'bg-source-youtube',
    activeTick: 'border-source-youtube/80',
    short: 'YT',
    long: 'YOUTUBE',
    helpTitle: 'YOUTUBE',
    helpBody: 'Creator content — channels covering Division 2 builds, guides, news, patch breakdowns.',
  },
  REDDIT: {
    activeText: 'text-source-reddit',
    activeBorder: 'border-source-reddit/60',
    activeDot: 'bg-source-reddit',
    activeTick: 'border-source-reddit/80',
    short: 'RD',
    long: 'REDDIT',
    helpTitle: 'REDDIT',
    helpBody: 'Community discussion — r/thedivision and related subs. Threads, AMAs, bug reports, theorycrafting.',
  },
  UBISOFT: {
    activeText: 'text-source-ubisoft',
    activeBorder: 'border-source-ubisoft/60',
    activeDot: 'bg-source-ubisoft',
    activeTick: 'border-source-ubisoft/80',
    short: 'UB',
    long: 'UBISOFT',
    helpTitle: 'UBISOFT',
    helpBody: 'Official source — patch notes, season briefings, news updates straight from Massive Entertainment.',
  },
}

interface ContentFilterChipsProps {
  /** The active source filter, or undefined when "All" is selected. */
  activeSource: ContentSource | undefined
  /** The active minRelevance value (3/4/5). */
  activeMin: number
  /** Section label — kept in props for API compatibility but no longer rendered
   *  inside the chip bar (the chip colors do the grouping work). */
  sectionLabel: string
}

/**
 * Build a `/division-2/content?...` URL preserving the current filter
 * state when one axis changes. Omits params that match their default so
 * the URL stays clean (`/division-2/content` rather than `?source=&min=3`).
 */
function buildHref({
  source,
  min,
}: {
  source: ContentSource | undefined
  min: RelevanceTier
}): string {
  const params = new URLSearchParams()
  if (source) params.set('source', source)
  if (min !== DEFAULT_MIN) params.set('min', String(min))
  const query = params.toString()
  return query ? `/division-2/content?${query}` : '/division-2/content'
}

/**
 * Compact single-row filter bar. Source chips + MODE chips + (?) toggle.
 * Each chip is a Next.js Link so changing a filter is a full server
 * navigation. URL is the source of truth; clicking a chip preserves the
 * other axis.
 *
 * Help row toggles inline below the chips — keeps the bar slim at rest
 * while making the SIGINT vocabulary (SCAN / TRACE / LOCK) discoverable
 * for first-time visitors. The `(?)` button is `aria-expanded`-wired so
 * screen readers announce the disclosure state correctly.
 *
 * Native `title` attributes on every chip give desktop users a hover
 * tooltip without needing to open the help panel.
 */
export function ContentFilterChips({
  activeSource,
  activeMin,
}: ContentFilterChipsProps) {
  // `sheetOpen` controls whether the sheet is mounted in the DOM.
  // `sheetClosing` flips on close to swap the `data-state` attribute from
  // 'open' → 'closed', triggering the rga-overlay-out animation. We
  // delay the actual unmount by SHEET_CLOSE_DURATION so the exit
  // animation has time to play.
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetClosing, setSheetClosing] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeSheet = useCallback(() => {
    setSheetClosing(true)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setSheetOpen(false)
      setSheetClosing(false)
      closeTimerRef.current = null
    }, SHEET_CLOSE_DURATION)
  }, [])

  const openSheet = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setSheetClosing(false)
    setSheetOpen(true)
  }, [])

  // Cleanup any pending close timer on unmount.
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    },
    [],
  )

  // `mounted` gates the Portal render so SSR doesn't try to access
  // `document` — the Portal target is `document.body`, which only
  // exists client-side.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const min = (RELEVANCE_TIERS as readonly number[]).includes(activeMin)
    ? (activeMin as RelevanceTier)
    : DEFAULT_MIN

  // Save scrollY before chip navigation — restored on ContentFeed mount.
  // Also triggers the mobile sheet's exit animation so the user briefly
  // sees the new selection highlight before the sheet dismisses.
  const handleChipNavigate = useCallback(() => {
    try {
      window.sessionStorage.setItem(
        FILTER_SCROLL_KEY,
        JSON.stringify({ y: window.scrollY, time: Date.now() }),
      )
    } catch {
      // sessionStorage disabled — fall back to default scroll behavior.
    }
    closeSheet()
  }, [closeSheet])

  // Close the mobile sheet on Escape + lock body scroll while open.
  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [sheetOpen, closeSheet])

  const activeSourceLabel = activeSource
    ? SOURCE_CHIP_CLASSES[activeSource].short
    : 'ALL'
  const activeModeLabel = RELEVANCE_LABEL[min]

  return (
    <section className="flex flex-col">
      {/* ── MOBILE TRIGGER (visible <md) ──────────────────────────────────
          Single button summarizing the active filter, opens a sheet with
          the full chip grid + inline help. Mirrors the chrome MENU
          button's height (h-20) so the bar baseline matches. */}
      <div className="flex h-20 items-center md:hidden">
        <MobileFilterTrigger
          sourceLabel={activeSourceLabel}
          modeLabel={activeModeLabel}
          onOpen={openSheet}
        />
      </div>

      {/* ── DESKTOP CHIPS ROW (md+) ───────────────────────────────────────
          Inline chips with per-chip hover popovers. h-20 to match the
          chrome MENU button on the right. */}
      <div className="hidden min-h-20 flex-wrap items-center gap-x-2 gap-y-2 py-2 md:flex">
        {/* Designator + label, kept tight */}
        <div className="flex items-center gap-2 pr-1">
          <span className="font-mono text-[10px] tracking-[0.4em] text-rga-mod">
            SEC_02
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted/70">
            // FILTER
          </span>
        </div>

        {/* Source chips — short labels (YT/RD/UB), per-chip hover popover */}
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="ALL"
            href={buildHref({ source: undefined, min })}
            active={activeSource === undefined}
            activeText="text-rga-green"
            activeBorder="border-rga-green/60"
            activeDot="bg-rga-green"
            activeTick="border-rga-green/80"
            popoverAccent="text-rga-green"
            popoverBorder="border-rga-green/40"
            helpTitle="ALL SOURCES"
            helpBody="Combined feed — YouTube + Reddit + Ubisoft intercepts, interleaved by recency."
            onNavigate={handleChipNavigate}
          />
          {SOURCES.map((src) => {
            const cls = SOURCE_CHIP_CLASSES[src]
            return (
              <FilterChip
                key={src}
                label={cls.short}
                href={buildHref({ source: src, min })}
                active={activeSource === src}
                activeText={cls.activeText}
                activeBorder={cls.activeBorder}
                activeDot={cls.activeDot}
                activeTick={cls.activeTick}
                popoverAccent={cls.activeText}
                popoverBorder={cls.activeBorder}
                helpTitle={cls.helpTitle}
                helpBody={cls.helpBody}
                onNavigate={handleChipNavigate}
              />
            )
          })}
        </div>

        {/* Divider — visible only when the row hasn't wrapped */}
        <span
          aria-hidden
          className="hidden h-4 w-px bg-text-muted/20 sm:inline-block"
        />

        {/* Mode (relevance) chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {RELEVANCE_TIERS.map((tier) => {
            const help = RELEVANCE_HELP[tier]
            return (
              <FilterChip
                key={tier}
                label={RELEVANCE_LABEL[tier]}
                href={buildHref({ source: activeSource, min: tier })}
                active={min === tier}
                activeText="text-rga-green"
                activeBorder="border-rga-green/60"
                activeDot="bg-rga-green"
                activeTick="border-rga-green/80"
                popoverAccent="text-rga-green"
                popoverBorder="border-rga-green/40"
                helpTitle={help.title}
                helpBody={help.body}
                onNavigate={handleChipNavigate}
              />
            )
          })}
        </div>
      </div>

      {/* ── MOBILE SHEET ──────────────────────────────────────────────────
          Rendered via React Portal at `document.body` so it escapes the
          sticky filter bar's containing-block trap — the sticky bar uses
          `backdrop-blur-md`, which per CSS spec promotes it to a
          containing block for fixed-positioned descendants and would
          otherwise constrain `fixed inset-0` to the sticky's ~80px
          height instead of the full viewport. */}
      {sheetOpen &&
        mounted &&
        createPortal(
          <MobileFilterSheet
            activeSource={activeSource}
            min={min}
            buildHref={buildHref}
            onChipNavigate={handleChipNavigate}
            onClose={closeSheet}
            closing={sheetClosing}
          />,
          document.body,
        )}
    </section>
  )
}

/** Mobile trigger button — current filter state + a chevron. */
function MobileFilterTrigger({
  sourceLabel,
  modeLabel,
  onOpen,
}: {
  sourceLabel: string
  modeLabel: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open filter panel"
      className="group/trigger relative inline-flex items-center gap-2 whitespace-nowrap border border-rga-green/40 bg-bg-elevated px-3 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-rga-green transition-colors hover:border-rga-green/70"
    >
      <span aria-hidden className="pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t border-rga-green/70" />
      <span aria-hidden className="pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t border-rga-green/70" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-rga-green/70" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-rga-green/70" />

      <span>{sourceLabel}</span>
      <span aria-hidden className="text-text-muted/60">·</span>
      <span>{modeLabel}</span>
      <ChevronDown
        size={12}
        strokeWidth={2}
        aria-hidden
        className="ml-0.5 text-text-muted transition-transform group-hover/trigger:text-text-primary"
      />
    </button>
  )
}

/** Mobile sheet — fullscreen solid overlay, matching the chrome menu's
 *  presentation. Replaces the page entirely while open; close returns to
 *  the page state with the new filter applied.
 *
 *  Reuses the `rga-nav-overlay` CSS class + `data-state` attribute from
 *  globals.css so the open/close animations match the chrome menu's
 *  exact timing (220ms ease-out in, 180ms ease-in out, with the same
 *  scale + opacity curves). */
function MobileFilterSheet({
  activeSource,
  min,
  buildHref,
  onChipNavigate,
  onClose,
  closing,
}: {
  activeSource: ContentSource | undefined
  min: RelevanceTier
  buildHref: (args: { source: ContentSource | undefined; min: RelevanceTier }) => string
  onChipNavigate: () => void
  onClose: () => void
  closing: boolean
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter panel"
      data-state={closing ? 'closed' : 'open'}
      className="rga-nav-overlay fixed inset-0 z-[60] flex flex-col bg-[#06090a] md:hidden"
    >
      {/* Header row — h-20 to match the chrome MENU row above. */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-text-muted/15 px-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.4em] text-rga-mod">
            SEC_02
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            // FILTER · MANUAL
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filter panel"
          className="group/close relative inline-flex items-center gap-2 border border-rga-green/60 bg-rga-green/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-rga-green transition-colors hover:bg-rga-green/20"
        >
          <span aria-hidden className="pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t border-rga-green/80" />
          <span aria-hidden className="pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t border-rga-green/80" />
          <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-rga-green/80" />
          <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-rga-green/80" />
          <X size={14} strokeWidth={1.8} aria-hidden />
          <span>CLOSE</span>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-7 pb-12 sm:px-7">
          {/* Source group */}
          <SheetGroup
            label="// SRC · SOURCE"
            description="Aggregated feeds — pick one to focus, or ALL for the combined firehose."
          >
            <FilterChip
              label="ALL"
              href={buildHref({ source: undefined, min })}
              active={activeSource === undefined}
              activeText="text-rga-green"
              activeBorder="border-rga-green/60"
              activeDot="bg-rga-green"
              activeTick="border-rga-green/80"
              popoverAccent="text-rga-green"
              popoverBorder="border-rga-green/40"
              helpTitle="ALL SOURCES"
              helpBody="Combined feed — YouTube + Reddit + Ubisoft intercepts, interleaved by recency."
              onNavigate={onChipNavigate}
            />
            {SOURCES.map((src) => {
              const cls = SOURCE_CHIP_CLASSES[src]
              return (
                <FilterChip
                  key={src}
                  label={cls.short}
                  href={buildHref({ source: src, min })}
                  active={activeSource === src}
                  activeText={cls.activeText}
                  activeBorder={cls.activeBorder}
                  activeDot={cls.activeDot}
                  activeTick={cls.activeTick}
                  popoverAccent={cls.activeText}
                  popoverBorder={cls.activeBorder}
                  helpTitle={cls.helpTitle}
                  helpBody={cls.helpBody}
                  onNavigate={onChipNavigate}
                />
              )
            })}
          </SheetGroup>

          {/* Mode group */}
          <SheetGroup
            label="// MODE · RELEVANCE"
            description="How strict the AI relevance filter is. SCAN = broad, LOCK = top-tier only."
          >
            {RELEVANCE_TIERS.map((tier) => {
              const help = RELEVANCE_HELP[tier]
              return (
                <FilterChip
                  key={tier}
                  label={RELEVANCE_LABEL[tier]}
                  href={buildHref({ source: activeSource, min: tier })}
                  active={min === tier}
                  activeText="text-rga-green"
                  activeBorder="border-rga-green/60"
                  activeDot="bg-rga-green"
                  activeTick="border-rga-green/80"
                  popoverAccent="text-rga-green"
                  popoverBorder="border-rga-green/40"
                  helpTitle={help.title}
                  helpBody={help.body}
                  onNavigate={onChipNavigate}
                />
              )
            })}
          </SheetGroup>

          {/* Per-mode descriptions inline (no hover available on touch) */}
          <div className="flex flex-col gap-2 border-t border-text-muted/15 pt-5 font-mono text-[11px] leading-relaxed tracking-[0.02em] text-text-muted">
            <SheetHelpLine accent="SCAN" body="All intel at ★3 or better — the default floor." />
            <SheetHelpLine accent="TRACE" body="★4 and ★5 only — sharper signals, fewer items." />
            <SheetHelpLine accent="LOCK" body="★5 only — top-tier confirmed-relevant intel." />
            <p className="pt-1 text-text-muted/80">
              The <span className="text-rga-mod">★N</span> chip on each card is the AI relevance score for that item.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SheetGroup({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-rga-mod">
          {label}
        </span>
        <span className="text-[11px] leading-relaxed text-text-secondary/85">
          {description}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function SheetHelpLine({ accent, body }: { accent: string; body: string }) {
  return (
    <p>
      <span className="text-rga-green">{accent}</span>
      <span className="px-1 text-text-muted/50">·</span>
      <span className="text-text-secondary/80">{body}</span>
    </p>
  )
}

interface FilterChipProps {
  label: string
  href: string
  active: boolean
  activeText: string
  activeBorder: string
  activeDot: string
  activeTick: string
  /** Color the popover title in the chip's accent. */
  popoverAccent: string
  /** Color the popover border in the chip's accent. */
  popoverBorder: string
  helpTitle: string
  helpBody: string
  onNavigate: () => void
}

/**
 * A single filter chip. Hover (or keyboard focus) reveals a small
 * popover anchored below the chip with chip-specific help — the
 * popover content is themed in the chip's accent color so source
 * chips show their brand color, mode chips show mod-orange.
 *
 * Popover is CSS-driven (no JS state) — uses `group-hover` + a small
 * open delay to avoid accidental triggers. Click navigation works
 * uninterrupted; the popover never blocks the underlying Link.
 */
function FilterChip({
  label,
  href,
  active,
  activeText,
  activeBorder,
  activeDot,
  activeTick,
  popoverAccent,
  popoverBorder,
  helpTitle,
  helpBody,
  onNavigate,
}: FilterChipProps) {
  // Suppress the hover popover after a click so it doesn't stay stuck
  // visible while the user's cursor is still hovering the chip post-
  // navigation. Re-armed on pointer-leave so the next hover shows it
  // again. Without this, CSS `group-hover` would keep the popover open
  // until the user moves their cursor off the chip.
  const [popoverArmed, setPopoverArmed] = useState(true)
  return (
    <div
      className="group/chip relative"
      onPointerLeave={() => setPopoverArmed(true)}
    >
      <Link
        href={href}
        scroll={false}
        onClick={() => {
          setPopoverArmed(false)
          onNavigate()
        }}
        className={[
          'relative inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors sm:px-3 sm:py-1.5',
          active
            ? `${activeBorder} ${activeText} bg-bg-elevated`
            : 'border-text-muted/25 text-text-secondary hover:border-text-secondary/60 hover:text-text-primary',
        ].join(' ')}
      >
        {/* Corner ticks — only visible on the active chip */}
        {active && (
          <>
            <span aria-hidden className={['pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t', activeTick].join(' ')} />
            <span aria-hidden className={['pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t', activeTick].join(' ')} />
            <span aria-hidden className={['pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l', activeTick].join(' ')} />
            <span aria-hidden className={['pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r', activeTick].join(' ')} />
          </>
        )}
        <span
          aria-hidden
          className={[
            'inline-block h-1.5 w-1.5 rounded-[1px]',
            active ? activeDot : 'bg-text-muted/60',
          ].join(' ')}
        />
        <span>{label}</span>
      </Link>

      {/* Hover popover — anchored below the chip, themed in the chip's
          accent. CSS-driven via `group-hover/chip` + `group-focus-within/chip`
          for keyboard parity, but conditionally rendered so we can
          suppress it after a click without waiting for the user's cursor
          to leave the chip. */}
      {popoverArmed && (
      <div
        role="tooltip"
        className="pointer-events-none invisible absolute left-1/2 top-full z-50 mt-2 w-[min(280px,calc(100vw-1.5rem))] -translate-x-1/2 opacity-0 transition-all delay-150 duration-150 group-hover/chip:visible group-hover/chip:opacity-100 group-focus-within/chip:visible group-focus-within/chip:opacity-100"
      >
        <div
          className={[
            'relative border bg-[rgba(0,0,0,0.92)] px-3 py-2.5 font-mono leading-snug shadow-[0_10px_28px_-8px_rgba(0,0,0,0.9)] backdrop-blur-md',
            popoverBorder,
          ].join(' ')}
        >
          {/* Corner ticks matching active-chip language */}
          <span aria-hidden className={['pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t', activeTick].join(' ')} />
          <span aria-hidden className={['pointer-events-none absolute -top-px -right-px h-2 w-2 border-r border-t', activeTick].join(' ')} />
          <span aria-hidden className={['pointer-events-none absolute -bottom-px -left-px h-2 w-2 border-b border-l', activeTick].join(' ')} />
          <span aria-hidden className={['pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r', activeTick].join(' ')} />

          {/* Caret bridging the chip to the popover */}
          <span
            aria-hidden
            className={['pointer-events-none absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t bg-[rgba(0,0,0,0.92)]', popoverBorder].join(' ')}
          />

          <div className={['mb-1 text-[10px] uppercase tracking-[0.3em]', popoverAccent].join(' ')}>
            // {helpTitle}
          </div>
          <p className="text-[11px] leading-relaxed tracking-[0.02em] text-text-secondary">
            {helpBody}
          </p>
        </div>
      </div>
      )}
    </div>
  )
}
