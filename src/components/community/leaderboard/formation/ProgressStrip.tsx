interface ProgressStripProps {
  /** Pre-formatted window label, e.g. "TODAY", "LAST 6 DAYS", "SINCE 11 MAY", "FIRST DEPLOY · 2H AGO". */
  windowLabel: string
  /** Net XP change in the window. Signed. */
  xpDelta: number
  /** Net rank change in the window. Positive = climbed (rank number decreased). */
  rankDelta: number
  /** Whether the snapshot ledger is fresh (recent visit). */
  fresh?: boolean
}

/**
 * Single-line telemetry strip rendering self-progress over a window.
 *
 * Visually: NOT a card. Sits as a status line below the tier band. Mono
 * font, segmented dividers, signed deltas with green/magenta tones and
 * directional arrows.
 */
export function ProgressStrip({
  windowLabel,
  xpDelta,
  rankDelta,
  fresh = true,
}: ProgressStripProps) {
  const xpSign = xpDelta > 0 ? '+' : xpDelta < 0 ? '−' : '±'
  const xpAbs = Math.abs(xpDelta)
  const xpTone = xpDelta > 0 ? 'text-rga-green' : xpDelta < 0 ? 'text-rga-magenta' : 'text-text-muted'
  const xpGlow =
    xpDelta > 0
      ? '[text-shadow:0_0_10px_rgba(0,255,65,0.45)]'
      : xpDelta < 0
        ? '[text-shadow:0_0_10px_rgba(255,0,255,0.4)]'
        : ''

  const rankArrow = rankDelta > 0 ? '↑' : rankDelta < 0 ? '↓' : '·'
  const rankSign = rankDelta > 0 ? '+' : rankDelta < 0 ? '−' : '·'
  const rankAbs = Math.abs(rankDelta)
  const rankTone =
    rankDelta > 0 ? 'text-rga-green' : rankDelta < 0 ? 'text-rga-magenta' : 'text-text-muted'

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.35em] uppercase">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={
            'inline-block h-1 w-1 ' +
            (fresh ? 'bg-rga-green animate-pulse shadow-[0_0_6px_#00FF41]' : 'bg-text-muted/50')
          }
        />
        <span className="text-text-muted">{fresh ? 'TELEMETRY' : 'TELEMETRY · STALE'}</span>
      </div>

      <SepBar />

      {/* Window */}
      <div className="flex items-center gap-2">
        <span className="text-rga-green/70">// {windowLabel}</span>
      </div>

      <SepBar />

      {/* XP delta */}
      <div className="flex items-baseline gap-2">
        <span className="text-text-muted">ΔXP</span>
        <span className={'tabular-nums ' + xpTone + ' ' + xpGlow}>
          {xpSign}
          {xpAbs.toLocaleString()}
        </span>
      </div>

      <SepBar />

      {/* Rank delta */}
      <div className="flex items-baseline gap-2">
        <span className="text-text-muted">ΔRNK</span>
        <span className={'tabular-nums ' + rankTone}>
          {rankSign}
          {rankAbs}
        </span>
        <span className={rankTone} aria-hidden>
          {rankArrow}
        </span>
      </div>

      <SepBar />

      {/* Signal annotation */}
      <span className="text-text-muted/70">
        SIG: {xpDelta > 0 ? 'CLIMBING' : xpDelta < 0 ? 'DRIFTING' : 'HOLDING'}
      </span>
    </div>
  )
}

function SepBar() {
  return (
    <span aria-hidden className="inline-block h-3 w-px bg-text-muted/30" />
  )
}
