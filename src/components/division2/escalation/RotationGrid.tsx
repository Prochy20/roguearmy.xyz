import {
  enumerateWeekDays,
  formatDayShort,
  normalizeDayIso,
  weekdayShort,
  todayUtcIso,
} from '@/lib/division2/format'
import { LootIcon } from './LootIcon'
import type {
  EscalationMission,
  EscalationDailySummary,
} from '@/lib/division2/escalation.server'

interface RotationGridProps {
  weekStart: string
  missions: EscalationMission[]
  dailies: EscalationDailySummary[]
  /** Highlight today's column? Only true in current-week mode. */
  highlightToday: boolean
}

/**
 * N missions × 7 days rotation matrix. Each cell shows the loot-type name
 * that drops from `mission[row].position` on `day[col]`. Missing cells
 * (un-ingested or pre-launch days) render as `—`.
 */
export function RotationGrid({ weekStart, missions, dailies, highlightToday }: RotationGridProps) {
  const days = enumerateWeekDays(weekStart)
  const today = todayUtcIso()
  const dailyByDay = new Map(dailies.map((d) => [normalizeDayIso(d.day), d]))

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.4em] text-rga-green">SEC_03</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            // 7-DAY ROTATION
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-70">
          WEEK_OF · {weekStart}
        </span>
      </header>

      <div className="overflow-x-auto border border-rga-green/15 bg-[rgba(0,0,0,0.35)]">
        <table className="w-full min-w-[640px] border-collapse font-mono text-[11px]">
          <thead>
            <tr className="border-b border-rga-green/15">
              <th className="sticky left-0 z-[1] bg-[rgba(0,0,0,0.6)] px-3 py-3 text-left text-[9px] uppercase tracking-[0.3em] text-text-muted">
                MISSION
              </th>
              {days.map((day) => {
                const isToday = highlightToday && day === today
                return (
                  <th
                    key={day}
                    className={`px-3 py-3 text-center text-[9px] uppercase tracking-[0.3em] ${
                      isToday
                        ? 'bg-rga-cyan/10 text-rga-cyan shadow-[inset_0_-2px_0_rgba(0,255,255,0.4)]'
                        : 'text-text-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{weekdayShort(day)}</span>
                      <span className="opacity-70">{formatDayShort(day)}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.position} className="border-b border-rga-green/10 last:border-b-0">
                <th className="sticky left-0 z-[1] bg-[rgba(0,0,0,0.6)] px-3 py-3 text-left uppercase tracking-[0.15em] text-text-primary">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] tracking-[0.3em] text-rga-cyan">
                      M_{String(mission.position + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[12px] text-text-primary">{mission.name}</span>
                  </div>
                </th>
                {days.map((day) => {
                  const daily = dailyByDay.get(day)
                  const loot = daily?.items.find((i) => i.position === mission.position)
                  const isToday = highlightToday && day === today
                  return (
                    <td
                      key={day}
                      className={`px-3 py-3 uppercase tracking-[0.15em] ${
                        isToday ? 'bg-rga-cyan/[0.06] text-rga-cyan' : 'text-text-secondary'
                      }`}
                    >
                      {loot ? (
                        <div className="flex items-center justify-center gap-2">
                          <LootIcon slug={loot.slug} name={loot.name} size={20} />
                          <span>{loot.name}</span>
                        </div>
                      ) : (
                        <div className="text-center opacity-30">—</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
