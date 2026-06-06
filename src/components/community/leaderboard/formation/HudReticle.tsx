interface HudReticleProps {
  /** Lock state changes color + scan-line behavior. */
  state?: 'locked' | 'relieved' | 'scanning'
}

/**
 * Cyberpunk targeting overlay laid over an avatar. Renders inside an
 * absolutely-positioned wrapper — parent must be `position: relative`.
 *
 * Visual layers (back-to-front):
 *   1. Crosshair lines through the center.
 *   2. Four mid-edge inset tick marks (HUD targeting reticle).
 *   3. A faint center pip dot.
 *   4. A horizontal scan line that sweeps vertically.
 *   5. Coordinate labels in the corners (T·L / T·R / B·L / B·R style).
 */
export function HudReticle({ state = 'locked' }: HudReticleProps) {
  const tone =
    state === 'relieved'
      ? 'rgba(136,136,136,0.55)'
      : state === 'scanning'
        ? 'rgba(0,255,255,0.6)'
        : 'rgba(0,255,65,0.7)'
  const glow =
    state === 'relieved'
      ? '0 0 0 transparent'
      : state === 'scanning'
        ? '0 0 6px rgba(0,255,255,0.4)'
        : '0 0 6px rgba(0,255,65,0.5)'

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ color: tone }}
    >
      {/* Crosshair — vertical */}
      <div
        className="absolute left-1/2 top-0 h-full -translate-x-1/2"
        style={{ width: 1, background: tone, opacity: 0.35, boxShadow: glow }}
      />
      {/* Crosshair — horizontal */}
      <div
        className="absolute top-1/2 left-0 w-full -translate-y-1/2"
        style={{ height: 1, background: tone, opacity: 0.35, boxShadow: glow }}
      />

      {/* Center pip */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 8,
          height: 8,
          border: `1px solid ${tone}`,
          boxShadow: glow,
        }}
      />

      {/* Mid-edge tick marks — top */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: 1, height: 10, background: tone, boxShadow: glow }}
      />
      {/* bottom */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{ width: 1, height: 10, background: tone, boxShadow: glow }}
      />
      {/* left */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2"
        style={{ width: 10, height: 1, background: tone, boxShadow: glow }}
      />
      {/* right */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2"
        style={{ width: 10, height: 1, background: tone, boxShadow: glow }}
      />

      {/* Coordinate labels */}
      <div
        className="absolute top-1 left-2 font-mono text-[8px] tracking-[0.25em] uppercase"
        style={{ color: tone, opacity: 0.7 }}
      >
        T·L
      </div>
      <div
        className="absolute top-1 right-2 font-mono text-[8px] tracking-[0.25em] uppercase"
        style={{ color: tone, opacity: 0.7 }}
      >
        T·R
      </div>
      <div
        className="absolute bottom-1 left-2 font-mono text-[8px] tracking-[0.25em] uppercase"
        style={{ color: tone, opacity: 0.7 }}
      >
        B·L
      </div>
      <div
        className="absolute bottom-1 right-2 font-mono text-[8px] tracking-[0.25em] uppercase"
        style={{ color: tone, opacity: 0.7 }}
      >
        B·R
      </div>

      {/* Vertical scan-line — sweeps top to bottom, only when locked/scanning */}
      {state !== 'relieved' && (
        <div
          className="absolute inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${tone} 30%, ${tone} 70%, transparent)`,
            boxShadow: glow,
            animation: 'hud-scan 2.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Keyframes for the scan-line — scoped to this overlay */}
      <style>{`
        @keyframes hud-scan {
          0% { top: 0%; opacity: 0.0; }
          10% { opacity: 0.9; }
          50% { opacity: 0.6; }
          90% { opacity: 0.9; }
          100% { top: 100%; opacity: 0.0; }
        }
      `}</style>
    </div>
  )
}
