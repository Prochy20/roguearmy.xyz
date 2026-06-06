import type { AfkRecord } from './types'
import { formatDurationCompact } from './duration'

interface SessionHistoryTableProps {
  items: AfkRecord[]
}

const REASON_TRUNCATE = 60

export function SessionHistoryTable({ items }: SessionHistoryTableProps) {
  return (
    <div className="border border-[rgba(255,255,255,0.06)]">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted sm:gap-8 sm:px-6">
        <span>REASON</span>
        <span>START → END</span>
        <span className="text-right">DURATION</span>
      </div>
      <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
        {items.map((item) => (
          <SessionHistoryRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

function SessionHistoryRow({ item }: { item: AfkRecord }) {
  const reasonRaw = item.reason ?? ''
  const reasonDisplay =
    reasonRaw.length > REASON_TRUNCATE
      ? `${reasonRaw.slice(0, REASON_TRUNCATE)}…`
      : reasonRaw
  const start = formatDate(item.createdAt)
  const end = item.endedAt ? formatTime(item.endedAt) : '—'

  return (
    <li className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-4 py-4 sm:gap-8 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2 w-2 shrink-0 rounded-[1px] bg-status-error"
          style={{ boxShadow: '0 0 6px #FF0066' }}
        />
        <span
          className="truncate font-mono text-[14px] text-text-primary sm:text-[15px]"
          title={reasonRaw || undefined}
        >
          {reasonDisplay || (
            <span className="text-text-muted">// no reason</span>
          )}
        </span>
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
        {start} → {end}
      </div>
      <div className="text-right font-display text-[20px] uppercase tracking-[0.02em] text-rga-cyan sm:text-[24px]">
        {formatDurationCompact(item.durationMs)}
      </div>
    </li>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const day = d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${day} · ${time}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

