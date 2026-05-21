import { FailRow } from '@/components/ui/FailRow'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { EmptyDossier } from '@/components/division2/EmptyDossier'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
import { DigestCard } from './DigestCard'
import { DigestHero } from './DigestHero'
import { WeekStepper, type WeekStepperState } from './WeekStepper'
import { BoosterPerksWidget } from './BoosterPerksWidget'
import { DevPreviewToggle } from './DevPreviewToggle'
import { formatDayShort } from '@/lib/division2/format'
import type { AshleyResult } from '@/lib/api/server'
import type { DigestList, Digest } from '@/lib/division2/digest.server'
import type { Division2 } from '@/payload-types'

type DigestPageContent = NonNullable<Division2['digestPage']>

interface DigestPageProps {
  /** Primary fetch result — drives the LIVE/OFFLINE pill and page-level error UI. */
  weekly: AshleyResult<DigestList>
  /** Digests landing in the active calendar week, sorted by periodStart desc. */
  digestsForWeek: Digest[]
  /** Monday (UTC, YYYY-MM-DD) of the active calendar week. */
  activeWeekStart: string
  /** True when the viewer can see daily briefings (booster). */
  hasAccess: boolean
  /** True only when the dev `?as=member` override is currently in effect. */
  isPreviewingAsMember: boolean
  /** Whether the dev toggle UI should be rendered (localhost only). */
  showDevToggle: boolean
  stepper: WeekStepperState | null
  /** True when the active week is the newest data-bearing week — drives the LATEST hero. */
  isLatestWeek: boolean
  content: DigestPageContent | null | undefined
}

const DEFAULTS = {
  heroKicker: '// DIVISION 2 · AI BRIEFINGS',
  heroTitle: 'AI',
  heroAccent: 'BRIEFINGS',
  intro:
    'AI-summarized briefings on the Division 2 firehose. Weekly roll-ups are open to every operative; daily briefings unlock for Discord boosters.',
} as const

export function DigestPage({
  weekly,
  digestsForWeek,
  activeWeekStart,
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

  return (
    <Shell>
      <header className="flex flex-col gap-7 sm:gap-9">
        <StatRibbon
          prefix="// BRIEFINGS"
          fields={[
            {
              label: 'WEEK',
              value: formatDayShort(activeWeekStart),
              accent: 'green',
            },
            {
              label: 'FILES',
              value: String(digestsForWeek.length).padStart(2, '0'),
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
        digestsForWeek={digestsForWeek}
        activeWeekStart={activeWeekStart}
        hasAccess={hasAccess}
        content={content}
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
  digestsForWeek: Digest[]
  activeWeekStart: string
  hasAccess: boolean
  content: DigestPageContent | null | undefined
  isLatestWeek: boolean
}

function DigestBody({
  weekly,
  digestsForWeek,
  activeWeekStart,
  hasAccess,
  content,
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

  if (digestsForWeek.length === 0) {
    return <EmptyDossier kind="NO_DIGEST_FOR_WEEK" weekStart={activeWeekStart} />
  }

  // The newest week gets a featured lead card; older weeks render as a
  // uniform grid. Same treatment regardless of whether the lead is a weekly
  // roll-up or a daily briefing — frequency is just an accent color.
  const showLeadHero = isLatestWeek
  const lead = showLeadHero ? digestsForWeek[0] : null
  const gridItems = showLeadHero ? digestsForWeek.slice(1) : digestsForWeek
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
          <DigestCard digest={lead} tone="lead" />
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
                {gridItems.map((d) => (
                  <DigestCard key={d.id} digest={d} />
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
