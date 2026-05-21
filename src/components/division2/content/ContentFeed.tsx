'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FailRow } from '@/components/ui/FailRow'
import { ContentCard } from './ContentCard'
import { ContentSkeleton } from './ContentSkeleton'
import { ContentEndMarker } from './ContentEndMarker'
import { FILTER_SCROLL_KEY } from './ContentFilterChips'
import { loadMoreContent } from '@/app/(frontend)/(with-chrome)/division-2/content/actions'
import { substituteTokens } from '@/lib/division2/content.format'
import type { ContentArticle, ContentList, ContentSource } from '@/lib/division2/content.server'
import type { AshleyErrorCode } from '@/lib/api/server'

interface ContentFeedProps {
  initial: ContentList
  source: ContentSource | undefined
  minRelevance: number
  /** Must match the server's fetch limit so offsets align. */
  limit: number
  endOfFeedLabel: string
}

interface FailState {
  code: AshleyErrorCode
  status?: number
}

const SESSION_KEY_PREFIX = 'd2-content-feed:'
const SESSION_TTL_MS = 10 * 60 * 1000

interface SessionSnapshot {
  items: ContentArticle[]
  offset: number
  total: number
  scrollY: number
  savedAt: number
}

function sessionKey(source: ContentSource | undefined, min: number): string {
  return `${SESSION_KEY_PREFIX}${source ?? 'all'}:r${min}`
}

function readSnapshot(source: ContentSource | undefined, min: number): SessionSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(sessionKey(source, min))
    if (!raw) return null
    const snap = JSON.parse(raw) as SessionSnapshot
    if (Date.now() - snap.savedAt > SESSION_TTL_MS) return null
    return snap
  } catch {
    return null
  }
}

function writeSnapshot(
  source: ContentSource | undefined,
  min: number,
  snap: SessionSnapshot,
): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(sessionKey(source, min), JSON.stringify(snap))
  } catch {
    // quota / disabled — back-nav silently won't restore.
  }
}

/**
 * Attach the IntersectionObserver only after snapshot restore completes,
 * otherwise the sentinel can land in-viewport during restore and double-load.
 */
export function ContentFeed({
  initial,
  source,
  minRelevance,
  limit,
  endOfFeedLabel,
}: ContentFeedProps) {
  const [items, setItems] = useState<ContentArticle[]>(initial.items)
  const [offset, setOffset] = useState<number>(initial.items.length)
  const [total, setTotal] = useState<number>(initial.total)
  const [done, setDone] = useState<boolean>(
    initial.items.length === 0 || initial.items.length >= initial.total,
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fail, setFail] = useState<FailState | null>(null)
  const [observerReady, setObserverReady] = useState<boolean>(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const renderNow = useMemo(() => Date.now(), [])
  const renderedItems = useMemo(() => {
    const seen = new Set<string>()
    const out: ContentArticle[] = []
    for (const article of items) {
      if (seen.has(article.id)) continue
      seen.add(article.id)
      out.push(article)
    }
    return out
  }, [items])
  useLayoutEffect(() => {
    let filterScrollHandled = false
    try {
      const raw = window.sessionStorage.getItem(FILTER_SCROLL_KEY)
      if (raw) {
        window.sessionStorage.removeItem(FILTER_SCROLL_KEY)
        const time = Number(raw)
        if (Number.isFinite(time) && Date.now() - time < 3000) {
          const bar = document.querySelector<HTMLElement>('[data-d2-filter-bar]')
          bar?.scrollIntoView({
            block: 'start',
            behavior: 'instant' as ScrollBehavior,
          })
          filterScrollHandled = true
        }
      }
    } catch {}

    if (filterScrollHandled) {
      setObserverReady(true)
      return
    }

    const snap = readSnapshot(source, minRelevance)
    if (snap && snap.total === initial.total && snap.items.length > initial.items.length) {
      setItems(snap.items)
      setOffset(snap.offset)
      setTotal(snap.total)
      setDone(snap.items.length >= snap.total)
      // Two rAFs let appended items lay out before we scroll;
      // 'instant' overrides the site-wide `scroll-behavior: smooth`.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: snap.scrollY, behavior: 'instant' as ScrollBehavior })
          setObserverReady(true)
        })
      })
    } else {
      setObserverReady(true)
    }
  }, [source, minRelevance, initial.total, initial.items.length])

  useEffect(() => {
    if (!observerReady) return
    const save = () => {
      writeSnapshot(source, minRelevance, {
        items,
        offset,
        total,
        scrollY: window.scrollY,
        savedAt: Date.now(),
      })
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save()
    }
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [items, offset, total, source, minRelevance, observerReady])

  const loadMore = useCallback(async () => {
    if (isLoading || done || fail) return
    setIsLoading(true)
    const result = await loadMoreContent(source, offset, limit, String(minRelevance))
    if (!result.ok) {
      setFail({ code: result.error.code, status: result.error.status })
      setIsLoading(false)
      return
    }
    const batch = result.data
    // Ashley's offset pagination can repeat ids across adjacent pages
    // when new items are ingested between requests.
    setItems((prev) => {
      const seen = new Set(prev.map((a) => a.id))
      const additions = batch.items.filter((a) => !seen.has(a.id))
      return additions.length > 0 ? [...prev, ...additions] : prev
    })
    setOffset((prev) => prev + batch.items.length)
    setTotal(batch.total)
    if (batch.items.length < limit || batch.items.length === 0) {
      setDone(true)
    }
    setIsLoading(false)
  }, [isLoading, done, fail, source, offset, limit, minRelevance])

  const retry = useCallback(() => {
    setFail(null)
    void loadMore()
  }, [loadMore])

  useEffect(() => {
    if (!observerReady || done || fail) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '300px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [observerReady, done, fail, loadMore])

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
        {renderedItems.map((article) => (
          <ContentCard key={article.id} article={article} now={renderNow} />
        ))}
        {isLoading && (
          <>
            <ContentSkeleton />
            <ContentSkeleton />
          </>
        )}
      </div>

      {fail && (
        <div className="flex flex-col gap-3">
          <FailRow code={fail.code} status={fail.status} returnTo="/division-2/content" />
          <button
            type="button"
            onClick={retry}
            className="self-start border border-rga-magenta/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-rga-magenta transition-colors hover:bg-rga-magenta/10"
          >
            // RETRY
          </button>
        </div>
      )}

      {!fail && !done && !isLoading && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}

      {done && items.length > 0 && (
        <ContentEndMarker label={substituteTokens(endOfFeedLabel, { count: items.length })} />
      )}
    </div>
  )
}
