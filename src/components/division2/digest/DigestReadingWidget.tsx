'use client'

import { useEffect, useState } from 'react'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface DigestReadingWidgetProps {
  accent: AccentName
  /** Total wordcount used to compute the remaining read-time. */
  wordCount: number
}

/**
 * Reading-progress panel pinned to the right rail.
 *
 * Three rows:
 *  - PROGRESS — percentage + a thin accent-colored bar with a leading-edge
 *    glow tick. The bar fills against a faint backplate that's always shown
 *    at 100% so the layout doesn't jump when progress is near zero.
 *  - TIME LEFT — minutes remaining, computed from (1 - progress) × words /
 *    200 wpm. Clamped to >= 0 and rounded; reads "DONE" when fully read.
 *  - WORDS — total word count, tabular-nums for stable columns.
 *
 * Scroll math: percent = (scrollY) / (documentHeight - viewportHeight).
 * Honest enough — the digest's body is the dominant content on the page, so
 * scrolling the page roughly tracks reading position. Re-runs on scroll and
 * resize; uses requestAnimationFrame to coalesce.
 */
export function DigestReadingWidget({
  accent,
  wordCount,
}: DigestReadingWidgetProps) {
  const a = ACCENT_TOKENS[accent]
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number | null = null

    const compute = () => {
      rafId = null
      const scrollY = window.scrollY
      const viewport = window.innerHeight
      const total = document.documentElement.scrollHeight - viewport
      if (total <= 0) {
        setProgress(0)
        return
      }
      const ratio = scrollY / total
      const clamped = Math.max(0, Math.min(1, ratio))
      setProgress(clamped)
    }

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const percent = Math.round(progress * 100)
  const wordsRemaining = Math.max(0, Math.round(wordCount * (1 - progress)))
  const minutesLeft = Math.max(0, Math.round(wordsRemaining / 200))
  const isDone = progress >= 0.995

  return (
    <section
      aria-label="Reading progress"
      className={`flex flex-col gap-4 border ${a.borderFaint} bg-void/45 p-4 backdrop-blur-sm`}
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.35em] ${a.textSoft}`}
        style={{ textShadow: a.textGlow }}
      >
        // READING
      </span>

      {/* PROGRESS */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted">
          <span>PROGRESS</span>
          <span className={`${a.text} tabular-nums`} style={{ textShadow: a.textGlow }}>
            {percent}%
          </span>
        </div>
        <div className="relative h-[3px] w-full bg-text-muted/15">
          <div
            className={`absolute inset-y-0 left-0 ${a.bg}`}
            style={{
              width: `${percent}%`,
              boxShadow: `0 0 8px rgba(${a.rgb},0.7)`,
              transition: 'width 120ms linear',
            }}
          />
          {/* Leading edge glow tick — only visible when progress > 0% */}
          {percent > 0 && percent < 100 && (
            <div
              className={`absolute top-1/2 h-2 w-px ${a.bg}`}
              style={{
                left: `${percent}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 6px rgba(${a.rgb},0.9)`,
                transition: 'left 120ms linear',
              }}
            />
          )}
        </div>
      </div>

      {/* TIME LEFT */}
      <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted">
        <span>TIME LEFT</span>
        <span className="text-text-secondary tabular-nums">
          {isDone ? 'DONE' : `~${minutesLeft} MIN`}
        </span>
      </div>

      {/* WORDS */}
      <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-text-muted">
        <span>WORDS</span>
        <span className="text-text-secondary tabular-nums">
          {wordCount.toLocaleString('en-US')}
        </span>
      </div>
    </section>
  )
}
