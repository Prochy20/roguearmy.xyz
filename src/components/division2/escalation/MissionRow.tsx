import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
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
  /** When true, the `// TODAY` jump button is replaced with a passive
   *  `// AWAITING` pill — clicking TODAY would just bounce back to the same
   *  fallback day, so we surface the state instead of the trap. */
  awaitingTodayIngest?: boolean
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
  awaitingTodayIngest,
  sectionLabel,
}: MissionRowProps) {
  if (missions.length === 0) return null

  const stepper = selectedDay
    ? buildStepper(selectedDay, awaitingTodayIngest)
    : null
  const label = sectionLabel?.trim() || '// ACTIVE MISSIONS'

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.4em] text-game-d2">SEC_01</span>
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
        <GlitchOnChange triggerKey={selectedDay ?? ''}>
        <ul className="flex flex-col border border-game-d2/15 bg-[rgba(0,0,0,0.5)]">
          {missions.map((mission, idx) => {
            const dayLoot = dayLootByPosition?.get(mission.position)
            return (
              <li
                key={`${mission.position}-${mission.slug}`}
                className={
                  'grid grid-cols-[60px_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[60px_96px_minmax(0,2fr)_minmax(0,2fr)] sm:gap-5 sm:p-5' +
                  (idx > 0 ? ' border-t border-game-d2/10' : '')
                }
              >
                <div className="font-mono text-sm tracking-[0.3em] text-game-d2">
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

                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-[0.35em] text-text-muted">
                    // DROPS
                  </span>
                  {dayLoot ? (
                    <span
                      className="flex items-center gap-2 break-words font-display text-xl uppercase leading-tight text-game-d2 sm:text-2xl"
                      style={{ textShadow: '0 0 14px rgba(255,128,0,0.25)' }}
                    >
                      <span className="sm:hidden">
                        <LootIcon slug={dayLoot.slug} name={dayLoot.name} size={32} />
                      </span>
                      <span className="min-w-0 break-words">{dayLoot.name}</span>
                    </span>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-game-d2/60">
                      PENDING UPSTREAM
                    </span>
                  )}
                </div>

                <div className="col-span-2 flex min-w-0 flex-col gap-1 border-t border-game-d2/10 pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
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
        </GlitchOnChange>
      </CyberCorners>
    </section>
  )
}

interface StepperState {
  prev: { href: string; label: string } | null
  next: { href: string; label: string } | null
  today: { href: string } | null
  /** True when today's data hasn't ingested — `today` is null and the bar
   *  shows a passive AWAITING pill instead of the clickable TODAY link. */
  awaitingToday: boolean
  current: { label: string; isToday: boolean }
}

/** Single-route URL for any day: clean canonical for today, `?day=` otherwise. */
function urlForDay(day: string): string {
  return day === todayUtcIso() ? ESCALATION_BASE : `${ESCALATION_BASE}?day=${day}`
}

function buildStepper(
  selectedDay: string,
  awaitingTodayIngest = false,
): StepperState {
  const today = todayUtcIso()
  const prevDay = previousDayUtc(selectedDay)
  const nextDay = nextDayUtc(selectedDay)
  const isToday = selectedDay === today

  // When today hasn't ingested, the "next" days from the fallback point all
  // the way up to today are part of the same ingest gap — stepping forward
  // would just trigger the same walk-back. Suppress forward navigation
  // entirely in that state.
  const canStepForward = nextDay <= today && !awaitingTodayIngest

  return {
    prev: { href: urlForDay(prevDay), label: formatDayWithWeekday(prevDay) },
    next: canStepForward
      ? { href: urlForDay(nextDay), label: formatDayWithWeekday(nextDay) }
      : null,
    // Quick jump back to today — suppressed when today hasn't ingested,
    // since clicking it would just fall back to the same day we're on.
    today: isToday || awaitingTodayIngest ? null : { href: ESCALATION_BASE },
    awaitingToday: awaitingTodayIngest,
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
export function EscalationDayStepper({
  selectedDay,
  awaitingTodayIngest,
}: {
  selectedDay: string
  awaitingTodayIngest?: boolean
}) {
  const stepper = buildStepper(selectedDay, awaitingTodayIngest)
  return <DayStepperBar stepper={stepper} />
}

function DayStepperBar({ stepper }: { stepper: StepperState }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase">
      <StepArrow direction="prev" target={stepper.prev} />
      <div className="flex min-w-[160px] flex-col items-center gap-0.5 px-2">
        <span
          className={
            stepper.current.isToday ? 'text-game-d2' : 'text-text-secondary'
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
          prefetch={false}
          aria-label="Jump to today"
          className="inline-flex h-9 items-center justify-center border border-game-d2/40 bg-game-d2/10 px-3 font-mono text-[10px] tracking-[0.3em] text-game-d2 transition-colors hover:border-game-d2/80 hover:bg-game-d2/20"
        >
          // TODAY
        </Link>
      )}
      {stepper.awaitingToday && (
        <span
          aria-label="Today's rotation has not been published yet"
          title="Today's rotation has not been published upstream — expected around 10:00 CEST (08:00 UTC)"
          className="inline-flex h-9 items-center justify-center gap-2 border border-rga-green/30 bg-rga-green/[0.05] px-3 font-mono text-[10px] tracking-[0.3em] text-rga-green/80"
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-[1px] bg-rga-green shadow-[0_0_6px_#00FF41]"
          />
          // AWAITING TODAY
        </span>
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
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const srLabel = direction === 'prev' ? 'Previous day' : 'Next day'

  if (!target) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center border border-game-d2/10 bg-[rgba(0,0,0,0.4)] text-game-d2/30"
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
    )
  }

  return (
    <Link
      href={target.href}
      scroll={false}
      prefetch={false}
      aria-label={`${srLabel} · ${target.label}`}
      className="inline-flex h-9 w-9 items-center justify-center border border-game-d2/25 bg-[rgba(0,0,0,0.4)] text-game-d2 transition-colors hover:border-game-d2/70 hover:bg-game-d2/10"
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </Link>
  )
}
