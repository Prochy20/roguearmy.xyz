import { FailRow } from '@/components/shared/FailRow'
import { StatRibbon } from '@/components/shared/StatRibbon'
import { EmptyDossier } from '@/components/shared/EmptyDossier'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
import { DigestCard } from './DigestCard'
import { DigestHero } from './DigestHero'
import { WeekStepper, type WeekStepperState } from './WeekStepper'
import { BoosterPerksWidget } from './BoosterPerksWidget'
import { DevPreviewToggle } from './DevPreviewToggle'
import { formatDayShort } from '@/lib/division2/format'
import type { AshleyResult } from '@/lib/api/server'
import type { Digest, DigestList } from '@/lib/division2/digest.server'
import type { Division2 } from '@/payload-types'

type DigestPageContent = NonNullable<Division2['digestPage']>

interface DigestPageProps {
  /** Full weekly archive result — drives the stepper. */
  weekly: AshleyResult<DigestList>
  /** The weekly digest for the selected week, or null when not found. */
  currentWeekly: Digest | null
  /** Dailies belonging to the current week (only fetched for digest-access users). */
  dailies: AshleyResult<Digest[]> | null
  /** True when the viewer can see daily briefings. */
  hasAccess: boolean
  /** True only when the dev `?as=member` override is currently in effect. */
  isPreviewingAsMember: boolean
  /** Whether the dev toggle UI should be rendered (localhost only). */
  showDevToggle: boolean
  stepper: WeekStepperState | null
  /** True when the viewer is on the newest week — drives the LATEST hero treatment. */
  isLatestWeek: boolean
  content: DigestPageContent | null | undefined
}

const DEFAULTS = {
  heroKicker: '// DIVISION 2 · AI BRIEFINGS',
  heroTitle: 'AI',
  heroAccent: 'BRIEFINGS',
  intro:
    'AI-summarized briefings on the Division 2 firehose. Weekly roll-ups are open to every operative; daily briefings unlock for Discord boosters.',
  weeklySectionLabel: '// THIS WEEK',
  dailiesSectionLabel: '// DAILY BRIEFINGS',
  emptyWeek: '// NO BRIEFING FOR THIS WEEK',
  emptyAll: '// BRIEFINGS ARCHIVE EMPTY — AWAITING FIRST RUN',
} as const

export function DigestPage({
  weekly,
  currentWeekly,
  dailies,
  hasAccess,
  isPreviewingAsMember,
  showDevToggle,
  stepper,
  isLatestWeek,
  content,
}: DigestPageProps) {
  const heroKicker = content?.heroKicker?.trim() || DEFAULTS.heroKicker
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro
  const weeklySectionLabel =
    content?.weeklySectionLabel?.trim() || DEFAULTS.weeklySectionLabel
  const dailiesSectionLabel =
    content?.dailiesSectionLabel?.trim() || DEFAULTS.dailiesSectionLabel

  return (
    <Shell>
      <header className="flex flex-col gap-7 sm:gap-9">
        <StatRibbon
          prefix="// BRIEFINGS"
          fields={[
            {
              label: 'WEEK',
              value: currentWeekly ? formatDayShort(currentWeekly.periodStart) : '—',
              accent: 'green',
            },
            {
              label: 'SLOTS',
              value: hasAccess ? '8' : '1',
              accent: 'green',
            },
            {
              label: 'TIER',
              value: hasAccess ? 'BOOSTER' : 'MEMBER',
              accent: hasAccess ? 'green' : 'mod',
            },
          ]}
          pill={
            weekly.ok
              ? { text: 'LIVE', ok: true, accent: 'green' }
              : { text: 'OFFLINE', ok: false }
          }
        />

        <DigestHero
          kicker={heroKicker}
          title={heroTitle}
          accent={heroAccent}
          intro={intro}
        />

        {stepper && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <WeekStepper state={stepper} />
            {showDevToggle && (
              <DevPreviewToggle isPreviewingAsMember={isPreviewingAsMember} />
            )}
          </div>
        )}
      </header>

      <DigestBody
        weekly={weekly}
        currentWeekly={currentWeekly}
        dailies={dailies}
        hasAccess={hasAccess}
        content={content}
        weeklySectionLabel={weeklySectionLabel}
        dailiesSectionLabel={dailiesSectionLabel}
        isLatestWeek={isLatestWeek}
      />

      {stepper && (
        <footer className="flex justify-center pt-4">
          <WeekStepper state={stepper} />
        </footer>
      )}
    </Shell>
  )
}

interface DigestBodyProps {
  weekly: AshleyResult<DigestList>
  currentWeekly: Digest | null
  dailies: AshleyResult<Digest[]> | null
  hasAccess: boolean
  content: DigestPageContent | null | undefined
  weeklySectionLabel: string
  dailiesSectionLabel: string
  isLatestWeek: boolean
}

function DigestBody({
  weekly,
  currentWeekly,
  dailies,
  hasAccess,
  content,
  weeklySectionLabel,
  dailiesSectionLabel,
  isLatestWeek,
}: DigestBodyProps) {
  if (!weekly.ok) {
    return (
      <FailRow
        code={weekly.error.code}
        status={weekly.error.status}
        returnTo="/division-2/digest"
      />
    )
  }

  if (weekly.data.items.length === 0) {
    return <EmptyDossier kind="NO_DIGEST_FOR_WEEK" />
  }

  if (!currentWeekly) {
    return (
      <EmptyDossier
        kind="NO_DIGEST_FOR_WEEK"
        weekStart={weekly.data.items[0]?.periodStart}
      />
    )
  }

  const dailyItems = hasAccess && dailies?.ok ? dailies.data : []
  // Merge weekly + dailies into one chronological feed. Sort by periodStart
  // descending so the newest day surfaces first; the weekly drops in wherever
  // its periodStart (Monday of the week) places it — no special elevation.
  const allDigests = [currentWeekly, ...dailyItems].sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  )
  void weeklySectionLabel
  void dailiesSectionLabel

  const lead = allDigests[0]
  // The LATEST hero only appears on the newest week. Paginating back to an
  // older week collapses everything into a single uniform grid section.
  const showLeadHero = isLatestWeek
  const gridItems = showLeadHero ? allDigests.slice(1) : allDigests
  const gridLabel = showLeadHero ? '// ARCHIVE' : '// BRIEFING INDEX'
  const gridSec = showLeadHero ? 'SEC_02' : 'SEC_01'
  const gridAccent: 'green' | 'mod' = showLeadHero ? 'mod' : 'green'

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* SEC_01 — lead hero. Rendered OUTSIDE GlitchOnChange because its
          `overflow-hidden` would clip the lead's outside-floating corner
          brackets. The lead's URL-driven re-render handles freshness fine
          without the glitch effect. */}
      {showLeadHero && lead && (
        <Section sec="SEC_01" label="// LATEST" accent="green">
          <DigestCard digest={lead} tone="lead" />
        </Section>
      )}

      {/* Everything else can glitch on week-change without consequence,
          since standard cards no longer render outside-floating corners. */}
      <GlitchOnChange triggerKey={currentWeekly.periodStart}>
        <div className="flex flex-col gap-10 sm:gap-12">
          {hasAccess && (
            <Section
              sec={gridSec}
              label={gridLabel}
              accent={gridAccent}
              meta={
                dailies?.ok ? (
                  <span className="tabular-nums">
                    {String(gridItems.length).padStart(2, '0')} FILES
                  </span>
                ) : null
              }
            >
              {gridItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {gridItems.map((d) => (
                    <DigestCard key={d.id} digest={d} />
                  ))}
                </div>
              ) : dailies && !dailies.ok ? (
                <FailRow
                  code={dailies.error.code}
                  status={dailies.error.status}
                  returnTo="/division-2/digest"
                />
              ) : (
                <div className="border border-dashed border-text-muted/30 bg-[rgba(0,0,0,0.3)] px-5 py-8 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
                  // NO ADDITIONAL BRIEFINGS PUBLISHED THIS WEEK
                </div>
              )}
            </Section>
          )}

          {!hasAccess && !showLeadHero && lead && (
            <Section sec="SEC_01" label="// BRIEFING INDEX" accent="green">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                <DigestCard digest={lead} />
              </div>
            </Section>
          )}

          {!hasAccess && (
            <Section
              sec="SEC_02"
              label="// ARCHIVE"
              accent="mod"
              meta={<span>// BOOSTER PERK</span>}
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
        : 'text-rga-mod'
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
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pt-20 pb-20 sm:gap-14 sm:px-8 sm:pt-24 sm:pb-28 lg:px-16 lg:pt-32 lg:pb-36">
      {children}
    </div>
  )
}
