interface FormationBlockProps {
  children: React.ReactNode
  /** Lock state of the personal block — propagates to corner marker color. */
  status?: 'live' | 'relieved' | 'standby'
}

/**
 * Wrapping container for the personal HUD block. Renders the corner markers
 * (`[FORMATION HUD · LIVE]` top-right, `[BLOCK · 01]` top-left) and the
 * outer atmospheric chrome (noise overlay, edge gradients). The children
 * arrange themselves vertically: PointCard → TierBand → ProgressStrip.
 */
export function FormationBlock({ children, status = 'live' }: FormationBlockProps) {
  const statusTone =
    status === 'relieved' ? 'text-rga-magenta' : status === 'standby' ? 'text-text-muted' : 'text-rga-green'
  const dotColor =
    status === 'relieved'
      ? 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]'
      : status === 'standby'
        ? 'bg-text-muted'
        : 'bg-rga-green shadow-[0_0_10px_#00FF41]'
  const statusLabel =
    status === 'relieved' ? 'RELIEVED' : status === 'standby' ? 'STANDBY' : 'LIVE'

  return (
    <section
      aria-label="formation HUD"
      className="relative isolate"
    >
      {/* Outer atmospheric backdrop — faint diagonal grid behind content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 0%, transparent calc(50% - 0.5px), #00FF41 calc(50% - 0.5px), #00FF41 calc(50% + 0.5px), transparent calc(50% + 0.5px)), linear-gradient(90deg, transparent 0%, transparent calc(50% - 0.5px), #00FF41 calc(50% - 0.5px), #00FF41 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Corner markers — top-left */}
      <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.4em] sm:mb-4">
        <div className="flex items-center gap-2 text-text-muted">
          <span className="inline-block h-1.5 w-1.5 bg-text-muted/60" aria-hidden />
          <span>[ BLOCK · 01 ]</span>
        </div>

        {/* Corner markers — top-right */}
        <div className={'flex items-center gap-2 ' + statusTone}>
          <span>[ FORMATION HUD · {statusLabel} ]</span>
          <span
            aria-hidden
            className={'inline-block h-1.5 w-1.5 animate-pulse ' + dotColor}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">{children}</div>

      {/* Bottom rule — slim segmented divider that visually closes the block */}
      <div
        aria-hidden
        className="mt-5 flex h-px gap-1 sm:mt-6"
      >
        <div className="h-full w-8 bg-rga-green/40" />
        <div className="h-full w-2 bg-rga-green/20" />
        <div className="h-full flex-1 bg-rga-green/10" />
        <div className="h-full w-2 bg-rga-green/20" />
        <div className="h-full w-8 bg-rga-green/40" />
      </div>
    </section>
  )
}
