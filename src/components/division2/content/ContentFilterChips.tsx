'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import { BracketTooltip } from '@/components/ui/BracketTooltip'
import type { ContentSource } from '@/lib/division2/content.server'

/** Match the rga-overlay-out animation duration in globals.css. */
const SHEET_CLOSE_DURATION = 200

export const FILTER_SCROLL_KEY = 'd2-content-filter-scroll'

const SOURCES: ContentSource[] = ['YOUTUBE', 'REDDIT', 'UBISOFT']
const RELEVANCE_TIERS = [3, 4, 5] as const
type RelevanceTier = (typeof RELEVANCE_TIERS)[number]
const DEFAULT_MIN: RelevanceTier = 3

const RELEVANCE_LABEL: Record<RelevanceTier, string> = {
  3: 'SCAN',
  4: 'TRACE',
  5: 'LOCK',
}

const RELEVANCE_HELP: Record<RelevanceTier, { title: string; body: string }> = {
  3: {
    title: 'SCAN — broad sweep',
    body: "All intel at ★3 or better. The default floor — show me everything that's at least decent.",
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

/** Tailwind needs statically-analyzable class names — no `text-${color}` interpolation. */
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
    helpBody:
      'Creator content — channels covering Division 2 builds, guides, news, patch breakdowns.',
  },
  REDDIT: {
    activeText: 'text-source-reddit',
    activeBorder: 'border-source-reddit/60',
    activeDot: 'bg-source-reddit',
    activeTick: 'border-source-reddit/80',
    short: 'RD',
    long: 'REDDIT',
    helpTitle: 'REDDIT',
    helpBody:
      'Community discussion — r/thedivision and related subs. Threads, AMAs, bug reports, theorycrafting.',
  },
  UBISOFT: {
    activeText: 'text-source-ubisoft',
    activeBorder: 'border-source-ubisoft/60',
    activeDot: 'bg-source-ubisoft',
    activeTick: 'border-source-ubisoft/80',
    short: 'UB',
    long: 'UBISOFT',
    helpTitle: 'UBISOFT',
    helpBody:
      'Official source — patch notes, season briefings, news updates straight from Massive Entertainment.',
  },
}

interface ContentFilterChipsProps {
  activeSource: ContentSource | undefined
  activeMin: number
}

/** Omits params that match their default so the URL stays clean. */
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

export function ContentFilterChips({ activeSource, activeMin }: ContentFilterChipsProps) {
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

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    },
    [],
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const min = (RELEVANCE_TIERS as readonly number[]).includes(activeMin)
    ? (activeMin as RelevanceTier)
    : DEFAULT_MIN

  const handleChipNavigate = useCallback(() => {
    try {
      window.sessionStorage.setItem(FILTER_SCROLL_KEY, String(Date.now()))
    } catch {}
    closeSheet()
  }, [closeSheet])

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

  const activeSourceLabel = activeSource ? SOURCE_CHIP_CLASSES[activeSource].short : 'ALL'
  const activeModeLabel = RELEVANCE_LABEL[min]

  return (
    <section className="flex flex-col">
      <div className="flex h-20 items-center md:hidden">
        <MobileFilterTrigger
          sourceLabel={activeSourceLabel}
          modeLabel={activeModeLabel}
          onOpen={openSheet}
        />
      </div>

      {/* h-20 matches the chrome MENU button height. */}
      <div className="hidden min-h-20 flex-wrap items-center gap-x-2 gap-y-2 py-2 md:flex">
        <div className="flex items-center gap-2 pr-1">
          <span className="font-mono text-[10px] tracking-[0.4em] text-game-d2">SEC_02</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted/70">
            // FILTER
          </span>
        </div>

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

        <span aria-hidden className="hidden h-4 w-px bg-text-muted/20 sm:inline-block" />

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

      {/* Portaled to body — the sticky bar's `backdrop-blur-md` promotes it to
          a containing block for fixed descendants, trapping `fixed inset-0`
          to the sticky's height. */}
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
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t border-rga-green/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t border-rga-green/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-rga-green/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-rga-green/70"
      />

      <span>{sourceLabel}</span>
      <span aria-hidden className="text-text-muted/60">
        ·
      </span>
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
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-text-muted/15 px-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.4em] text-game-d2">SEC_02</span>
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
          <span
            aria-hidden
            className="pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t border-rga-green/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t border-rga-green/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-rga-green/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-rga-green/80"
          />
          <X size={14} strokeWidth={1.8} aria-hidden />
          <span>CLOSE</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-7 pb-12 sm:px-7">
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

          {/* Inline descriptions — no hover available on touch. */}
          <div className="flex flex-col gap-2 border-t border-text-muted/15 pt-5 font-mono text-[11px] leading-relaxed tracking-[0.02em] text-text-muted">
            <SheetHelpLine accent="SCAN" body="All intel at ★3 or better — the default floor." />
            <SheetHelpLine accent="TRACE" body="★4 and ★5 only — sharper signals, fewer items." />
            <SheetHelpLine accent="LOCK" body="★5 only — top-tier confirmed-relevant intel." />
            <p className="pt-1 text-text-muted/80">
              The <span className="text-game-d2">★N</span> chip on each card is the AI relevance
              score for that item.
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
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-game-d2">
          {label}
        </span>
        <span className="text-[11px] leading-relaxed text-text-secondary/85">{description}</span>
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
  popoverAccent: string
  popoverBorder: string
  helpTitle: string
  helpBody: string
  onNavigate: () => void
}

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
  const [popoverArmed, setPopoverArmed] = useState(true)
  return (
    <BracketTooltip
      armed={popoverArmed}
      onPointerLeave={() => setPopoverArmed(true)}
      title={helpTitle}
      body={helpBody}
      accentText={popoverAccent}
      accentBorder={popoverBorder}
      cornerTick={activeTick}
      widthClass="w-[min(280px,calc(100vw-1.5rem))]"
    >
      <Link
        href={href}
        scroll={false}
        onClick={(e) => {
          setPopoverArmed(false)
          onNavigate()
          // Mouse-click focus on the <a> would leave `group-focus-within/tip`
          // matching after popoverArmed re-arms, keeping the popover visible.
          ;(e.currentTarget as HTMLAnchorElement).blur()
        }}
        className={[
          'relative inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors sm:px-3 sm:py-1.5',
          active
            ? `${activeBorder} ${activeText} bg-bg-elevated`
            : 'border-text-muted/25 text-text-secondary hover:border-text-secondary/60 hover:text-text-primary',
        ].join(' ')}
      >
        {active && (
          <>
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute -top-px -left-px h-1.5 w-1.5 border-l border-t',
                activeTick,
              ].join(' ')}
            />
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute -top-px -right-px h-1.5 w-1.5 border-r border-t',
                activeTick,
              ].join(' ')}
            />
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l',
                activeTick,
              ].join(' ')}
            />
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r',
                activeTick,
              ].join(' ')}
            />
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
    </BracketTooltip>
  )
}
