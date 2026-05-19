'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FailRow } from '@/components/shared/FailRow'
import { ContentCard } from './ContentCard'
import { ContentSkeleton } from './ContentSkeleton'
import { ContentEndMarker } from './ContentEndMarker'
import { loadMoreContent } from '@/app/(frontend)/(with-chrome)/division-2/content/actions'
import { substituteTokens } from '@/lib/division2/content.format'
import type {
  ContentArticle,
  ContentList,
  ContentSource,
} from '@/lib/division2/content.server'
import type { AshleyErrorCode } from '@/lib/api/server'

interface ContentFeedProps {
  /** First batch + total + offset, server-rendered. */
  initial: ContentList
  /** Active source filter. Used in cache key + session-storage key. */
  source: ContentSource | undefined
  /** Page size — must match the server's fetch limit so offsets align. */
  limit: number
  /** End-of-feed copy template (CMS-driven), e.g. `// END OF FEED · {COUNT} ITEMS`. */
  endOfFeedLabel: string
}

interface FailState {
  code: AshleyErrorCode
  status?: number
}

const SESSION_KEY_PREFIX = 'd2-content-feed:'
const SESSION_TTL_MS = 10 * 60 * 1000 // 10 minutes

interface SessionSnapshot {
  items: ContentArticle[]
  offset: number
  total: number
  scrollY: number
  savedAt: number
}

function sessionKey(source: ContentSource | undefined): string {
  return `${SESSION_KEY_PREFIX}${source ?? 'all'}`
}

function readSnapshot(source: ContentSource | undefined): SessionSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(sessionKey(source))
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
  snap: SessionSnapshot,
): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(sessionKey(source), JSON.stringify(snap))
  } catch {
    // sessionStorage quota or disabled — silently skip; back-nav just
    // won't restore, which is the same as a fresh navigation.
  }
}

/**
 * Client component. Manages the appended list, IntersectionObserver-driven
 * loadMore, and sessionStorage-backed back-nav restoration.
 *
 * Restore ordering matters: hydrate appended state from session FIRST, then
 * restore scroll, THEN attach the IntersectionObserver. Attaching the
 * observer before restore would race against the scroll restore (sentinel
 * lands in viewport → loadMore fires → double-load).
 */
export function ContentFeed({
  initial,
  source,
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
  // Memoized "now" so timeago strings are stable across re-renders of this
  // feed instance — but refreshed when filters change (key on the parent).
  const renderNow = useMemo(() => Date.now(), [])

  // ── sessionStorage restore on mount ────────────────────────────────────
  // Runs once per filter change. If the saved snapshot is fresh AND its
  // `total` matches the server-rendered total, restore the appended list
  // and the scroll position. Otherwise fall through with the SSR'd initial.
  useEffect(() => {
    const snap = readSnapshot(source)
    if (snap && snap.total === initial.total && snap.items.length > initial.items.length) {
      setItems(snap.items)
      setOffset(snap.offset)
      setTotal(snap.total)
      setDone(snap.items.length >= snap.total)
      // Restore scroll after paint settles. Use requestAnimationFrame twice
      // to ensure the list has laid out before we scroll.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: snap.scrollY, behavior: 'auto' })
          setObserverReady(true)
        })
      })
    } else {
      setObserverReady(true)
    }
    // We intentionally key on `source` only — filter change triggers a full
    // remount via the parent's `key` prop, so this effect runs cleanly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  // ── Save snapshot before unload + on every items/offset change ─────────
  useEffect(() => {
    if (!observerReady) return
    const save = () => {
      writeSnapshot(source, {
        items,
        offset,
        total,
        scrollY: window.scrollY,
        savedAt: Date.now(),
      })
    }
    // Save on tab hide (covers external link click → external tab → back).
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save()
    }
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [items, offset, total, source, observerReady])

  // ── loadMore action ────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoading || done || fail) return
    setIsLoading(true)
    const result = await loadMoreContent(source, offset, limit)
    if (!result.ok) {
      setFail({ code: result.error.code, status: result.error.status })
      setIsLoading(false)
      return
    }
    const batch = result.data
    setItems((prev) => [...prev, ...batch.items])
    setOffset((prev) => prev + batch.items.length)
    setTotal(batch.total)
    if (batch.items.length < limit || batch.items.length === 0) {
      setDone(true)
    }
    setIsLoading(false)
  }, [isLoading, done, fail, source, offset, limit])

  const retry = useCallback(() => {
    setFail(null)
    // Caller's next observer fire will re-trigger loadMore. Force one now
    // for instant retry feel.
    void loadMore()
  }, [loadMore])

  // ── IntersectionObserver ───────────────────────────────────────────────
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
        {items.map((article) => (
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
          <FailRow
            code={fail.code}
            status={fail.status}
            returnTo="/division-2/content"
          />
          <button
            type="button"
            onClick={retry}
            className="self-start border border-rga-magenta/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-rga-magenta transition-colors hover:bg-rga-magenta/10"
          >
            // RETRY
          </button>
        </div>
      )}

      {!fail && !done && !isLoading && (
        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      )}

      {done && items.length > 0 && (
        <ContentEndMarker
          label={substituteTokens(endOfFeedLabel, { count: items.length })}
        />
      )}
    </div>
  )
}
