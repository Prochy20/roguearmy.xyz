import Link from 'next/link'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { LootIcon } from './LootIcon'
import { SpecimenFrame } from './SpecimenFrame'
import {
  formatDayWithWeekday,
  nextDayUtc,
  previousDayUtc,
  todayUtcIso,
} from '@/lib/division2/format'
import type {
  EscalationMission,
  EscalationLootItem,
} from '@/lib/division2/escalation.server'

interface MissionRowProps {
  missions: EscalationMission[]
  /** Targeted-loot items keyed by `position` for the *selected* day. */
  dayLootByPosition?: Map<number, EscalationLootItem>
  /** Currently-displayed day (YYYY-MM-DD UTC). When set, the day-stepper
   *  renders and lets the user navigate by calendar day. */
  selectedDay?: string
  /** Mono label rendered next to SEC_01. Sourced from the Division 2 global. */
  sectionLabel?: string
}

const ESCALATION_BASE = '/division-2/escalation'

/**
 * Single operations-briefing panel with one row per mission. Each row aligns
 * to a fixed grid template so position, icon, drop label, and mission name
 * line up vertically across all rows.
 *
 * The day-stepper at the top scrubs by single calendar days — `?day=` on the
 * single base route. No notion of "weeks" in the URL.
 */
export function MissionRow({
  missions,
  dayLootByPosition,
  selectedDay,
  sectionLabel,
}: MissionRowProps) {
  if (missions.length === 0) return null

  const stepper = selectedDay ? buildStepper(selectedDay) : null
  const label = sectionLabel?.trim() || '// ACTIVE MISSIONS'

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.4em] text-rga-mod">SEC_01</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            {label}
          </span>
        </div>
        {stepper ? (
          <DayStepperBar stepper={stepper} />
        ) : (
          <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-70">
            {missions.length} ON ROTATION
          </span>
        )}
      </header>

      <CyberCorners color="mod" size="md">
        <ul className="flex flex-col border border-rga-mod/15 bg-[rgba(0,0,0,0.5)]">
          {missions.map((mission, idx) => {
            const dayLoot = dayLootByPosition?.get(mission.position)
            return (
              <li
                key={`${mission.position}-${mission.slug}`}
                className={
                  'grid grid-cols-[60px_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[60px_96px_minmax(0,2fr)_minmax(0,2fr)] sm:gap-5 sm:p-5' +
                  (idx > 0 ? ' border-t border-rga-mod/10' : '')
                }
              >
                {/* Position pill */}
                <div className="font-mono text-sm tracking-[0.3em] text-rga-mod">
                  M_{String(mission.position + 1).padStart(2, '0')}
                </div>

                {/* Icon — hidden at mobile to make room, visible at sm+ */}
                <div className="hidden sm:block">
                  <SpecimenFrame color="mod" pending={!dayLoot} padPx={12}>
                    {dayLoot && (
                      <LootIcon slug={dayLoot.slug} name={dayLoot.name} size={64} />
                    )}
                  </SpecimenFrame>
                </div>

                {/* Drops column */}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-[0.35em] text-text-muted">
                    // DROPS
                  </span>
                  {dayLoot ? (
                    <span
                      className="flex items-center gap-2 break-words font-display text-xl uppercase leading-tight text-rga-mod sm:text-2xl"
                      style={{ textShadow: '0 0 14px rgba(255,128,0,0.25)' }}
                    >
                      <span className="sm:hidden">
                        <LootIcon slug={dayLoot.slug} name={dayLoot.name} size={32} />
                      </span>
                      <span className="min-w-0 break-words">{dayLoot.name}</span>
                    </span>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-rga-mod/60">
                      PENDING UPSTREAM
                    </span>
                  )}
                </div>

                {/* Mission column */}
                <div className="col-span-2 flex min-w-0 flex-col gap-1 border-t border-rga-mod/10 pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
                  <span className="font-mono text-[10px] tracking-[0.35em] text-text-muted">
                    // RUN AT
                  </span>
                  <span className="break-words font-display text-base uppercase leading-tight text-text-primary sm:text-xl">
                    {mission.name}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </CyberCorners>
    </section>
  )
}

interface StepperState {
  prev: { href: string; label: string } | null
  next: { href: string; label: string } | null
  today: { href: string } | null
  current: { label: string; isToday: boolean }
}

/** Single-route URL for any day: clean canonical for today, `?day=` otherwise. */
function urlForDay(day: string): string {
  return day === todayUtcIso() ? ESCALATION_BASE : `${ESCALATION_BASE}?day=${day}`
}

function buildStepper(selectedDay: string): StepperState {
  const today = todayUtcIso()
  const prevDay = previousDayUtc(selectedDay)
  const nextDay = nextDayUtc(selectedDay)
  const isToday = selectedDay === today

  return {
    prev: { href: urlForDay(prevDay), label: formatDayWithWeekday(prevDay) },
    next:
      nextDay <= today
        ? { href: urlForDay(nextDay), label: formatDayWithWeekday(nextDay) }
        : null,
    // Quick jump back to today — only shown when not already there.
    today: isToday ? null : { href: ESCALATION_BASE },
    current: {
      label: formatDayWithWeekday(selectedDay),
      isToday,
    },
  }
}

/**
 * Standalone day-stepper bar. Used both inside MissionRow's header and as
 * a footer below all sections so users can paginate without scrolling back
 * up. `scroll={false}` on every Link keeps the viewport anchored to the
 * current scroll position across day navigations.
 */
export function EscalationDayStepper({ selectedDay }: { selectedDay: string }) {
  const stepper = buildStepper(selectedDay)
  return <DayStepperBar stepper={stepper} />
}

function DayStepperBar({ stepper }: { stepper: StepperState }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase">
      <StepArrow direction="prev" target={stepper.prev} />
      <div className="flex min-w-[160px] flex-col items-center gap-0.5 px-2">
        <span
          className={
            stepper.current.isToday ? 'text-rga-mod' : 'text-text-secondary'
          }
        >
          {stepper.current.isToday
            ? `// TODAY · ${stepper.current.label}`
            : stepper.current.label}
        </span>
      </div>
      <StepArrow direction="next" target={stepper.next} />
      {stepper.today && (
        <Link
          href={stepper.today.href}
          scroll={false}
          aria-label="Jump to today"
          className="inline-flex h-9 items-center justify-center border border-rga-mod/40 bg-rga-mod/10 px-3 font-mono text-[10px] tracking-[0.3em] text-rga-mod transition-colors hover:border-rga-mod/80 hover:bg-rga-mod/20"
        >
          // TODAY
        </Link>
      )}
    </div>
  )
}

function StepArrow({
  direction,
  target,
}: {
  direction: 'prev' | 'next'
  target: { href: string; label: string } | null
}) {
  const glyph = direction === 'prev' ? '←' : '→'
  const srLabel = direction === 'prev' ? 'Previous day' : 'Next day'

  if (!target) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center border border-rga-mod/10 bg-[rgba(0,0,0,0.4)] text-rga-mod/30"
      >
        {glyph}
      </span>
    )
  }

  return (
    <Link
      href={target.href}
      scroll={false}
      aria-label={`${srLabel} · ${target.label}`}
      className="inline-flex h-9 w-9 items-center justify-center border border-rga-mod/25 bg-[rgba(0,0,0,0.4)] text-rga-mod transition-colors hover:border-rga-mod/70 hover:bg-rga-mod/10"
    >
      {glyph}
    </Link>
  )
}
