'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { AroundMeStrip } from './AroundMeStrip'
import type { AshleyError } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface StickyRankBarProps {
  /** Caller's own ranked entry — null when they have no XP yet, fail set when the fetch broke. */
  me: LeaderboardEntry | null
  /** Configured label for the caller's current level (e.g. "VETERAN"), or null when no label exists. */
  levelLabel: string | null
  /** Configured label for the caller's next level, or null when no next level / no label. */
  nextLevelLabel: string | null
  fail: AshleyError | null
}

/**
 * Bottom-pinned bar showing the caller's rank. Click to expand a 5-around-me
 * strip; the strip lazy-fetches via the getAroundMe server action.
 *
 * Degrades to a soft re-login or muted state when the me-fetch fails so the
 * bar still gives signal even with upstream issues.
 */
export function StickyRankBar({ me, levelLabel, nextLevelLabel, fail }: StickyRankBarProps) {
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) return
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setExpanded(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [expanded])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  // Three render branches based on (fail, me) state.
  if (fail) return <FailBar fail={fail} />
  if (!me) return <NoXpBar />

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-6 sm:pb-5"
    >
      <div className="pointer-events-auto w-full max-w-[820px]">
        <div
          className={
            'overflow-hidden border border-b-0 border-rga-green/30 bg-[rgba(0,0,0,0.92)] backdrop-blur-md transition-[max-height,opacity] duration-300 ease-out ' +
            (expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
          }
          aria-hidden={!expanded}
        >
          <div className="border-b border-[rgba(0,255,65,0.15)] bg-[rgba(0,255,65,0.04)] px-4 py-2.5 font-mono text-[9px] tracking-[0.4em] uppercase text-rga-green sm:px-6">
            // COHORT · 5-ROW WINDOW
          </div>
          <AroundMeStrip myRank={me.rank} myDiscordId={me.discordId} active={expanded} />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={
            'group relative flex w-full items-center gap-4 border bg-[rgba(0,0,0,0.92)] px-4 py-3.5 backdrop-blur-md transition-colors sm:px-6 sm:py-4 ' +
            'border-rga-green/35 hover:border-rga-green/60 hover:bg-[rgba(0,255,65,0.04)] shadow-[0_-8px_24px_rgba(0,255,65,0.08)]'
          }
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse rank details' : 'Expand to see your cohort'}
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 shrink-0 rounded-[1px] bg-rga-green shadow-[0_0_10px_#00FF41] animate-pulse"
          />

          <span className="hidden font-mono text-[9px] tracking-[0.4em] uppercase text-rga-green/70 sm:inline">
            YOU
          </span>

          <span className="hidden h-3 w-px bg-[rgba(255,255,255,0.12)] sm:inline-block" aria-hidden />

          <Field label="RANK" accent="green">
            <span className="font-display tabular-nums text-rga-green [text-shadow:0_0_12px_rgba(0,255,65,0.55)]" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}>
              {`#${String(me.rank).padStart(2, '0')}`}
            </span>
          </Field>

          <span className="h-3 w-px bg-[rgba(255,255,255,0.12)]" aria-hidden />

          <Field label="LV" accent="cyan">
            <span className="flex items-baseline gap-2">
              <span className="font-display tabular-nums text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.55)]" style={{ fontSize: 'clamp(18px, 2.2vw, 26px)' }}>
                {String(me.level).padStart(2, '0')}
              </span>
              {levelLabel && (
                <span className="hidden font-mono text-[10px] tracking-[0.3em] uppercase text-rga-cyan/80 sm:inline">
                  · {levelLabel}
                </span>
              )}
            </span>
          </Field>

          <span className="h-3 w-px bg-[rgba(255,255,255,0.12)]" aria-hidden />

          <Field label="XP" accent="muted">
            <span className="font-mono tabular-nums text-text-primary text-sm sm:text-base">
              {me.xp.toLocaleString()}
            </span>
          </Field>

          <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted">
            <span className="hidden sm:inline">{expanded ? 'CLOSE' : 'COHORT'}</span>
            <ChevronUp
              className={
                'h-4 w-4 text-rga-green transition-transform duration-200 ' +
                (expanded ? 'rotate-180' : '')
              }
              aria-hidden
            />
          </span>
        </button>

        {/* Next-rank hint — only when the label is configured and adds info */}
        {levelLabel && nextLevelLabel && (
          <div className="mt-1 hidden px-2 font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted sm:block">
            // NEXT TIER · {nextLevelLabel}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  accent,
  children,
}: {
  label: string
  accent: 'green' | 'cyan' | 'muted'
  children: React.ReactNode
}) {
  const labelClass =
    accent === 'green'
      ? 'text-rga-green/60'
      : accent === 'cyan'
        ? 'text-rga-cyan/60'
        : 'text-text-muted'

  return (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className={'font-mono text-[9px] tracking-[0.35em] uppercase ' + labelClass}>
        {label}
      </span>
      {children}
    </span>
  )
}

function NoXpBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto w-full max-w-[820px]">
        <div className="flex items-center gap-4 border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.92)] px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
          <span
            aria-hidden
            className="inline-block h-2 w-2 shrink-0 rounded-[1px] bg-text-muted"
          />
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
            // NO XP YET · DROP INTO DISCORD TO EARN YOUR FIRST RANK
          </span>
        </div>
      </div>
    </div>
  )
}

function FailBar({ fail }: { fail: AshleyError }) {
  const reLogin = fail.code === 'unauthenticated' || fail.code === 'unauthorized'
  const message = reLogin
    ? 'SESSION EXPIRED · SIGN IN AGAIN TO SEE YOUR RANK'
    : 'YOUR RANK IS BEING RECALCULATED · RETRY MOMENTARILY'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto w-full max-w-[820px]">
        <div className="flex flex-wrap items-center gap-3 border border-status-error/25 bg-[rgba(0,0,0,0.92)] px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
          <span
            aria-hidden
            className="inline-block h-2 w-2 shrink-0 rounded-[1px] bg-status-error shadow-[0_0_8px_#FF0066]"
          />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-status-error">
            // {message}
          </span>
          {reLogin && (
            <a
              href="/auth/login?returnTo=/leaderboard"
              className="ml-auto font-mono text-[10px] tracking-[0.3em] uppercase text-text-primary underline-offset-4 hover:underline"
            >
              RE-LOGIN →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
