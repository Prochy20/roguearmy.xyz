interface SpecimenFrameProps {
  color: 'cyan' | 'magenta' | 'mod'
  pending?: boolean
  /** Square aspect by default; pass `false` to let the frame size to children. */
  square?: boolean
  /** Inner padding around the icon in px. Default 20. */
  padPx?: number
  children: React.ReactNode
}

/**
 * Bordered display zone for a single loot icon. Communicates "specimen on
 * record" via four corner ticks, a faint radial backlight tinted to the
 * section color, and a thin low-opacity border. Used in both mission cards
 * and cache cards so the icon-hero treatment is consistent across the page.
 */
export function SpecimenFrame({
  color,
  pending,
  square = true,
  padPx = 20,
  children,
}: SpecimenFrameProps) {
  const borderColor =
    color === 'cyan'
      ? 'border-rga-cyan/20'
      : color === 'magenta'
        ? 'border-rga-magenta/20'
        : 'border-game-d2/25'
  const tickColor =
    color === 'cyan'
      ? 'border-rga-cyan/60'
      : color === 'magenta'
        ? 'border-rga-magenta/60'
        : 'border-game-d2/70'
  const glow =
    color === 'cyan'
      ? 'radial-gradient(circle at center, rgba(0,255,255,0.10) 0%, rgba(0,0,0,0) 65%)'
      : color === 'magenta'
        ? 'radial-gradient(circle at center, rgba(255,0,255,0.10) 0%, rgba(0,0,0,0) 65%)'
        : 'radial-gradient(circle at center, rgba(255,128,0,0.12) 0%, rgba(0,0,0,0) 65%)'

  return (
    <div
      className={`relative ${square ? 'aspect-square' : ''} w-full overflow-hidden border ${borderColor} ${
        pending ? 'border-dashed opacity-60' : ''
      }`}
      style={{ background: glow }}
    >
      <span aria-hidden className={`pointer-events-none absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t ${tickColor}`} />
      <span aria-hidden className={`pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t ${tickColor}`} />
      <span aria-hidden className={`pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l ${tickColor}`} />
      <span aria-hidden className={`pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r ${tickColor}`} />

      <div
        className="flex h-full w-full items-center justify-center"
        style={{ padding: padPx }}
      >
        {pending ? (
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted opacity-60">
            // PENDING
          </span>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
