import { cn } from '@/lib/utils'

type PillTone = 'green' | 'magenta' | 'cyan'

interface StatusPillProps {
  /** Left-aligned uppercase label (e.g. "ON DUTY", "AFK"). */
  label: string
  /** Right-aligned secondary value (e.g. "ACTIVE", "12m"). */
  value: string
  /** Color of the dot, border, and label. */
  tone?: PillTone
  /** Pulse the dot. Suppressed under prefers-reduced-motion via me.css. */
  pulse?: boolean
  className?: string
}

const TONE: Record<PillTone, { hex: string; border: string; bg: string; text: string }> = {
  green: {
    hex: '#00FF41',
    border: 'border-rga-green/35',
    bg: 'bg-[rgba(0,255,65,0.05)]',
    text: 'text-rga-green',
  },
  magenta: {
    hex: '#FF00FF',
    border: 'border-rga-magenta/35',
    bg: 'bg-[rgba(255,0,255,0.05)]',
    text: 'text-rga-magenta',
  },
  cyan: {
    hex: '#00FFFF',
    border: 'border-rga-cyan/35',
    bg: 'bg-[rgba(0,255,255,0.05)]',
    text: 'text-rga-cyan',
  },
}

export function StatusPill({
  label,
  value,
  tone = 'green',
  pulse = true,
  className,
}: StatusPillProps) {
  const t = TONE[tone]
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 border px-3.5 py-2.5',
        t.border,
        t.bg,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('inline-block h-2 w-2 rounded-[1px]', pulse && 'me-dot-pulse')}
        style={{ background: t.hex, boxShadow: `0 0 8px ${t.hex}` }}
      />
      <span
        className={cn(
          'font-mono text-[11px] uppercase tracking-[0.22em]',
          t.text,
        )}
      >
        {label}
      </span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
        {value}
      </span>
    </div>
  )
}
