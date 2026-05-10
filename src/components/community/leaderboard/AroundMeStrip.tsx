'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { leaderboardAvatarSrc } from './avatar'
import { getAroundMe } from '@/app/(frontend)/(with-chrome)/leaderboard/actions'
import type { AshleyError } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface AroundMeStripProps {
  myRank: number
  myDiscordId: string
}

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; entries: LeaderboardEntry[] }
  | { kind: 'fail'; error: AshleyError }

/**
 * Mini-table of ranks `myRank-2 .. myRank+2`, fetched lazily on first mount.
 * Used inside the expanded sticky rank bar to give off-list users their
 * competitive cohort.
 */
export function AroundMeStrip({ myRank, myDiscordId }: AroundMeStripProps) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await getAroundMe(myRank)
      if (cancelled) return
      if (result.ok) setState({ kind: 'ok', entries: result.data })
      else setState({ kind: 'fail', error: result.error })
    })()
    return () => {
      cancelled = true
    }
  }, [myRank])

  if (state.kind === 'loading') {
    return (
      <div className="flex h-32 items-center justify-center font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
        <span className="inline-flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-[1px] bg-rga-cyan shadow-[0_0_8px_#00FFFF] animate-pulse"
          />
          // LOADING COHORT…
        </span>
      </div>
    )
  }

  if (state.kind === 'fail') {
    return (
      <div className="flex items-center gap-3 border-t border-[rgba(255,0,255,0.2)] bg-[rgba(255,0,255,0.04)] px-4 py-4 font-mono text-[10px] tracking-[0.3em] uppercase text-rga-magenta sm:px-6">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-[1px] bg-rga-magenta shadow-[0_0_8px_#FF00FF]"
        />
        <span>
          // COHORT UNAVAILABLE
          {state.error.status ? ` — CODE ${state.error.status}` : ''}
        </span>
      </div>
    )
  }

  if (state.entries.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
        // NO ENTRIES IN THIS BAND
      </div>
    )
  }

  return (
    <ul className="divide-y divide-[rgba(255,255,255,0.05)] border-t border-[rgba(255,255,255,0.08)]">
      {state.entries.map((entry) => {
        const isMe = entry.discordId === myDiscordId
        return (
          <li
            key={entry.discordId}
            className={
              'grid grid-cols-[60px_1fr_auto_auto] items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6 sm:py-3 ' +
              (isMe ? 'bg-[rgba(0,255,65,0.06)]' : '')
            }
          >
            <div
              className={
                'font-mono tabular-nums text-sm ' +
                (isMe ? 'text-rga-green' : 'text-text-secondary')
              }
            >
              {`#${String(entry.rank).padStart(2, '0')}`}
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden border border-[rgba(255,255,255,0.1)]">
                <Image
                  src={leaderboardAvatarSrc(entry)}
                  alt={entry.displayName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <span
                className={
                  'truncate font-display uppercase text-sm leading-tight sm:text-base ' +
                  (isMe ? 'text-rga-green' : 'text-text-primary')
                }
              >
                {entry.displayName}
              </span>
            </div>
            <div
              className={
                'font-display tabular-nums text-base leading-none sm:text-lg ' +
                (isMe ? 'text-rga-green' : 'text-rga-cyan')
              }
            >
              {String(entry.level).padStart(2, '0')}
            </div>
            <div className="font-mono tabular-nums text-xs text-text-secondary sm:text-sm">
              {entry.xp.toLocaleString()}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

