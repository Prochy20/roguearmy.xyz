import { FailRow } from '@/components/shared/FailRow'
import { EmptyDossier } from '@/components/shared/EmptyDossier'
import { StatRibbon } from '@/components/shared/StatRibbon'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
import { EscalationDayStepper, MissionRow } from './MissionRow'
import { PrototypeCaches } from './PrototypeCaches'
import { EscalationDiscordRow } from './EscalationDiscordRow'
import {
  formatDayWithWeekday,
  hoursSince,
  STALE_HOURS_THRESHOLD,
  todayUtcIso,
} from '@/lib/division2/format'
import type { AshleyResult } from '@/lib/api/server'
import type {
  EscalationDailyDetail,
  EscalationLootItem,
  EscalationMission,
  EscalationPrototypeCache,
  EscalationWeekDetail,
} from '@/lib/division2/escalation.server'
import type { Division2 } from '@/payload-types'

type EscalationPageContent = NonNullable<Division2['escalationPage']>

interface EscalationPageProps {
  /** Authoritative source for the selected day's items + caches + week summary. */
  daily: AshleyResult<EscalationDailyDetail>
  /** Week containing `targetDay`. Used as a missions fallback when `daily`
   *  404s, so the page still shows mission names with "PENDING UPSTREAM" for
   *  the drops rather than collapsing into an empty state. */
  week: AshleyResult<EscalationWeekDetail>
  /** The day the page is meant to render (server-resolved, already clamped). */
  targetDay: string
  /** Editable copy sourced from the Division 2 global. Fields fall back to
   *  built-in defaults if the admin clears them, so the page never goes blank. */
  content: EscalationPageContent | null | undefined
}

const DEFAULTS = {
  heroKicker: '// DIVISION 2 · ESCALATION · TARGETED LOOT',
  heroTitle: 'ESCALATION',
  heroAccent: 'PROTOCOL',
  intro:
    'Targeted-loot rotation for the active escalation. Step through any day — back through prior days if you need older intel.',
} as const

/**
 * Day-by-day escalation view. Always renders a single day's data:
 *   - which missions are active this week (from the day's embedded week summary)
 *   - what's targeted-dropping today (items)
 *   - what the vendor's selling today (prototypeCaches)
 *
 * The day-stepper navigates the calendar by single days, without any
 * notion of "weeks" in the URL or UI — everything is keyed on a single
 * `?day=YYYY-MM-DD` param.
 */
export function EscalationPage({ daily, week, targetDay, content }: EscalationPageProps) {
  // Hard fail only when BOTH the day and the week are unavailable — we have
  // nothing to render.
  if (!daily.ok && !week.ok) {
    const code = week.error.code
    if (code === 'not_found') {
      return (
        <Shell>
          <EmptyDossier kind="AWAITING_FIRST_SYNC" />
        </Shell>
      )
    }
    return (
      <Shell>
        <FailRow code={code} status={week.error.status} returnTo="/division-2/escalation" />
      </Shell>
    )
  }

  // Source of truth ordering:
  //   - missions: prefer daily.data.week.missions, fall back to week.data.missions
  //   - items/caches: only daily.data has them (empty when daily 404s)
  //   - fetchedAt:  prefer daily.data.fetchedAt (most recent)
  const dailyData = daily.ok ? daily.data : null
  const weekData = week.ok ? week.data : null

  const missions: EscalationMission[] =
    dailyData?.week.missions ?? weekData?.missions ?? []
  const fetchedAt = dailyData?.fetchedAt ?? weekData?.fetchedAt ?? null
  const items: EscalationLootItem[] = dailyData?.items ?? []
  const caches: EscalationPrototypeCache | null = dailyData?.prototypeCaches ?? null

  const dayLootByPosition = new Map<number, EscalationLootItem>()
  for (const item of items) {
    dayLootByPosition.set(item.position, item)
  }

  const todayIso = todayUtcIso()
  const resolvedDay = targetDay
  const isToday = resolvedDay === todayIso
  const statusToken = isToday ? 'TODAY' : 'VIEWING'

  const ageHours = fetchedAt ? hoursSince(fetchedAt) : NaN
  const isStale = Number.isFinite(ageHours) && ageHours > STALE_HOURS_THRESHOLD
  const syncedLabel = fetchedAt ? formatSynced(fetchedAt) : '—'

  const heroKicker = content?.heroKicker?.trim() || DEFAULTS.heroKicker
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro

  return (
    <Shell>
      <header className="flex flex-col gap-7 sm:gap-9">
        <GlitchOnChange triggerKey={resolvedDay}>
          <StatRibbon
            prefix="// SNAPSHOT"
            fields={[
              {
                label: 'DAY',
                value: formatDayWithWeekday(resolvedDay).toUpperCase(),
                accent: 'mod',
              },
              { label: 'MISSIONS', value: missions.length || '—', accent: 'mod' },
              { label: 'SYNCED', value: syncedLabel },
            ]}
            pill={
              isStale
                ? { text: 'STALE', ok: false }
                : { text: statusToken, ok: true, accent: 'mod' }
            }
          />
        </GlitchOnChange>

        <div className="flex min-w-0 flex-col gap-7">
          <GlitchOnChange triggerKey={resolvedDay}>
            <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-rga-mod">
              {heroKicker} · {statusToken} ·{' '}
              {formatDayWithWeekday(resolvedDay).toUpperCase()}
            </div>
          </GlitchOnChange>

          <h1
            className="font-display uppercase leading-[0.85] tracking-[0.005em] text-balance break-words"
            style={{ fontSize: 'clamp(48px, 9vw, 144px)' }}
          >
            <HeroGlitch
              className="block"
              minInterval={4}
              maxInterval={10}
              intensity={8}
              dataCorruption
              scanlines
            >
              <span className="text-text-primary">{heroTitle}</span>
            </HeroGlitch>
            <HeroGlitch
              className="block"
              minInterval={5}
              maxInterval={12}
              intensity={7}
              dataCorruption={false}
              colors={['#ff8000', '#ffae42']}
            >
              <span
                className="text-rga-mod"
                style={{
                  textShadow:
                    '0 0 36px rgba(255,128,0,0.45), 0 0 80px rgba(255,128,0,0.18)',
                }}
              >
                {heroAccent}
              </span>
            </HeroGlitch>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {intro}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 sm:gap-8">
        <GlitchOnChange triggerKey={resolvedDay}>
          <div className="flex flex-col gap-6 sm:gap-8">
            <MissionRow
              missions={missions}
              dayLootByPosition={dayLootByPosition}
              selectedDay={resolvedDay}
              sectionLabel={content?.missionsSectionLabel ?? undefined}
            />
            <PrototypeCaches
              caches={caches}
              sectionLabel={content?.cachesSectionLabel ?? undefined}
              blurb={content?.cachesBlurb ?? undefined}
            />
            <div className="flex justify-end pt-2">
              <EscalationDayStepper selectedDay={resolvedDay} />
            </div>
          </div>
        </GlitchOnChange>
        <EscalationDiscordRow content={content?.discord} />
      </div>
    </Shell>
  )
}

function formatSynced(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} UTC`
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pt-20 pb-20 sm:gap-14 sm:px-8 sm:pt-24 sm:pb-28 lg:px-16 lg:pt-32 lg:pb-36">
      {children}
    </div>
  )
}
