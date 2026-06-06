import { cn } from '@/lib/utils'

type DotTone = 'green' | 'magenta' | 'cyan'

interface MetaCellProps {
  /** Uppercase eyebrow above the value. */
  label: string
  /** Body of the cell — Discord ID, date, handle, etc. */
  value: string
  /** When set, a colored square appears to the left of the value. */
  statusDot?: { tone: DotTone; pulse?: boolean }
  className?: string
}

const DOT_HEX: Record<DotTone, string> = {
  green: '#00FF41',
  magenta: '#FF00FF',
  cyan: '#00FFFF',
}

export function MetaCell({ label, value, statusDot, className }: MetaCellProps) {
  const hex = statusDot ? DOT_HEX[statusDot.tone] : null
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        {label}
      </dt>
      <dd className="flex items-center gap-2 font-mono text-sm text-text-primary">
        {hex && (
          <span
            aria-hidden
            className={cn(
              'inline-block h-2 w-2 shrink-0 rounded-[1px]',
              statusDot?.pulse && 'me-dot-pulse',
            )}
            style={{ background: hex, boxShadow: `0 0 8px ${hex}` }}
          />
        )}
        <span className="min-w-0 truncate">{value}</span>
      </dd>
    </div>
  )
}
