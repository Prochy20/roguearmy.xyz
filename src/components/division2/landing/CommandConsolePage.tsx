import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { RGA_ROOT } from '@/components/ui/trail-roots'
import { todayUtcIso } from '@/lib/division2/format'
import type { LandingState } from '@/lib/division2/landing.server'
import type { Division2 } from '@/payload-types'
import { BriefingPanel } from './BriefingPanel'
import { DivisionLogo } from './DivisionLogo'
import { IntelFeedPanel } from './IntelFeedPanel'
import { LootStripPanel } from './LootStripPanel'
import { RaidsPanel, type RaidsScheduleEntry } from './RaidsPanel'

type LandingPageContent = NonNullable<Division2['landingPage']>
type BriefingsPerks = NonNullable<NonNullable<Division2['briefingsPage']>['perks']>

interface CommandConsolePageProps {
  /** Aggregated state for the ribbon + peek data. */
  state: LandingState
  /** Editable copy for the landing page itself (hero, ribbon prefix, etc.). */
  content: LandingPageContent | null | undefined
  /** True when the viewer can see daily briefings under the weekly card. */
  hasAccess: boolean
  /** Booster perks copy from the briefings page CMS — shown to non-boosters under SEC_03. */
  perks: BriefingsPerks | null | undefined
}

const DEFAULTS = {
  heroTitle: 'COMMAND',
  heroAccent: 'CONSOLE',
  intro:
    "The Division 2 ops console — live intel on the game in one panel. Today's escalation rotation, the latest content from across the community, and Ashley's weekly AI briefing.",
  raids: {
    headlineTitle: 'WEEKLY',
    headlineAccent: 'RAIDS',
    blurb:
      'Iron Horse on Saturday. Dark Hours on Sunday. The Apollo bot handles signups in Discord #events — RSVP to lock your slot.',
    rotationLabel: '// REGULAR ROTATION',
    schedule: [
      {
        day: 'SATURDAY',
        title: 'IRON HORSE',
        imagePrimary: '/division2/img/raids/iron-horse-1.jpg',
        imageSecondary: '/division2/img/raids/iron-horse-2.jpg',
      },
      {
        day: 'SUNDAY',
        title: 'DARK HOURS',
        imagePrimary: '/division2/img/raids/dark-hours-1.jpg',
        imageSecondary: '/division2/img/raids/dark-hours-2.jpg',
      },
    ] satisfies RaidsScheduleEntry[],
    ctaLabel: 'OPEN #EVENTS',
    discordUrl: 'https://discord.com/channels/935163066432229386/',
  },
} as const

/**
 * `/division-2` Command Console — the hub for the Division 2 subsection.
 *
 * Page composition (top → bottom):
 *
 *   • StatRibbon — aggregate state across the three tools.
 *   • Hero       — `COMMAND / CONSOLE` two-line headline + intro.
 *   • SEC_01     — live intel feed (compact peek into /content).
 *   • SEC_02     — today's targeted loot strip (compact peek into /escalation).
 *   • SEC_03     — latest weekly briefing (compact peek into /briefings).
 *   • SEC_04     — weekly raids (Discord-routed via Apollo bot).
 *
 * Each peek widget is purpose-built — it does NOT reuse the destination
 * page's full card chrome. The widgets are intentionally sparse and
 * console-shaped so the landing reads as a tactical overview rather than a
 * duplicate of any one tool. Each widget carries its own `OPEN X →` CTA.
 *
 * Per-section graceful degradation: when a source fetch fails, the matching
 * peek section is hidden — the StatRibbon's aggregate pill (DEGRADED /
 * OFFLINE) and the TOOLS field carry the failure signal at page level.
 */
export function CommandConsolePage({
  state,
  content,
  hasAccess,
  perks,
}: CommandConsolePageProps) {
  const heroTitle = content?.heroTitle?.trim() || DEFAULTS.heroTitle
  const heroAccent = content?.heroAccent?.trim() || DEFAULTS.heroAccent
  const intro = content?.intro?.trim() || DEFAULTS.intro

  const today = todayUtcIso()
  const escalationPeek = state.peeks.escalation
  const contentPeek = state.peeks.content
  const briefingPeek = state.peeks.briefing

  // Now-time threaded into the intel feed for stable timeago strings.
  const now = Date.now()

  // Resolve all SEC_04 raid copy from the CMS, falling back to bundled
  // defaults per-field so a partial admin edit can't leave the section in a
  // broken half-empty state.
  const rawSchedule = content?.raids?.schedule ?? null
  const schedule: RaidsScheduleEntry[] =
    Array.isArray(rawSchedule) && rawSchedule.length > 0
      ? rawSchedule
          .map((row) => ({
            day: row?.day?.trim() ?? '',
            title: row?.title?.trim() ?? '',
            imagePrimary: row?.imagePrimary?.trim() || null,
            imageSecondary: row?.imageSecondary?.trim() || null,
          }))
          .filter((row) => row.day && row.title)
      : [...DEFAULTS.raids.schedule]
  const raidsHeadlineTitle =
    content?.raids?.headlineTitle?.trim() || DEFAULTS.raids.headlineTitle
  const raidsHeadlineAccent =
    content?.raids?.headlineAccent?.trim() || DEFAULTS.raids.headlineAccent
  const raidsBlurb = content?.raids?.blurb?.trim() || DEFAULTS.raids.blurb
  const raidsRotationLabel =
    content?.raids?.rotationLabel?.trim() || DEFAULTS.raids.rotationLabel
  const raidsCtaLabel =
    content?.raids?.ctaLabel?.trim() || DEFAULTS.raids.ctaLabel
  const raidsDiscordUrl =
    content?.raids?.discordUrl?.trim() || DEFAULTS.raids.discordUrl

  return (
    <div>
      {/* Page chrome — at <lg renders inline, from lg+ sticks at MENU's
          vertical center. Trail is 2-segment with RGA brand root + Division 2
          leaf; D2_ROOT can't be used as the parent here because /division-2 IS
          this page (would self-link). */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-32 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[RGA_ROOT, { label: 'Division 2' }]}
          fields={[
            { label: 'LOCAL', value: `${today} UTC` },
            { label: 'TOOLS', value: state.ribbon.toolsLabel },
            {
              label: 'LAST SYNC',
              value: state.ribbon.lastSyncLabel ?? '—',
            },
          ]}
          pill={
            state.ribbon.pill === 'OPERATIONAL'
              ? { text: 'OPERATIONAL', mode: 'info' }
              : { text: state.ribbon.pill, mode: 'error' }
          }
        />
      </div>

      {/* Hero section — lives OUTSIDE Shell so the DivisionLogo can escape
          the max-width container with its negative-right offset. Matches the
          scanner-family pattern used by BriefingsPage (WashingtonMap) and
          StaffManifestHeader (StaffRadar): an absolutely-positioned
          `.rga-scanner-hover-zone` sibling drives a CSS `:has()`-triggered
          translate on both the decoration and the headline column. Top
          clearance is provided by the sticky ribbon above. */}
      <section
        className="relative overflow-hidden px-4 pt-7 pb-10 sm:px-8 sm:pt-9 sm:pb-12 lg:px-16 lg:pt-10 lg:pb-14 [--scanner-shove:140px] xl:[--scanner-shove:180px] 2xl:[--scanner-shove:220px]"
        aria-label="Command Console hero"
      >
        <div
          aria-hidden
          className="rga-scanner-hover-zone pointer-events-auto absolute top-8 -right-[220px] hidden aspect-square w-[440px] rounded-full lg:block xl:top-10 xl:-right-[280px] xl:w-[560px] 2xl:top-12 2xl:-right-[340px] 2xl:w-[680px]"
        />

        <DivisionLogo
          className="absolute top-8 -right-[220px] transition-transform duration-500 ease-out will-change-transform xl:top-10 xl:-right-[280px] 2xl:top-12 2xl:-right-[340px] motion-safe:[section:has(.rga-scanner-hover-zone:hover)_&]:translate-x-[calc(-1*var(--scanner-shove))]"
        />

        <div className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-7 sm:gap-9">
          <div className="flex min-w-0 flex-col gap-7 transition-transform duration-500 ease-out motion-safe:[section:has(.rga-scanner-hover-zone:hover)_&]:translate-x-[calc(-1*var(--scanner-shove))]">
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
        </div>
      </section>

      <Shell>
        {/* SEC_01 — live intel feed */}
        {contentPeek && contentPeek.length > 0 && (
          <IntelFeedPanel articles={contentPeek} now={now} />
        )}

        {/* SEC_02 — today's escalation: targeted drops + vendor caches */}
        {escalationPeek && escalationPeek.missions.length > 0 && (
          <LootStripPanel
            missions={escalationPeek.missions}
            items={escalationPeek.items}
            caches={escalationPeek.caches}
            targetDay={escalationPeek.targetDay}
          />
        )}

        {/* SEC_03 — latest weekly briefing + (boosters) 3 most-recent dailies
            or (non-boosters) the BoosterPerksWidget pitching the daily perk. */}
        {briefingPeek && (
          <BriefingPanel
            briefing={briefingPeek}
            dailies={state.peeks.dailies}
            hasAccess={hasAccess}
            perks={perks}
          />
        )}

        {/* SEC_04 — weekly raids (Discord-routed) */}
        <RaidsPanel
          raids={state.peeks.raids}
          headlineTitle={raidsHeadlineTitle}
          headlineAccent={raidsHeadlineAccent}
          blurb={raidsBlurb}
          rotationLabel={raidsRotationLabel}
          schedule={schedule}
          discordUrl={raidsDiscordUrl}
          ctaLabel={raidsCtaLabel}
        />
      </Shell>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pb-20 sm:gap-14 sm:px-8 sm:pb-28 lg:px-16 lg:pb-36">
      {children}
    </div>
  )
}
