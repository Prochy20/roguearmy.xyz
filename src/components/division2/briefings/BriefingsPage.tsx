import { FailRow } from '@/components/ui/FailRow'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { D2_ROOT, BRIEFINGS_ROOT } from '@/components/ui/trail-roots'
import { EmptyDossier } from '@/components/division2/EmptyDossier'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
import { BriefingCard } from './BriefingCard'
import { BriefingHero } from './BriefingHero'
import { WashingtonMap } from './WashingtonMap'
import { WeekStepper, type WeekStepperState } from './WeekStepper'
import { BoosterPerksWidget } from './BoosterPerksWidget'
import { formatDayShort } from '@/lib/division2/format'
import type { AshleyResult } from '@/lib/api/server'
import type { BriefingList, Briefing } from '@/lib/division2/briefing.server'
import type { BriefingProgress } from '@/lib/progress.server'
import type { Division2 } from '@/payload-types'

type BriefingsPageContent = NonNullable<Division2['briefingsPage']>

interface BriefingsPageProps {
  /** Primary fetch result — drives the LIVE/OFFLINE pill and page-level error UI. */
  weekly: AshleyResult<BriefingList>
  /** Briefings landing in the active calendar week, sorted by periodStart desc. */
  briefingsForWeek: Briefing[]
  /** Monday (UTC, YYYY-MM-DD) of the active calendar week. */
  activeWeekStart: string
  /** True when the viewer can see daily briefings (booster). */
  hasAccess: boolean
  stepper: WeekStepperState | null
  /** True when the active week is the newest data-bearing week — drives the LATEST hero. */
  isLatestWeek: boolean
  content: BriefingsPageContent | null | undefined
  /**
   * Briefing-id → progress map for the visible week. `null` for anonymous
   * viewers (no progress chip shown). Plain object (not Map) so it crosses
   * the server → client prop boundary cleanly.
   */
  briefingProgress: Record<string, BriefingProgress> | null
}

const DEFAULTS = {
  heroTitle: 'AI',
  heroAccent: 'BRIEFINGS',
  intro:
    'AI-summarized briefings on the Division 2 firehose. Weekly roll-ups are open to every operative; daily briefings unlock for Discord boosters.',
} as const

export function BriefingsPage({
  weekly,
  briefingsForWeek,
  activeWeekStart,
  hasAccess,
  stepper,
  isLatestWeek,
  content,
  briefingProgress,
}: BriefingsPageProps) {
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro

  return (
    <div>
      {/* Page chrome — at <lg the ribbon renders inline (no stick) so it
          doesn't eat scarce vertical space on phones/tablets. From lg+ it
          sticks at the MENU button's vertical center (top:21 = MENU center 40
          minus half ribbon height ~19) and its right edge approaches MENU's
          left bracket (pr:140 = MENU footprint ~132 + 8px visual gap). */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-28 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[D2_ROOT, BRIEFINGS_ROOT, { label: heroTitle }]}
          fields={[
            {
              label: 'WEEK',
              value: formatDayShort(activeWeekStart),
            },
            {
              label: 'FILES',
              value: String(briefingsForWeek.length).padStart(2, '0'),
            },
            {
              label: 'TIER',
              value: hasAccess ? 'BOOSTER' : 'MEMBER',
            },
          ]}
          pill={
            weekly.ok
              ? { text: 'LIVE', mode: 'info' }
              : { text: 'OFFLINE', mode: 'error' }
          }
        />
      </div>

      {/* Hero section — lives OUTSIDE the body Shell so the WashingtonMap can
          escape the max-width container with its negative-right offset. The
          `:has()` hover-zone pattern + --scanner-shove custom property mirror
          StaffManifestHeader (the radar's hero) so the two pages share the
          same scanner-family interaction language. Top clearance is provided
          by the sticky ribbon above (its mt-20 pushes everything below). */}
      <section
        className="relative overflow-hidden px-4 pt-7 pb-10 sm:px-8 sm:pt-9 sm:pb-12 lg:px-16 lg:pb-14 [--scanner-shove:180px] xl:[--scanner-shove:230px] 2xl:[--scanner-shove:280px]"
        aria-label="Briefings hero"
      >
        <div
          aria-hidden
          className="rga-scanner-hover-zone pointer-events-auto absolute top-2 -right-[300px] hidden aspect-square w-[600px] rounded-full lg:block xl:top-4 xl:-right-[380px] xl:w-[760px] 2xl:top-6 2xl:-right-[460px] 2xl:w-[920px]"
        />

        <WashingtonMap
          className="absolute top-2 -right-[300px] transition-transform duration-500 ease-out will-change-transform xl:top-4 xl:-right-[380px] 2xl:top-6 2xl:-right-[460px] motion-safe:[section:has(.rga-scanner-hover-zone:hover)_&]:translate-x-[calc(-1*var(--scanner-shove))]"
        />

        {/* Bottom edge fade — anchored to the section's bottom, NOT the
            map's, so it dissolves the map's lower edge into page-bg at
            every breakpoint. (The map's own radial fade hits #000 at
            its container's y=100%, but the section clips the map well
            before that — leaving a visible hard edge without this.) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 hidden lg:block"
          style={{
            background:
              'linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 22%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-7 sm:gap-9">
          <div className="flex flex-col gap-7 sm:gap-9 transition-transform duration-500 ease-out motion-safe:[section:has(.rga-scanner-hover-zone:hover)_&]:translate-x-[calc(-1*var(--scanner-shove))]">
            <BriefingHero
              title={heroTitle}
              accent={heroAccent}
              intro={intro}
            />

            {stepper && <WeekStepper state={stepper} />}
          </div>
        </div>
      </section>

      <Shell>
        <BriefingsBody
          weekly={weekly}
          briefingsForWeek={briefingsForWeek}
          activeWeekStart={activeWeekStart}
          hasAccess={hasAccess}
          content={content}
          isLatestWeek={isLatestWeek}
          briefingProgress={briefingProgress}
        />

        {stepper && (
          <footer className="flex justify-center pt-4">
            <WeekStepper state={stepper} />
          </footer>
        )}
      </Shell>
    </div>
  )
}

interface BriefingsBodyProps {
  weekly: AshleyResult<BriefingList>
  briefingsForWeek: Briefing[]
  activeWeekStart: string
  hasAccess: boolean
  content: BriefingsPageContent | null | undefined
  isLatestWeek: boolean
  briefingProgress: Record<string, BriefingProgress> | null
}

function BriefingsBody({
  weekly,
  briefingsForWeek,
  activeWeekStart,
  hasAccess,
  content,
  isLatestWeek,
  briefingProgress,
}: BriefingsBodyProps) {
  if (!weekly.ok) {
    return (
      <FailRow
        code={weekly.error.code}
        status={weekly.error.status}
        returnTo="/division-2/briefings"
      />
    )
  }

  if (briefingsForWeek.length === 0) {
    return <EmptyDossier kind="NO_BRIEFING_FOR_WEEK" weekStart={activeWeekStart} />
  }

  // The newest week gets a featured lead card; older weeks render as a
  // uniform grid. Same treatment regardless of whether the lead is a weekly
  // roll-up or a daily briefing — frequency is just an accent color.
  const showLeadHero = isLatestWeek
  const lead = showLeadHero ? briefingsForWeek[0] : null
  const gridItems = showLeadHero ? briefingsForWeek.slice(1) : briefingsForWeek
  const gridLabel = showLeadHero ? '// ARCHIVE' : '// BRIEFING INDEX'
  const gridSec = showLeadHero ? 'SEC_02' : 'SEC_01'
  const gridAccent: 'green' | 'mod' = showLeadHero ? 'mod' : 'green'

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* SEC_01 — lead hero. Rendered OUTSIDE GlitchOnChange because its
          `overflow-hidden` would clip the lead's outside-floating corner
          brackets. */}
      {showLeadHero && lead && (
        <Section sec="SEC_01" label="// LATEST" accent="green">
          <BriefingCard
            briefing={lead}
            tone="lead"
            progress={briefingProgress?.[lead.id] ?? null}
          />
        </Section>
      )}

      <GlitchOnChange triggerKey={activeWeekStart}>
        <div className="flex flex-col gap-10 sm:gap-12">
          <Section
            sec={gridSec}
            label={gridLabel}
            accent={gridAccent}
            meta={
              <span className="tabular-nums">
                {String(gridItems.length).padStart(2, '0')} FILES
              </span>
            }
          >
            {gridItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {gridItems.map((b) => (
                  <BriefingCard
                    key={b.id}
                    briefing={b}
                    progress={briefingProgress?.[b.id] ?? null}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-text-muted/30 bg-[rgba(0,0,0,0.3)] px-5 py-8 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
                // NO ADDITIONAL BRIEFINGS THIS WEEK
              </div>
            )}
          </Section>

          {!hasAccess && (
            <Section
              sec={showLeadHero ? 'SEC_03' : 'SEC_02'}
              label="// BOOSTER PERK"
              accent="mod"
            >
              <BoosterPerksWidget perks={content?.perks ?? null} />
            </Section>
          )}
        </div>
      </GlitchOnChange>
    </div>
  )
}

function Section({
  sec,
  label,
  accent,
  meta,
  children,
}: {
  sec: string
  label: string
  accent: 'green' | 'cyan' | 'mod'
  meta?: React.ReactNode
  children: React.ReactNode
}) {
  const accentClass =
    accent === 'green'
      ? 'text-rga-green'
      : accent === 'cyan'
        ? 'text-rga-cyan'
        : 'text-game-d2'
  return (
    <section className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[10px] tracking-[0.4em] ${accentClass}`}>
            {sec}
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            {label}
          </span>
        </div>
        {meta && (
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted/80">
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pb-20 sm:gap-14 sm:px-8 sm:pb-28 lg:px-16 lg:pb-36">
      {children}
    </div>
  )
}
