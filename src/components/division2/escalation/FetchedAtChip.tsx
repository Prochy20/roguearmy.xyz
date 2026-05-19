import { hoursSince, STALE_HOURS_THRESHOLD } from '@/lib/division2/format'

/**
 * Surfaces Ashley's `fetchedAt` timestamp. Past 24h the chip flips to a
 * magenta "MAY BE STALE" warning — Ashley's freshness signal made visible
 * without a hard block.
 */
export function FetchedAtChip({ fetchedAt }: { fetchedAt: string }) {
  const ageHours = hoursSince(fetchedAt)
  const stale = Number.isFinite(ageHours) && ageHours > STALE_HOURS_THRESHOLD

  const ageLabel = !Number.isFinite(ageHours)
    ? 'UNKNOWN'
    : ageHours < 1
      ? `${Math.max(0, Math.floor(ageHours * 60))}m AGO`
      : ageHours < 48
        ? `${Math.floor(ageHours)}h AGO`
        : `${Math.floor(ageHours / 24)}d AGO`

  const color = stale ? 'text-rga-magenta' : 'text-text-muted'
  const dot = stale
    ? 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]'
    : 'bg-rga-mod/70 shadow-[0_0_6px_rgba(255,128,0,0.4)]'
  const message = stale
    ? `// LAST SYNC · ${ageLabel} · MAY BE STALE`
    : `// LAST SYNC · ${ageLabel}`

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] ${color}`}
    >
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-[1px] ${dot}`} />
      <span>{message}</span>
    </div>
  )
}
