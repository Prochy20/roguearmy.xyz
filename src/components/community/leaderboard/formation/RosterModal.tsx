'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { leaderboardAvatarSrc } from '../avatar'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface RosterModalProps {
  /** Whether the modal is currently open. */
  open: boolean
  /** Operatives above the caller, in rank order (lowest rank number = leader first). */
  entries: LeaderboardEntry[]
  /** Caller's current XP — used to compute the gap (DST) per row. */
  callerXp: number
  /** Caller's rank (informational, for header). */
  callerRank: number | null
  /** Threshold above which a row is rendered with the long-range warning. */
  longRangeThreshold?: number
  /** Pagination — show a LOAD MORE control if more entries exist server-side. */
  hasMore?: boolean
  /** Loading state for LOAD MORE. */
  isLoading?: boolean
  onClose: () => void
  onDesignate: (discordId: string) => void
  onLoadMore?: () => void
}

const DEFAULT_LONG_RANGE = 5000

/**
 * Modal for designating a POINT from the full board. Mobile: full-screen.
 * Desktop: centered overlay constrained to ~720px wide. Client-side filter
 * over the visible entries via the search input.
 *
 * Long-range picks (gap > threshold) get an inline magenta warning band
 * above the row, with the designate action labeled accordingly — picking
 * is still allowed.
 */
export function RosterModal({
  open,
  entries,
  callerXp,
  callerRank,
  longRangeThreshold = DEFAULT_LONG_RANGE,
  hasMore = false,
  isLoading = false,
  onClose,
  onDesignate,
  onLoadMore,
}: RosterModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.trim().toLowerCase()
    return entries.filter((e) => e.displayName.toLowerCase().includes(q))
  }, [entries, query])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Designate POINT from roster"
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-void/85 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex w-full max-w-[760px] flex-col border border-rga-cyan/25 bg-[rgba(8,8,10,0.97)] shadow-[0_0_64px_rgba(0,255,255,0.12)]">
        {/* Corner brackets — frame the modal explicitly */}
        <CornerSet />

        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan/80">
              <span aria-hidden className="inline-block h-1 w-3 bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
              <span>SELECT POINT</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">ROSTER ABOVE</span>
            </div>
            <h2
              className="font-display uppercase leading-tight tracking-[0.005em] text-text-primary"
              style={{ fontSize: 'clamp(22px, 3vw, 36px)' }}
            >
              ACQUIRE TARGET
            </h2>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted">
              {entries.length} OPS ABOVE
              {callerRank != null ? ` · CALLER · #${String(callerRank).padStart(3, '0')}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close roster"
            className="group/x flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(255,255,255,0.12)] bg-transparent font-mono text-text-secondary transition-all hover:border-rga-magenta/50 hover:bg-[rgba(255,0,255,0.06)] hover:text-rga-magenta"
          >
            <span aria-hidden className="text-lg leading-none">✕</span>
          </button>
        </header>

        {/* Search */}
        <div className="border-b border-[rgba(255,255,255,0.08)] px-5 py-4 sm:px-7">
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
              <span aria-hidden className="text-rga-green/80">{`>`}</span>
              <span>SCAN ROSTER</span>
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by codename…"
              className="border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.5)] px-3 py-2 font-mono text-sm tracking-wider text-text-primary placeholder:text-text-muted/60 focus:border-rga-cyan/60 focus:outline-none focus:shadow-[0_0_16px_rgba(0,255,255,0.15)]"
            />
          </label>
        </div>

        {/* List */}
        <div className="flex max-h-[60vh] flex-col overflow-y-auto sm:max-h-[520px]">
          {filtered.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <ul className="flex flex-col">
              {filtered.map((entry) => {
                const gap = Math.max(0, entry.xp - callerXp)
                const isLongRange = gap > longRangeThreshold
                return (
                  <RosterRow
                    key={entry.discordId}
                    entry={entry}
                    gap={gap}
                    isLongRange={isLongRange}
                    onDesignate={() => onDesignate(entry.discordId)}
                  />
                )
              })}
            </ul>
          )}

          {hasMore && (
            <div className="border-t border-[rgba(255,255,255,0.05)] px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoading}
                className="group/more flex w-full items-center justify-center gap-3 border border-dashed border-[rgba(255,255,255,0.12)] bg-transparent px-4 py-3 font-mono text-[10px] tracking-[0.4em] uppercase text-text-secondary transition-all hover:border-rga-cyan/40 hover:text-rga-cyan disabled:cursor-wait disabled:opacity-60"
              >
                <span aria-hidden className="text-rga-cyan/60 group-hover/more:text-rga-cyan">▾</span>
                <span>{isLoading ? 'LOADING…' : 'LOAD MORE'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <footer className="flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] px-5 py-3 font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted sm:px-7">
          <span>// ESC TO CANCEL</span>
          <span>SECURE · ENCRYPTED</span>
        </footer>
      </div>
    </div>
  )
}

function CornerSet() {
  return (
    <>
      {/* TL */}
      <span aria-hidden className="pointer-events-none absolute -top-[1px] -left-[1px] h-4 w-px bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      <span aria-hidden className="pointer-events-none absolute -top-[1px] -left-[1px] h-px w-4 bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      {/* TR */}
      <span aria-hidden className="pointer-events-none absolute -top-[1px] -right-[1px] h-4 w-px bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      <span aria-hidden className="pointer-events-none absolute -top-[1px] -right-[1px] h-px w-4 bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      {/* BL */}
      <span aria-hidden className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-4 w-px bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-px w-4 bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      {/* BR */}
      <span aria-hidden className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-4 w-px bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-px w-4 bg-rga-cyan shadow-[0_0_6px_#00FFFF]" />
    </>
  )
}

interface RosterRowProps {
  entry: LeaderboardEntry
  gap: number
  isLongRange: boolean
  onDesignate: () => void
}

function RosterRow({ entry, gap, isLongRange, onDesignate }: RosterRowProps) {
  return (
    <li className="border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
      {isLongRange && (
        <div className="flex items-center gap-2 border-l-2 border-rga-magenta bg-[rgba(40,0,40,0.4)] px-5 py-2 font-mono text-[9px] tracking-[0.35em] uppercase text-rga-magenta/90 sm:px-7">
          <span aria-hidden>◢</span>
          <span>LONG-RANGE POINT</span>
          <span className="text-text-muted">·</span>
          <span className="tabular-nums">{gap.toLocaleString()} XP GAP</span>
          <span className="text-text-muted">—</span>
          <span className="text-text-muted">CONSIDER A CLOSER MARKER</span>
        </div>
      )}

      <div className="group/row flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(0,255,255,0.03)] sm:gap-4 sm:px-7 sm:py-3.5">
        {/* Left rail tick */}
        <span
          aria-hidden
          className={
            'h-9 w-px transition-colors ' +
            (isLongRange ? 'bg-rga-magenta/50 group-hover/row:bg-rga-magenta' : 'bg-rga-cyan/20 group-hover/row:bg-rga-cyan/70')
          }
        />

        {/* Rank */}
        <div className="w-12 shrink-0 font-mono text-sm tracking-wider text-text-secondary tabular-nums sm:w-14">
          #{String(entry.rank).padStart(3, '0')}
        </div>

        {/* Avatar */}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-[rgba(255,255,255,0.12)] sm:h-10 sm:w-10">
          <Image
            src={leaderboardAvatarSrc(entry)}
            alt={entry.displayName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>

        {/* Identity */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="truncate font-display text-sm uppercase tracking-[0.005em] text-text-primary sm:text-base">
            {entry.displayName}
          </div>
          <div className="flex items-baseline gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-text-muted">
            <span>LV {String(entry.level).padStart(2, '0')}</span>
            <span>·</span>
            <span className="tabular-nums">{entry.xp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Distance */}
        <div className="hidden shrink-0 flex-col items-end font-mono sm:flex">
          <span className="text-[8px] tracking-[0.3em] uppercase text-text-muted">DST</span>
          <span
            className={
              'text-sm tabular-nums ' +
              (isLongRange ? 'text-rga-magenta [text-shadow:0_0_8px_rgba(255,0,255,0.4)]' : 'text-rga-green [text-shadow:0_0_8px_rgba(0,255,65,0.4)]')
            }
          >
            {gap.toLocaleString()}
          </span>
        </div>

        {/* Designate button */}
        <button
          type="button"
          onClick={onDesignate}
          className={
            'group/des shrink-0 border bg-transparent px-3 py-2 font-mono text-[10px] tracking-[0.35em] uppercase transition-all sm:px-4 ' +
            (isLongRange
              ? 'border-rga-magenta/40 text-rga-magenta hover:bg-[rgba(255,0,255,0.08)] hover:border-rga-magenta hover:[text-shadow:0_0_10px_rgba(255,0,255,0.5)]'
              : 'border-rga-green/40 text-rga-green hover:bg-[rgba(0,255,65,0.08)] hover:border-rga-green hover:[text-shadow:0_0_10px_rgba(0,255,65,0.5)]')
          }
        >
          <span>{isLongRange ? 'PICK ANYWAY' : 'DESIGNATE'}</span>
          <span aria-hidden className="ml-2 inline-block transition-transform group-hover/des:translate-x-0.5">◢</span>
        </button>
      </div>
    </li>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-12 sm:px-7">
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
        // NO MATCH
      </div>
      <p className="font-mono text-sm leading-relaxed text-text-secondary">
        <span className="text-rga-magenta">{`>`}</span> NO OPERATIVES MATCH{' '}
        <span className="text-text-primary">&ldquo;{query}&rdquo;</span>. ADJUST THE SCAN.
      </p>
    </div>
  )
}
