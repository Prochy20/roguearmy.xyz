interface TierBandProps {
  /** Current level (number). */
  level: number
  /** Configured label for the current level (e.g. "VETERAN"). Optional. */
  levelLabel: string | null
  /** Progress within current level band, in [0, 1]. */
  progress: number
  /** XP remaining until the next level. */
  xpToNextLevel: number | null
  /** Configured label for the next level (e.g. "ELITE"). Optional. */
  nextLevelLabel: string | null
  /** Next level number, or null when at the cap. */
  nextLevel: number | null
  /**
   * Compact mode strips the announcement chrome (eyebrow row + big tier
   * label). Use when the surrounding page already declares the level —
   * e.g. on /me where a large CURRENT LEVEL display sits above. Leaves
   * the segmented bar + XP-to-next cell intact.
   */
  compact?: boolean
}

const SEGMENTS = 32

/**
 * Slim horizontal HUD-band rendering tier progress as a segmented power
 * gauge. Visually distinct from the POINT card (which is dramatic) — this
 * is an *instrument reading*. Reads at a glance.
 *
 * At the level cap (no nextLevel), renders a "MAX BAND" state with a full
 * gauge and a different tone.
 */
export function TierBand({
  level,
  levelLabel,
  progress,
  xpToNextLevel,
  nextLevelLabel,
  nextLevel,
  compact = false,
}: TierBandProps) {
  const atCap = nextLevel == null
  const clamped = Math.max(0, Math.min(1, atCap ? 1 : progress))
  const pct = Math.round(clamped * 100)
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round(clamped * SEGMENTS)))

  // Compute the rightmost lit segment for the "leading edge" highlight.
  // When the bar is partial, the very last lit cell shimmers slightly.
  const leadingEdgeIdx = atCap ? -1 : Math.max(0, filled - 1)

  return (
    <div
      className={
        'relative border bg-[rgba(0,0,0,0.45)] px-4 py-3 sm:px-6 sm:py-4 ' +
        (atCap
          ? 'border-rga-magenta/30 shadow-[inset_0_0_32px_rgba(255,0,255,0.08)]'
          : 'border-rga-green/15')
      }
      role="group"
      aria-label="tier progress"
    >
      {/* Eyebrow row — suppressed in compact mode (parent announces the level). */}
      {!compact && (
        <div className="mb-2.5 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.4em] uppercase">
          <div className="flex items-center gap-2">
            <span className={atCap ? 'text-rga-magenta' : 'text-rga-green/80'} aria-hidden>
              ◢
            </span>
            <span className={atCap ? 'text-rga-magenta' : 'text-rga-green/80'}>TIER</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">
              LV {String(level).padStart(2, '0')}
              {levelLabel ? ` · ${levelLabel}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            {atCap ? (
              <span className="text-rga-magenta [text-shadow:0_0_10px_rgba(255,0,255,0.5)]">
                MAX BAND · 100%
              </span>
            ) : (
              <>
                <span className="tabular-nums text-text-secondary">{pct}%</span>
                <span aria-hidden>→</span>
                {nextLevelLabel ? (
                  <span className="text-rga-cyan/80">{nextLevelLabel}</span>
                ) : (
                  <span className="text-rga-cyan/80">LV {String(nextLevel).padStart(2, '0')}</span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main row. Compact drops the big tier-label cell and widens the bar. */}
      <div
        className={
          'grid grid-cols-1 items-center gap-3 sm:gap-5 ' +
          (compact ? 'sm:grid-cols-[1fr_auto]' : 'sm:grid-cols-[auto_1fr_auto]')
        }
      >
        {!compact && (
          <div className="flex items-baseline gap-3">
            <span
              className={
                'font-display uppercase leading-none tracking-[0.005em] ' +
                (atCap
                  ? 'text-rga-magenta [text-shadow:0_0_18px_rgba(255,0,255,0.55)]'
                  : 'text-rga-green [text-shadow:0_0_18px_rgba(0,255,65,0.45)]')
              }
              style={{ fontSize: 'clamp(20px, 2.4vw, 32px)' }}
            >
              {levelLabel ?? `LV ${String(level).padStart(2, '0')}`}
            </span>
          </div>
        )}

        {/* Segmented bar */}
        <div
          className="relative flex h-5 items-stretch gap-[2px] sm:h-6"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const isFilled = i < filled
            const isLeadingEdge = i === leadingEdgeIdx
            return (
              <span
                key={i}
                className={
                  'h-full flex-1 transition-colors duration-300 ' +
                  (atCap
                    ? 'bg-rga-magenta/85 shadow-[0_0_6px_rgba(255,0,255,0.5)]'
                    : isLeadingEdge
                      ? 'bg-rga-green shadow-[0_0_10px_rgba(0,255,65,0.7),0_0_18px_rgba(0,255,65,0.35)] animate-pulse'
                      : isFilled
                        ? 'bg-rga-green/85 shadow-[0_0_4px_rgba(0,255,65,0.4)]'
                        : 'bg-rga-green/[0.07]')
                }
              />
            )
          })}
        </div>

        {/* XP-to-next readout */}
        <div className="flex shrink-0 flex-col items-start gap-0.5 sm:items-end">
          <div className="font-mono text-[9px] tracking-[0.4em] uppercase text-text-muted">
            {atCap ? 'TOP OF SCALE' : `XP TO LV ${String(nextLevel).padStart(2, '0')}`}
          </div>
          <div
            className={
              'font-display tabular-nums leading-none ' +
              (atCap
                ? 'text-rga-magenta [text-shadow:0_0_12px_rgba(255,0,255,0.5)]'
                : 'text-rga-cyan [text-shadow:0_0_12px_rgba(0,255,255,0.5)]')
            }
            style={{ fontSize: 'clamp(20px, 2.4vw, 32px)' }}
          >
            {atCap ? '—' : (xpToNextLevel ?? 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
