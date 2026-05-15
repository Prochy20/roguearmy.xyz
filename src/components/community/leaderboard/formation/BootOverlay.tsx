'use client'

import { useEffect, useState } from 'react'

interface BootOverlayProps {
  /** Caller's displayName, shown in the auth line for personality. */
  operativeName?: string | null
  /** Roster size, shown in the cohort line. */
  cohortSize?: number | null
  /** Total runtime before auto-dismiss, in ms. Default 1200. */
  durationMs?: number
  /** Fired after the overlay completes (either by timeout or click-skip). */
  onComplete?: () => void
}

const STAGGER_MS = 180

/**
 * Full-screen once-per-month boot intro. Six lines of terminal output
 * cascade in sequence; on completion, the overlay fades and unmounts.
 * Click anywhere to skip. Total runtime ~1.2s (configurable).
 *
 * Visual design choices:
 *   - Pure black void background with a faint scan-line sweep.
 *   - JetBrains Mono lines tagged with > prefix; final line gets ◢ marker.
 *   - Blinking cursor follows the currently-revealing line.
 *   - On dismiss: 240ms fade-out with a brief chromatic flash.
 */
export function BootOverlay({
  operativeName,
  cohortSize,
  durationMs = 1200,
  onComplete,
}: BootOverlayProps) {
  const [dismissing, setDismissing] = useState(false)

  const lines: { tag: string; text: string }[] = [
    { tag: '>', text: 'AUTHENTICATING OPERATIVE...' },
    { tag: '>', text: operativeName ? `ID VERIFIED · @${operativeName.toUpperCase()}` : 'ID VERIFIED' },
    { tag: '>', text: 'SYNCING FORMATION DATA...' },
    {
      tag: '>',
      text:
        cohortSize != null ? `COHORT LINK ESTABLISHED · ${cohortSize} OPS` : 'COHORT LINK ESTABLISHED',
    },
    { tag: '>', text: 'POINT TELEMETRY ONLINE' },
    { tag: '◢', text: 'HUD READY' },
  ]

  const dismiss = () => {
    if (dismissing) return
    setDismissing(true)
    setTimeout(() => onComplete?.(), 240)
  }

  useEffect(() => {
    const total = durationMs + STAGGER_MS * lines.length + 200
    const t = setTimeout(dismiss, total)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs])

  return (
    <div
      role="dialog"
      aria-label="Initializing formation HUD"
      onClick={dismiss}
      className={
        'fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-void transition-opacity duration-300 ' +
        (dismissing ? 'opacity-0' : 'opacity-100')
      }
    >
      {/* Diagonal grid backdrop — barely visible, adds depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent calc(50% - 0.5px), #00FF41 calc(50% - 0.5px), #00FF41 calc(50% + 0.5px), transparent calc(50% + 0.5px)), linear-gradient(90deg, transparent calc(50% - 0.5px), #00FF41 calc(50% - 0.5px), #00FF41 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Vertical scanline sweep */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px bg-rga-green/40 shadow-[0_0_20px_rgba(0,255,65,0.5)]"
        style={{ animation: 'boot-scan 1.4s ease-in-out infinite' }}
      />

      {/* Subtle vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[820px] px-6 sm:px-10">
        {/* Header chip — corner-bracketed tag */}
        <div className="mb-7 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] uppercase text-rga-green/70 sm:mb-10">
          <span className="inline-block h-1 w-3 bg-rga-green shadow-[0_0_8px_#00FF41]" aria-hidden />
          <span>RGA · TACTICAL HUD · v2.0</span>
          <span aria-hidden className="inline-block h-px flex-1 bg-rga-green/30" />
          <span className="hidden sm:inline">CLICK TO SKIP</span>
        </div>

        {/* Terminal lines */}
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {lines.map((line, i) => {
            const isFinal = i === lines.length - 1
            return (
              <div
                key={i}
                className="boot-line flex items-baseline gap-3 opacity-0 sm:gap-4"
                style={{ animation: `boot-line-in 240ms cubic-bezier(0.22, 1, 0.36, 1) ${i * STAGGER_MS}ms both` }}
              >
                <span
                  className={
                    'shrink-0 font-mono text-sm font-bold ' +
                    (isFinal
                      ? 'text-rga-green [text-shadow:0_0_8px_rgba(0,255,65,0.55)]'
                      : 'text-rga-green/70')
                  }
                >
                  {line.tag}
                </span>
                <span
                  className={
                    'font-mono uppercase tracking-[0.18em] ' +
                    (isFinal
                      ? 'text-base text-rga-green [text-shadow:0_0_12px_rgba(0,255,65,0.45)] sm:text-lg'
                      : 'text-xs text-text-secondary sm:text-sm')
                  }
                >
                  {line.text}
                </span>
                {/* Cursor block — only on the latest line that's currently rendering */}
                <span
                  className="inline-block h-3 w-1.5 bg-rga-green opacity-0 shadow-[0_0_6px_#00FF41]"
                  style={{
                    animation: `boot-cursor ${STAGGER_MS}ms steps(2, end) ${i * STAGGER_MS}ms`,
                  }}
                  aria-hidden
                />
              </div>
            )
          })}
        </div>

        {/* Footer progress bar */}
        <div
          aria-hidden
          className="mt-8 h-px bg-rga-green/15 sm:mt-12"
        >
          <div
            className="h-full bg-rga-green shadow-[0_0_8px_#00FF41]"
            style={{
              width: '0%',
              animation: `boot-fill ${durationMs}ms linear forwards`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted">
          <span>// INIT.SEQ</span>
          <span className="sm:hidden">TAP TO SKIP</span>
          <span className="hidden sm:inline">SECURE CHANNEL · ESTABLISHED</span>
        </div>
      </div>

      <style>{`
        @keyframes boot-line-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes boot-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes boot-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes boot-scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
