interface SessionHistoryEmptyProps {
  /** ISO date the operative first logged into the site. */
  joinedAt: string | null
}

export function SessionHistoryEmpty({ joinedAt }: SessionHistoryEmptyProps) {
  const since = formatJoinedDate(joinedAt)
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-[rgba(255,255,255,0.08)] px-6 py-16 text-center">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-[1px] bg-rga-green"
        style={{ boxShadow: '0 0 6px #00FF41' }}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-rga-green">
        // NO SESSIONS LOGGED
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-muted">
        CHANNEL CLEAR SINCE {since}
      </p>
    </div>
  )
}

function formatJoinedDate(iso: string | null): string {
  if (!iso) return 'YOUR FIRST LOGIN'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'YOUR FIRST LOGIN'
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
}
