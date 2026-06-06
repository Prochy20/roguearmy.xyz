'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useBookmarks } from '@/contexts/BookmarksContext'
import {
  bookmarkKey,
  bookmarkTargetToArticle,
  type BookmarkWithTarget,
} from '@/lib/bookmarks'
import { ArticleCardCompact } from '@/components/article/ArticleCardCompact'
import { BriefingCard } from '@/components/division2/briefings/BriefingCard'
import { getReadStatus, type ReadStatus } from '@/components/article/ReadStatusIndicator'
import { CyberCorners } from '@/components/ui/CyberCorners'

type FilterValue = 'all' | 'in_progress' | 'completed'

interface ProgressRecord {
  targetType: 'article' | 'briefing'
  targetId: string
  progress: number
  completed: boolean
}

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'Reading' },
  { value: 'completed', label: 'Done' },
]

// `in_progress` filter merges `unread` + `in_progress` — a bookmark is
// either finished or not; "started" isn't a useful axis here.
function matchesFilter(status: ReadStatus, filter: FilterValue): boolean {
  if (filter === 'all') return true
  if (filter === 'completed') return status === 'completed'
  return status === 'unread' || status === 'in_progress'
}

export function BookmarksList() {
  const { bookmarks, isLoading } = useBookmarks()
  const [filter, setFilter] = useState<FilterValue>('all')
  const progressMap = useProgressMap(bookmarks)

  const counts = useMemo(() => {
    const completed = bookmarks.filter((b) => {
      const p = progressMap.get(bookmarkKey(b.targetType, b.target.id))
      return getReadStatus(p?.progress, p?.completed) === 'completed'
    }).length
    return {
      all: bookmarks.length,
      completed,
      in_progress: bookmarks.length - completed,
    }
  }, [bookmarks, progressMap])

  const filtered = useMemo(
    () =>
      bookmarks.filter((b) => {
        const p = progressMap.get(bookmarkKey(b.targetType, b.target.id))
        return matchesFilter(getReadStatus(p?.progress, p?.completed), filter)
      }),
    [bookmarks, progressMap, filter],
  )

  return (
    <>
      {bookmarks.length > 0 && (
        <div className="mb-6">
          <FilterTabs filter={filter} onChange={setFilter} counts={counts} />
        </div>
      )}

      {isLoading ? (
        <LoadingGrid />
      ) : bookmarks.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <FilteredEmptyState onReset={() => setFilter('all')} filter={filter} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((bookmark, index) => renderCard(bookmark, index, progressMap))}
        </div>
      )}
    </>
  )
}

function renderCard(
  bookmark: BookmarkWithTarget,
  index: number,
  progressMap: Map<string, ProgressRecord>,
) {
  const key = bookmarkKey(bookmark.targetType, bookmark.target.id)
  const progress = progressMap.get(key) || null
  const cardProgress = progress
    ? { progress: progress.progress, completed: progress.completed }
    : null

  if (bookmark.targetType === 'article') {
    const article = bookmarkTargetToArticle(bookmark.target)
    if (!article) return null
    return (
      <ArticleCardCompact
        key={key}
        article={article}
        index={index}
        progress={cardProgress}
        isAuthenticated
      />
    )
  }

  return (
    <BriefingCard
      key={key}
      briefing={{
        id: bookmark.target.id,
        topic: 'division-2',
        frequency: bookmark.target.frequency,
        periodStart: bookmark.target.periodStart,
        periodEnd: bookmark.target.periodEnd,
        title: bookmark.target.title,
        perex: bookmark.target.perex,
        highlights: [],
        thumbnailUrl: bookmark.target.thumbnailUrl,
        articleCount: bookmark.target.articleCount,
        articleIds: [],
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.createdAt,
        slug: bookmark.target.slug,
        canonicalPath: bookmark.target.canonicalPath,
      }}
      progress={cardProgress}
      locked={bookmark.locked}
    />
  )
}

function FilterTabs({
  filter,
  onChange,
  counts,
}: {
  filter: FilterValue
  onChange: (next: FilterValue) => void
  counts: Record<FilterValue, number>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_TABS.map((tab) => {
        const isActive = filter === tab.value
        const count = counts[tab.value]
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-[0.28em] transition-colors',
              isActive
                ? 'border-rga-green/60 bg-rga-green/[0.08] text-rga-green'
                : 'border-white/15 bg-white/[0.02] text-text-secondary hover:border-white/30 hover:text-white',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'inline-flex h-4 min-w-[16px] items-center justify-center px-1 text-[10px] tabular-nums',
                isActive ? 'bg-rga-green/25' : 'bg-white/10',
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse border border-white/10 bg-[rgba(0,0,0,0.4)]">
          <div className="aspect-16/9 bg-white/[0.03]" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 bg-white/[0.05]" />
            <div className="h-3 w-full bg-white/[0.03]" />
            <div className="h-3 w-1/3 bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <CyberCorners color="cyan" size="lg" glow>
      <div className="flex flex-col items-center gap-7 border border-rga-cyan/25 bg-[rgba(0,0,0,0.45)] px-8 py-20 text-center sm:px-12 sm:py-28">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-rga-cyan">
          // NO RECORD
        </div>
        <h3
          className="font-display uppercase leading-[0.9] text-text-primary"
          style={{
            fontSize: 'clamp(32px, 6vw, 80px)',
            textShadow: '0 0 32px rgba(0,255,255,0.25)',
          }}
        >
          VAULT EMPTY
        </h3>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Tap the bookmark icon on any article or briefing to stash it here.
          Filter by reading status to surface what&apos;s still on your list.
        </p>
        <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-rga-cyan opacity-70">
          // AWAITING · FIRST SAVE
        </div>
      </div>
    </CyberCorners>
  )
}

function FilteredEmptyState({
  filter,
  onReset,
}: {
  filter: FilterValue
  onReset: () => void
}) {
  const label = filter === 'completed' ? 'finished' : 'in-progress'
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="mb-3 text-text-secondary/70">No {label} bookmarks.</p>
      <button
        type="button"
        onClick={onReset}
        className="font-mono text-xs uppercase tracking-[0.28em] text-rga-cyan transition-colors hover:text-white"
      >
        Show all
      </button>
    </div>
  )
}

function useProgressMap(bookmarks: BookmarkWithTarget[]) {
  const [progressMap, setProgressMap] = useState<Map<string, ProgressRecord>>(
    () => new Map(),
  )

  // Stable string key over (targetType, targetId) pairs catches swap-in-place
  // (remove A + add B) where length stays constant.
  const signature = useMemo(
    () =>
      bookmarks.map((b) => bookmarkKey(b.targetType, b.target.id)).join('|'),
    [bookmarks],
  )

  useEffect(() => {
    if (signature === '') {
      setProgressMap(new Map())
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/member/read-progress')
        if (!response.ok) return
        const data = (await response.json()) as { progress: ProgressRecord[] }
        if (cancelled) return
        const map = new Map<string, ProgressRecord>()
        for (const record of data.progress) {
          map.set(bookmarkKey(record.targetType, record.targetId), record)
        }
        setProgressMap(map)
      } catch (error) {
        console.error('Failed to fetch read progress:', error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [signature])

  return progressMap
}
