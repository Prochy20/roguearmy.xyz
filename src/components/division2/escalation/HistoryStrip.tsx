import Link from 'next/link'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { formatDayShort } from '@/lib/division2/format'
import { FailRow } from '@/components/shared/FailRow'
import type { AshleyResult } from '@/lib/api/server'
import type { EscalationWeekList } from '@/lib/division2/escalation.server'

const STRIP_LIMIT = 8

interface HistoryStripProps {
  weeksList: AshleyResult<EscalationWeekList>
  /** When set, exclude this weekStart from the strip (the foreground view). */
  excludeWeekStart?: string
}

/**
 * Horizontal strip of compact past-week cards. Click → per-week detail
 * route. Used both below the current view (excluding today's week) and
 * below archived views (excluding the displayed week).
 *
 * Degraded rendering when the list call failed: shows a compact FailRow
 * inside the strip slot so the main view still renders.
 */
export function HistoryStrip({ weeksList, excludeWeekStart }: HistoryStripProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.4em] text-rga-magenta">SEC_04</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            // ARCHIVED WEEKS
          </span>
        </div>
        {weeksList.ok && (
          <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-70">
            {weeksList.data.total} ON RECORD
          </span>
        )}
      </header>

      {weeksList.ok ? (
        <StripCards
          weeks={weeksList.data.items}
          excludeWeekStart={excludeWeekStart}
        />
      ) : (
        <FailRow
          code={weeksList.error.code}
          status={weeksList.error.status}
          returnTo="/division-2/escalation"
        />
      )}
    </section>
  )
}

function StripCards({
  weeks,
  excludeWeekStart,
}: {
  weeks: EscalationWeekList['items']
  excludeWeekStart?: string
}) {
  const filtered = weeks
    .filter((w) => w.weekStart !== excludeWeekStart)
    .slice(0, STRIP_LIMIT)

  if (filtered.length === 0) {
    return (
      <div className="border border-rga-magenta/15 bg-[rgba(0,0,0,0.35)] px-4 py-6 text-center">
        <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
          // NO ARCHIVED WEEKS YET
        </span>
      </div>
    )
  }

  return (
    <ul className="flex gap-3 overflow-x-auto pb-2 sm:gap-4 [scrollbar-width:thin]">
      {filtered.map((week) => (
        <li key={week.weekStart} className="flex-shrink-0">
          <Link
            href={`/division-2/escalation/${week.weekStart}`}
            className="group block w-[220px] sm:w-[260px]"
          >
            <CyberCorners color="magenta" size="sm">
              <div className="flex flex-col gap-2 border border-rga-magenta/15 bg-[rgba(0,0,0,0.4)] p-4 transition-colors group-hover:bg-[rgba(255,0,255,0.06)]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-rga-magenta">
                    WEEK_OF
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-70">
                    {week.dailyCount}/7 DAYS
                  </span>
                </div>
                <span className="font-display text-xl uppercase tracking-tight text-text-primary">
                  {formatDayShort(week.weekStart)}
                </span>
                <ul className="flex flex-col gap-0.5 border-t border-rga-magenta/10 pt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                  {week.missions.slice(0, 3).map((m) => (
                    <li key={m.position} className="truncate opacity-80">
                      <span className="text-rga-magenta">M_{String(m.position + 1).padStart(2, '0')}</span>
                      {' · '}
                      {m.name}
                    </li>
                  ))}
                  {week.missions.length > 3 && (
                    <li className="opacity-50">+ {week.missions.length - 3} MORE</li>
                  )}
                </ul>
                <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[9px] tracking-[0.3em] text-rga-magenta opacity-70 transition-opacity group-hover:opacity-100">
                  OPEN →
                </div>
              </div>
            </CyberCorners>
          </Link>
        </li>
      ))}
    </ul>
  )
}
