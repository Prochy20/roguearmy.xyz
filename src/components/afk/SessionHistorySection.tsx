'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { loadMoreHistory } from '@/app/(frontend)/(with-chrome)/afk/actions'
import type { AshleyError } from '@/lib/api/server'
import { normalizeAfkHistoryPage, type AfkHistoryPage, type AfkRecord } from './types'
import { SessionHistoryTable } from './SessionHistoryTable'
import { SessionHistoryEmpty } from './SessionHistoryEmpty'

interface SessionHistorySectionProps {
  initialItems: AfkRecord[]
  initialTotal: number
  initialOffset: number
  joinedAt: string | null
  /** True when the viewer is currently AFK — the active record is filtered
   * out of the visible list and subtracted from the displayed total since
   * SEC_02 already owns the live session display. */
  currentlyAfk: boolean
}

export function SessionHistorySection({
  initialItems,
  initialTotal,
  initialOffset,
  joinedAt,
  currentlyAfk,
}: SessionHistorySectionProps) {
  const [items, setItems] = useState<AfkRecord[]>(initialItems)
  const [offset, setOffset] = useState<number>(initialOffset + initialItems.length)
  const [total, setTotal] = useState<number>(initialTotal)
  const [loadError, setLoadError] = useState<AshleyError | null>(null)
  const [pending, startTransition] = useTransition()

  const closedItems = items.filter((i) => !i.isValid)
  const displayedTotal = Math.max(0, total - (currentlyAfk ? 1 : 0))
  const hasMore = closedItems.length < displayedTotal

  const handleLoadMore = () => {
    if (pending || !hasMore) return
    startTransition(async () => {
      const result = await loadMoreHistory(offset)
      if (!result.ok) {
        setLoadError(result.error)
        return
      }
      const page: AfkHistoryPage = normalizeAfkHistoryPage(result.data)
      setItems((prev) => [...prev, ...page.items])
      setOffset((prev) => prev + page.items.length)
      setTotal(page.total)
      setLoadError(null)
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <Header total={displayedTotal} />
      {closedItems.length === 0 ? (
        <SessionHistoryEmpty joinedAt={joinedAt} />
      ) : (
        <>
          <SessionHistoryTable items={closedItems} />
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={pending}
              className={cn(
                'self-center border border-[rgba(255,255,255,0.1)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted hover:border-status-error/30 hover:text-status-error',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {pending ? 'LOADING…' : `LOAD MORE · ${displayedTotal - closedItems.length} REMAINING`}
            </button>
          )}
          {loadError && (
            <p className="self-center font-mono text-[10px] uppercase tracking-[0.3em] text-status-error">
              // COMMS DOWN · UPSTREAM REJECTED · TRY AGAIN
            </p>
          )}
        </>
      )}
      <Footer />
    </section>
  )
}

function Header({ total }: { total: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-status-error">
          SEC_03
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          // CLOSED AFK SESSIONS
        </span>
      </div>
      <h2
        className="m-0 font-display uppercase leading-[0.9] text-text-primary"
        style={{ fontSize: 'clamp(40px, 6vw, 88px)', letterSpacing: '0.01em' }}
      >
        AFK HISTORY
      </h2>
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-muted">
        {total} {total === 1 ? 'SESSION' : 'SESSIONS'} LOGGED
      </span>
    </div>
  )
}

function Footer() {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
      // NEWEST FIRST · CLOSED WHEN YOU RETURN ACTIVE
    </p>
  )
}
