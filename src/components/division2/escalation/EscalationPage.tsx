import { FailRow } from '@/components/ui/FailRow'
import { EmptyDossier } from '@/components/division2/EmptyDossier'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { D2_ROOT, ESCALATION_ROOT } from '@/components/ui/trail-roots'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { EscalationDayStepper, MissionRow } from './MissionRow'
import { PrototypeCaches } from './PrototypeCaches'
import { EscalationDiscordRow } from './EscalationDiscordRow'
import {
  ashleyTimestampToUtcIso,
  formatDayShort,
  formatDayWithWeekday,
  hoursSince,
  STALE_HOURS_THRESHOLD,
  todayUtcIso,
} from '@/lib/division2/format'
import { UserLocalTime } from './UserLocalTime'
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
  /** True when the user landed on the default route (no explicit `?day`) but
   *  today's data hadn't ingested yet, so we walked back to the last
   *  available day. Drives the info banner + disables the `// TODAY` jump. */
  awaitingTodayIngest: boolean
  /** Editable copy sourced from the Division 2 global. Fields fall back to
   *  built-in defaults if the admin clears them, so the page never goes blank. */
  content: EscalationPageContent | null | undefined
}

const DEFAULTS = {
  // Location used to live here ("// DIVISION 2 · ESCALATION · …") — moved to
  // the StatRibbon trail. The kicker is now just a flavor line.
  heroKicker: '// TARGETED LOOT',
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
export function EscalationPage({
  daily,
  week,
  targetDay,
  awaitingTodayIngest,
  content,
}: EscalationPageProps) {
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
  // Ashley ships fetchedAt as Prague wall-clock labeled as UTC; normalize
  // to a real UTC instant before any formatting or staleness math runs.
  const rawFetchedAt = dailyData?.fetchedAt ?? weekData?.fetchedAt ?? null
  const fetchedAt = rawFetchedAt ? ashleyTimestampToUtcIso(rawFetchedAt) : null
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
    <>
      {/* Page chrome — at <lg ribbon renders inline (no stick) to save scarce
          vertical space on phones/tablets. From lg+ it sticks at MENU's
          vertical center and stretches almost to MENU's left bracket
          (pr:140 = MENU footprint + 8px gap). The trail leaf carries the
          weekday + date so the legacy DAY field is gone — same info would
          appear twice in one ribbon row. */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-32 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[
            D2_ROOT,
            ESCALATION_ROOT,
            { label: formatDayWithWeekday(resolvedDay).toUpperCase() },
          ]}
          fields={[
            { label: 'MISSIONS', value: missions.length || '—' },
            { label: 'SYNCED', value: syncedLabel },
          ]}
          pill={
            isStale
              ? { text: 'STALE', mode: 'warn' }
              : { text: statusToken, mode: 'info' }
          }
        />
      </div>

      {/* Mirrors `Shell` (used by the error cases below) minus the full Header
          clearance — the sticky ribbon above already pushes content past the
          fixed nav, so we only need a small breathing gap. */}
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pt-7 pb-20 sm:gap-14 sm:px-8 sm:pt-9 sm:pb-28 lg:px-16 lg:pt-10 lg:pb-36">
        <header className="flex flex-col gap-7 sm:gap-9">
          <div className="flex min-w-0 flex-col gap-7">
            {heroKicker && (
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                {heroKicker}
              </div>
            )}

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
          {awaitingTodayIngest && (
            <AwaitingIngestBanner resolvedDay={resolvedDay} />
          )}
          <MissionRow
            missions={missions}
            dayLootByPosition={dayLootByPosition}
            selectedDay={resolvedDay}
            awaitingTodayIngest={awaitingTodayIngest}
            sectionLabel={content?.missionsSectionLabel ?? undefined}
          />
          <PrototypeCaches
            caches={caches}
            glitchKey={resolvedDay}
            sectionLabel={content?.cachesSectionLabel ?? undefined}
            blurb={content?.cachesBlurb ?? undefined}
          />
          <div className="flex justify-end pt-2">
            <EscalationDayStepper
              selectedDay={resolvedDay}
              awaitingTodayIngest={awaitingTodayIngest}
            />
          </div>
          <EscalationDiscordRow content={content?.discord} />
        </div>
      </div>
    </>
  )
}

/**
 * Info banner shown when the page fell back from today to the last available
 * day. Expected publish time is anchored on upstream's UTC cadence; per-user
 * local-time rendering is handled by `UserLocalTime` on the client.
 */
const EXPECTED_PUBLISH_HOUR_UTC = 9

function AwaitingIngestBanner({ resolvedDay }: { resolvedDay: string }) {
  const hh = String(EXPECTED_PUBLISH_HOUR_UTC).padStart(2, '0')
  const expectedUtcIso = `${todayUtcIso()}T${hh}:00:00.000Z`
  const expectedUtcLabel = formatUtcHourLabel(expectedUtcIso)
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-rga-green/30 bg-rga-green/[0.04] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-rga-green sm:px-5"
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-[1px] bg-rga-green shadow-[0_0_8px_#00FF41]"
      />
      <span className="text-rga-green">// AWAITING TODAY&apos;S ROTATION</span>
      <span className="text-text-secondary normal-case tracking-[0.05em]">
        Today&apos;s drops haven&apos;t published upstream yet — viewing the
        last available day ({formatDayShort(resolvedDay)}).
      </span>
      <span className="ml-auto text-rga-green/80">
        // EXPECTED ≈{' '}
        <UserLocalTime
          utcIso={expectedUtcIso}
          fallback={`${expectedUtcLabel} UTC`}
        />{' '}
        · {expectedUtcLabel} UTC
      </span>
    </div>
  )
}

/** "HH:MM" formatted in UTC from a true-UTC ISO. */
function formatUtcHourLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
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
