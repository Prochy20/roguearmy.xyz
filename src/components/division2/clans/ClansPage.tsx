import Link from 'next/link'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { D2_ROOT } from '@/components/ui/trail-roots'
import { CyberButton } from '@/components/ui/CyberButton'
import { GlowButton } from '@/components/ui/GlowButton'
import { SectionHeader } from '@/components/community/SectionHeader'
import { ClanCard } from './ClanCard'
import type { ClanAccent } from './accent'
import type { ClanLeader } from './ClanLeaderSlot'
import type {
  CommandStepBlock,
  InstructionStepBlock,
  CtaStepBlock,
  OutcomeStepBlock,
} from '@/payload-types'

export type HowToStep =
  | CommandStepBlock
  | InstructionStepBlock
  | CtaStepBlock
  | OutcomeStepBlock

export interface ClanCardData {
  id: string
  name: string
  tag: string
  bannerUrl: string
  bannerAlt: string
  accent: ClanAccent
  leader: ClanLeader | null
}

export interface HowToContent {
  sectionKicker: string
  sectionTitle: string
  steps: HowToStep[]
}

export interface CalloutContent {
  kicker: string
  headline: string
  body: string
  bullets: string[]
  signature: string
}

export interface ClosingCtaContent {
  headline: string
  ctaLabel: string
  ctaUrl: string
  /** When true, opens the CTA link in a new tab with safe rel attrs. */
  openInNewTab: boolean
  signature: string
}

export interface ClansPageContent {
  heroTitle: string
  heroAccent: string
  intro: string
  rosterSectionLabel: string
  emptyRoster: string
  howTo: HowToContent
  callout: CalloutContent
  closingCta: ClosingCtaContent
}

interface ClansPageProps {
  /** Signed-in members see the clan-leader slot on each card; anonymous don't. */
  isAuthenticated: boolean
  clans: ClanCardData[]
  content: ClansPageContent
}

export function ClansPage({ isAuthenticated, clans, content }: ClansPageProps) {
  const countLabel = String(clans.length).padStart(2, '0')
  return (
    <>
      {/* Page chrome — at <lg renders inline (no stick) to save vertical space
          on phones/tablets. From lg+ sticks at MENU's vertical center and
          stretches almost to MENU's left bracket. Trail is 2-segment
          (Division 2 › Clans) — clans is a section root, so the leaf IS the
          page identity, no sub-view distinguisher needed. */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-32 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[D2_ROOT, { label: 'Clans' }]}
          fields={[
            { label: 'STANDARDS', value: countLabel },
            { label: 'ACCESS', value: 'PUBLIC' },
          ]}
          pill={{ text: 'RECRUITING', mode: 'info' }}
        />
      </div>

      <Shell>
        <Hero content={content} />

        <RosterGrid
          label={content.rosterSectionLabel}
          clans={clans}
          showLeader={isAuthenticated}
          empty={content.emptyRoster}
        />

        <HowToSection howTo={content.howTo} />

        <Doctrine callout={content.callout} />

        <ClosingCta cta={content.closingCta} />
      </Shell>
    </>
  )
}

/* ───────────────────────── Shell ─────────────────────────
   Same shell dims as /division-2 (CommandConsolePage) and /division-2/escalation
   so a member crossing from those pages into /clans gets identical chrome:
   max-w-[1480px], responsive padding, and section gap. Top padding is small
   (pt-7…) because the sticky ribbon above already clears the fixed Header. */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 pt-7 pb-20 sm:gap-14 sm:px-8 sm:pt-9 sm:pb-28 lg:px-16 lg:pt-10 lg:pb-36">
      {children}
    </div>
  )
}

/* ───────────────────────── Hero ─────────────────────────
   Two-line HeroGlitch headline + intro — RGA brand green to read as
   recruitment-facing brand rather than D2 tool-section. The page-level
   StatRibbon trail (Division 2 › Clans) lives in the sticky chrome above; the
   hero's old location-carrying kicker is dropped (was a literal duplicate of
   the trail). `content.heroKicker` is no longer rendered — the field stays in
   the Payload schema for migration, scheduled for phase 2 cleanup. */

function Hero({ content }: { content: ClansPageContent }) {
  return (
    <header className="flex flex-col gap-7 sm:gap-9">
      <div className="flex min-w-0 flex-col gap-7">
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
            <span className="text-text-primary">{content.heroTitle}</span>
          </HeroGlitch>
          <HeroGlitch
            className="block"
            minInterval={5}
            maxInterval={12}
            intensity={7}
            dataCorruption={false}
            colors={['#00ff41', '#88ff88']}
          >
            <span
              className="text-rga-green"
              style={{
                textShadow: '0 0 36px rgba(0,255,65,0.45), 0 0 80px rgba(0,255,65,0.18)',
              }}
            >
              {content.heroAccent}
            </span>
          </HeroGlitch>
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {content.intro}
        </p>
      </div>
    </header>
  )
}

/* ───────────────────────── Roster grid (SEC_01) ───────────────────────── */

function RosterGrid({
  label,
  clans,
  showLeader,
  empty,
}: {
  label: string
  clans: ClanCardData[]
  showLeader: boolean
  empty: string
}) {
  const count = String(clans.length).padStart(2, '0')
  return (
    <section>
      <SectionHeader
        num="01"
        eyebrow={`${count} ON FILE`}
        kicker={label}
        title="ACTIVE STANDARDS"
      />

      {clans.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] px-6 py-12 text-center">
          <p
            className="font-mono uppercase text-text-muted"
            style={{ fontSize: 12, letterSpacing: '0.2em' }}
          >
            {empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:gap-7 lg:grid-cols-3">
          {clans.map((clan, i) => (
            <ClanCard
              key={clan.id}
              name={clan.name}
              tag={clan.tag}
              bannerUrl={clan.bannerUrl}
              bannerAlt={clan.bannerAlt}
              accent={clan.accent}
              index={i + 1}
              leader={showLeader ? clan.leader : null}
              animationDelayMs={340 + i * 80}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/* ───────────────────────── How to Join (SEC_02) ─────────────────────────
   Steps come from a Payload `blocks` field — heterogeneous variants with
   distinct shapes (commandStep / instructionStep / ctaStep). We switch on
   `blockType` so TS narrows each item to its specific interface, no
   runtime "if (step.command)" guards needed. */

function HowToSection({ howTo }: { howTo: HowToContent }) {
  const stepCount = howTo.steps.length
  return (
    <section>
      <SectionHeader
        num="02"
        eyebrow={`${stepCount} STEPS · NO GATES`}
        kicker={howTo.sectionKicker}
        title={howTo.sectionTitle}
      />

      <ol className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
        {howTo.steps.map((step, i) => (
          <StepItem key={step.id ?? i} step={step} index={i} />
        ))}
      </ol>
    </section>
  )
}

function StepItem({ step, index }: { step: HowToStep; index: number }) {
  // Outcome steps get their own layout — full-row card with status pill,
  // green tint, larger title — so they read as the "you made it" finale
  // rather than another process step.
  if (step.blockType === 'outcomeStep') {
    return <OutcomeStepItem step={step} index={index} />
  }

  const n = String(index + 1).padStart(2, '0')
  return (
    <li className="border-b border-white/8 pb-8">
      <p
        className="font-mono uppercase text-text-muted"
        style={{ fontSize: 10, letterSpacing: '0.3em' }}
      >
        STEP-{n}
      </p>
      <h3
        className="mt-3 font-display text-text-primary"
        style={{ fontSize: 22, letterSpacing: '0.01em', lineHeight: 1.15 }}
      >
        {step.title}
      </h3>
      <p
        className="mt-3 max-w-md text-text-secondary"
        style={{ fontSize: 15, lineHeight: 1.55 }}
      >
        {step.body}
      </p>

      {step.blockType === 'commandStep' && <StepCommandChip command={step.command} />}
      {step.blockType === 'ctaStep' && (
        <StepCtaButton
          label={step.ctaLabel}
          url={step.ctaUrl}
          openInNewTab={step.openInNewTab ?? false}
        />
      )}
    </li>
  )
}

function OutcomeStepItem({ step, index }: { step: HowToStep & { blockType: 'outcomeStep' }; index: number }) {
  const n = String(index + 1).padStart(2, '0')
  const status = step.statusLabel?.trim() || 'ENLISTED'

  return (
    <li className="relative border border-rga-green/30 bg-rga-green/[0.04] px-6 py-7 sm:col-span-2 sm:px-8 sm:py-8">
      {/* Soft top-edge highlight to give the card slight depth — sells the
          "this is the win state" feeling without resorting to a heavy glow. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-rga-green/45 to-transparent sm:inset-x-8"
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="font-mono uppercase text-text-muted"
          style={{ fontSize: 10, letterSpacing: '0.3em' }}
        >
          STEP-{n}
        </p>
        <span
          className="inline-flex items-center gap-2 font-mono uppercase text-rga-green"
          style={{ fontSize: 11, letterSpacing: '0.28em' }}
        >
          <span aria-hidden="true">⬢</span>
          {status}
        </span>
      </header>

      <h3
        className="mt-5 font-display uppercase text-text-primary"
        style={{
          fontSize: 'clamp(26px, 2.6vw, 36px)',
          letterSpacing: '0.01em',
          lineHeight: 1.05,
        }}
      >
        {step.title}
      </h3>

      <p
        className="mt-4 max-w-2xl text-text-secondary"
        style={{ fontSize: 16, lineHeight: 1.6 }}
      >
        {step.body}
      </p>
    </li>
  )
}

function StepCommandChip({ command }: { command: string }) {
  return (
    <div
      className="mt-4 inline-flex items-center gap-2 border border-rga-green/35 bg-rga-green/5 px-3 py-1.5 font-mono text-rga-green"
      style={{ fontSize: 13, letterSpacing: '0.04em' }}
    >
      <span className="text-rga-green/60" aria-hidden="true">▸</span>
      <span>{command}</span>
    </div>
  )
}

function StepCtaButton({
  label,
  url,
  openInNewTab,
}: {
  label: string
  url: string
  openInNewTab: boolean
}) {
  // Empty URL hides the button — sensible when editors haven't pasted the
  // Discord channel link yet. The rest of the step still renders cleanly.
  if (!url.trim()) return null

  return (
    <div className="mt-5">
      <CyberButton
        href={url}
        external={openInNewTab}
        color="green"
        iconRight={<span aria-hidden="true">{openInNewTab ? '↗' : '→'}</span>}
        className="text-[11px]"
      >
        {label}
      </CyberButton>
    </div>
  )
}

/* ───────────────────────── Doctrine (SEC_03) ─────────────────────────
   Inspired by `community/LoreSection`: left-aligned SectionHeader over an
   asymmetric two-column grid. Left column carries the prose + signature;
   right column lists the operating principles as small numbered cards.
   Warm tone via typography + restrained green accents — no military
   theater. CMS contract unchanged. */

function Doctrine({ callout }: { callout: CalloutContent }) {
  return (
    <section>
      <SectionHeader
        num="03"
        eyebrow="DOCTRINE"
        kicker={callout.kicker}
        title={callout.headline}
      />

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Left column — prose + signature + (optional) postscript aside */}
        <div className="flex flex-col gap-7">
          <p className="text-lg leading-relaxed text-text-secondary sm:text-xl">
            {callout.body}
          </p>

          {callout.signature && (
            <div className="mt-2 flex flex-col gap-2 border-l-2 border-rga-green/40 bg-[rgba(0,255,65,0.03)] px-6 py-5">
              <p
                className="font-display uppercase leading-[1.1] text-text-primary"
                style={{ fontSize: 'clamp(18px, 2vw, 26px)' }}
              >
                {callout.signature}
              </p>
              <p
                className="font-mono uppercase text-rga-green"
                style={{ fontSize: 10, letterSpacing: '0.32em' }}
              >
                // ROGUE ARMY DOCTRINE
              </p>
            </div>
          )}
        </div>

        {/* Right column — numbered principle cards */}
        {callout.bullets.length > 0 && (
          <div className="flex flex-col gap-4">
            <p
              className="font-mono uppercase text-text-muted"
              style={{ fontSize: 11, letterSpacing: '0.3em' }}
            >
              // OPERATING PRINCIPLES
            </p>

            <ol className="flex flex-col gap-3">
              {callout.bullets.map((item, i) => (
                <li
                  key={i}
                  className="group/p flex items-start gap-5 border border-rga-green/15 bg-[rgba(0,0,0,0.35)] px-5 py-4 transition-colors duration-300 hover:border-rga-green/35 hover:bg-[rgba(0,255,65,0.04)]"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-rga-green tabular-nums"
                    style={{ fontSize: 13, letterSpacing: '0.2em', lineHeight: 1.4 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="min-w-0 font-display uppercase text-text-primary"
                    style={{ fontSize: 16, letterSpacing: '0.02em', lineHeight: 1.3 }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

/* ───────────────────────── Closing CTA (SEC_04) ───────────────────────── */

function ClosingCta({ cta }: { cta: ClosingCtaContent }) {
  return (
    <section>
      <SectionHeader
        num="04"
        eyebrow="CONTACT STAFF"
        kicker="// ENLISTMENT · DM A FRIEND"
        title={cta.headline}
        align="center"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <GlowButton asChild glowColor="green" size="lg" className="gap-3 px-10 py-7 text-base">
          {cta.openInNewTab ? (
            // Plain <a> for off-site links — <Link> would still work but has
            // nothing to prefetch, and the rel attrs here protect against
            // window.opener exploits regardless.
            <a href={cta.ctaUrl} target="_blank" rel="noopener noreferrer">
              {cta.ctaLabel}
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link href={cta.ctaUrl}>
              {cta.ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </GlowButton>

        {cta.signature && (
          <p
            className="mt-10 font-mono uppercase text-text-muted"
            style={{ fontSize: 10, letterSpacing: '0.24em' }}
          >
            {cta.signature}
          </p>
        )}
      </div>
    </section>
  )
}
