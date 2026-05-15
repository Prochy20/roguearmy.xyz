'use client'

import Image from 'next/image'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { leaderboardAvatarSrc } from '../avatar'
import { GlitchName } from './GlitchName'
import { HudReticle } from './HudReticle'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

export type PointCardState =
  | {
      kind: 'standard'
      point: LeaderboardEntry
      gap: number
      designatedAgo: string // pre-formatted, e.g. "4D 12H"
      pointLevelLabel?: string | null
      suggestions: LeaderboardEntry[] // up to 3 close suggestions
      rosterCountAbove: number
    }
  | {
      kind: 'suggest'
      suggested: LeaderboardEntry
      gap: number
      suggestedLevelLabel?: string | null
      rosterCountAbove: number
    }
  | {
      kind: 'relieved'
      relievedOp: LeaderboardEntry
      rankDelta: number // positive: you climbed N ranks past them
      relievedAgo: string // "2H AGO"
      callerXp: number // used to compute gap to each backup suggestion
      suggestions: LeaderboardEntry[]
      rosterCountAbove: number
    }
  | {
      kind: 'top'
      rearGuard?: LeaderboardEntry | null
      rearGap?: number | null
      rearGuardLevelLabel?: string | null
    }
  | { kind: 'unranked' }

interface PointCardProps {
  state: PointCardState
  /** Optional override callbacks — wired by the page layer. */
  onDesignate?: (discordId: string) => void
  onConfirmSuggested?: () => void
  onDismissSuggested?: () => void
  onOpenRoster?: () => void
}

/**
 * The hero of the personal HUD block. Renders an asymmetric tactical
 * targeting display — large avatar on the left framed by a HUD reticle and
 * corner brackets, a right-hand data column with operative identity and
 * a GIGANTIC closing-distance readout, and a backup-targets strip below.
 *
 * Visual states (5):
 *   - standard:   normal locked-on POINT
 *   - suggest:    first-visit auto-suggestion, requires confirm
 *   - relieved:   overtake celebration (relieved op dimmed, headline swap)
 *   - top:        viewer is rank 1 — mirrored, shows rear-guard preview
 *   - unranked:   viewer has no XP yet — onboarding card
 */
export function PointCard({
  state,
  onDesignate,
  onConfirmSuggested,
  onDismissSuggested,
  onOpenRoster,
}: PointCardProps) {
  switch (state.kind) {
    case 'standard':
      return (
        <StandardCard
          point={state.point}
          gap={state.gap}
          designatedAgo={state.designatedAgo}
          levelLabel={state.pointLevelLabel ?? null}
          suggestions={state.suggestions}
          rosterCountAbove={state.rosterCountAbove}
          onDesignate={onDesignate}
          onOpenRoster={onOpenRoster}
        />
      )
    case 'suggest':
      return (
        <SuggestCard
          suggested={state.suggested}
          gap={state.gap}
          levelLabel={state.suggestedLevelLabel ?? null}
          rosterCountAbove={state.rosterCountAbove}
          onConfirm={onConfirmSuggested}
          onDismiss={onDismissSuggested}
          onOpenRoster={onOpenRoster}
        />
      )
    case 'relieved':
      return (
        <RelievedCard
          relievedOp={state.relievedOp}
          rankDelta={state.rankDelta}
          relievedAgo={state.relievedAgo}
          callerXp={state.callerXp}
          suggestions={state.suggestions}
          rosterCountAbove={state.rosterCountAbove}
          onDesignate={onDesignate}
          onOpenRoster={onOpenRoster}
        />
      )
    case 'top':
      return (
        <TopCard
          rearGuard={state.rearGuard ?? null}
          rearGap={state.rearGap ?? null}
          rearLevelLabel={state.rearGuardLevelLabel ?? null}
        />
      )
    case 'unranked':
      return <UnrankedCard />
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Shared sub-elements                                                       */
/* ──────────────────────────────────────────────────────────────────────── */

interface AvatarFrameProps {
  entry: LeaderboardEntry
  state: 'locked' | 'relieved' | 'scanning'
  color: 'green' | 'cyan' | 'magenta'
}

function AvatarFrame({ entry, state, color }: AvatarFrameProps) {
  const tone =
    color === 'green'
      ? { border: 'border-rga-green/50', shadow: 'shadow-[0_0_32px_rgba(0,255,65,0.22)]' }
      : color === 'cyan'
        ? { border: 'border-rga-cyan/50', shadow: 'shadow-[0_0_32px_rgba(0,255,255,0.22)]' }
        : { border: 'border-rga-magenta/50', shadow: 'shadow-[0_0_32px_rgba(255,0,255,0.22)]' }

  return (
    <div className="group/avatar relative">
      <CyberCorners color={color} size="lg" glow>
        <div
          className={
            'relative aspect-square w-full overflow-hidden border bg-[rgba(0,0,0,0.7)] ' +
            'transition-shadow duration-300 ' +
            tone.border +
            ' group-hover/avatar:' +
            tone.shadow
          }
        >
          {/* The avatar image itself */}
          <Image
            src={leaderboardAvatarSrc(entry)}
            alt={entry.displayName}
            width={512}
            height={512}
            className={
              'h-full w-full object-cover transition duration-500 ' +
              (state === 'relieved' ? 'grayscale opacity-60' : '')
            }
            unoptimized
          />

          {/* Subtle radial vignette to push the eye to the reticle center */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                state === 'relieved'
                  ? 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'
                  : color === 'green'
                    ? 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,255,65,0.08) 0%, transparent 55%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)'
                    : color === 'cyan'
                      ? 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)'
                      : 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,0,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          {/* HUD reticle overlay */}
          <HudReticle state={state} />

          {/* Bottom-left telemetry chip */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.78)] px-2 py-0.5 font-mono text-[8px] tracking-[0.3em] uppercase text-text-secondary backdrop-blur-sm">
            <span
              aria-hidden
              className={
                'inline-block h-1 w-1 ' +
                (state === 'relieved'
                  ? 'bg-text-muted'
                  : state === 'scanning'
                    ? 'bg-rga-cyan animate-pulse'
                    : 'bg-rga-green animate-pulse')
              }
            />
            <span>
              {state === 'relieved'
                ? 'SIG · LOST'
                : state === 'scanning'
                  ? 'SCAN · ACQUIRING'
                  : 'SIG · LOCKED'}
            </span>
          </div>

          {/* Top-right rank chip */}
          <div className="absolute top-2 right-2 border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.78)] px-2 py-0.5 font-mono text-[8px] tracking-[0.3em] uppercase text-text-secondary backdrop-blur-sm">
            RNK · {String(entry.rank).padStart(3, '0')}
          </div>
        </div>
      </CyberCorners>
    </div>
  )
}

interface BackupTargetsProps {
  suggestions: LeaderboardEntry[]
  /** XP gap from caller to each suggestion — must match suggestions[] order. */
  gaps: number[]
  rosterCountAbove: number
  onDesignate?: (discordId: string) => void
  onOpenRoster?: () => void
}

function BackupTargets({
  suggestions,
  gaps,
  rosterCountAbove,
  onDesignate,
  onOpenRoster,
}: BackupTargetsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
        <span className="inline-block h-px w-6 bg-text-muted/50" aria-hidden />
        <span>BACKUP TARGETS</span>
        <span className="inline-block h-px flex-1 bg-text-muted/30" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {suggestions.map((s, i) => (
          <button
            key={s.discordId}
            type="button"
            onClick={() => onDesignate?.(s.discordId)}
            className="group/tgt relative flex items-center gap-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.5)] px-3 py-2.5 text-left transition-all hover:border-rga-green/50 hover:bg-[rgba(0,255,65,0.04)] hover:pl-4"
          >
            {/* left edge ticker */}
            <span
              aria-hidden
              className="absolute inset-y-2 left-0 w-px bg-rga-green/0 transition-all group-hover/tgt:bg-rga-green group-hover/tgt:shadow-[0_0_8px_#00FF41]"
            />

            {/* tiny avatar */}
            <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[rgba(255,255,255,0.12)]">
              <Image
                src={leaderboardAvatarSrc(s)}
                alt={s.displayName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-text-muted">
                <span className="text-rga-green/70">#{String(s.rank).padStart(2, '0')}</span>
                <span>LV {String(s.level).padStart(2, '0')}</span>
              </div>
              <div className="truncate font-display text-sm uppercase tracking-[0.04em] text-text-primary">
                {s.displayName}
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5 font-mono">
              <span className="text-[8px] tracking-[0.3em] uppercase text-text-muted">DST</span>
              <span className="tabular-nums text-sm text-rga-green transition-all group-hover/tgt:[text-shadow:0_0_10px_rgba(0,255,65,0.55)]">
                {gaps[i].toLocaleString()}
              </span>
            </div>

            <span
              aria-hidden
              className="ml-1 font-mono text-rga-green/40 transition-all group-hover/tgt:translate-x-1 group-hover/tgt:text-rga-green"
            >
              ◢
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenRoster}
        className="group/rost mt-1 flex items-center justify-between border border-dashed border-[rgba(255,255,255,0.08)] bg-transparent px-3 py-2.5 text-left transition-all hover:border-rga-cyan/40 hover:bg-[rgba(0,255,255,0.03)]"
      >
        <span className="flex items-center gap-3 font-mono text-[10px] tracking-[0.35em] uppercase text-text-secondary transition-colors group-hover/rost:text-rga-cyan">
          <span aria-hidden className="text-rga-cyan/60 group-hover/rost:text-rga-cyan">▾</span>
          <span>PICK FROM ROSTER</span>
          <span className="text-text-muted">·</span>
          <span className="tabular-nums">{rosterCountAbove} OPS ABOVE</span>
        </span>
        <span
          aria-hidden
          className="font-mono text-text-muted transition-all group-hover/rost:translate-x-1 group-hover/rost:text-rga-cyan"
        >
          →
        </span>
      </button>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* STATE: standard                                                           */
/* ──────────────────────────────────────────────────────────────────────── */

interface StandardCardProps {
  point: LeaderboardEntry
  gap: number
  designatedAgo: string
  levelLabel: string | null
  suggestions: LeaderboardEntry[]
  rosterCountAbove: number
  onDesignate?: (discordId: string) => void
  onOpenRoster?: () => void
}

function StandardCard({
  point,
  gap,
  designatedAgo,
  levelLabel,
  suggestions,
  rosterCountAbove,
  onDesignate,
  onOpenRoster,
}: StandardCardProps) {
  return (
    <article className="group/point relative border border-rga-green/15 bg-[rgba(0,0,0,0.55)] p-5 transition-all duration-300 hover:border-rga-green/35 hover:bg-[rgba(0,0,0,0.6)] hover:shadow-[0_0_56px_rgba(0,255,65,0.12)] sm:p-7 lg:p-8">
      {/* Top header row — eyebrow + designated-ago */}
      <div className="mb-5 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.4em] uppercase">
        <div className="flex items-center gap-2 text-rga-green/80">
          <span aria-hidden className="inline-block h-1 w-3 bg-rga-green shadow-[0_0_6px_#00FF41]" />
          <span>POINT</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">LOCK {designatedAgo}</span>
        </div>
        <div className="hidden font-mono text-[9px] tracking-[0.35em] text-text-muted sm:block">
          PACING · ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-10 xl:grid-cols-[300px_1fr]">
        {/* LEFT: avatar with HUD overlay */}
        <div className="mx-auto w-full max-w-[300px] lg:mx-0">
          <AvatarFrame entry={point} state="locked" color="green" />
        </div>

        {/* RIGHT: data column */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Operative identity */}
          <div className="flex flex-col gap-3">
            <h3
              className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-primary"
              style={{ fontSize: 'clamp(38px, 5vw, 72px)' }}
            >
              <GlitchName name={point.displayName} />
            </h3>

            {/* Stat row — coord-style chevron-separated */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.3em] uppercase">
              <Stat label="RNK" value={`#${String(point.rank).padStart(3, '0')}`} tone="green" />
              <Sep />
              <Stat label="LV" value={String(point.level).padStart(2, '0')} tone="cyan" />
              {levelLabel && (
                <>
                  <Sep />
                  <Stat label="BAND" value={levelLabel} tone="magenta" />
                </>
              )}
            </div>
          </div>

          {/* Divider — segmented HUD tick rail */}
          <div className="flex h-px items-center gap-1" aria-hidden>
            <span className="h-px w-8 bg-rga-green/60" />
            <span className="h-px w-2 bg-rga-green/30" />
            <span className="h-px flex-1 bg-rga-green/15" />
            <span className="h-px w-2 bg-rga-green/30" />
          </div>

          {/* Closing distance — the headline */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.4em] uppercase">
              <span className="text-rga-green/80">// CLOSING DISTANCE</span>
              <span className="text-text-muted">VECTOR · CONVERGING</span>
            </div>

            <div className="flex items-baseline gap-4 sm:gap-6">
              <div
                className="font-display tabular-nums leading-[0.85] text-rga-green [text-shadow:0_0_28px_rgba(0,255,65,0.55),0_0_56px_rgba(0,255,65,0.25)]"
                style={{ fontSize: pickGapFontSize(gap.toLocaleString().length) }}
              >
                {gap.toLocaleString()}
              </div>
              <div className="flex flex-col gap-1 pb-3 sm:pb-4">
                <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-rga-green/70">
                  XP TO MATCH
                </span>
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-text-muted">
                  PACING #{String(point.rank).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup targets + roster link */}
      {(suggestions.length > 0 || rosterCountAbove > 0) && (
        <div className="mt-7 sm:mt-8">
          <BackupTargets
            suggestions={suggestions}
            gaps={suggestions.map((s) => Math.max(0, s.xp - (point.xp - gap)))}
            rosterCountAbove={rosterCountAbove}
            onDesignate={onDesignate}
            onOpenRoster={onOpenRoster}
          />
        </div>
      )}
    </article>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'green' | 'cyan' | 'magenta' }) {
  const valueClass =
    tone === 'green'
      ? 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.45)]'
      : tone === 'cyan'
        ? 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.45)]'
        : 'text-rga-magenta [text-shadow:0_0_10px_rgba(255,0,255,0.45)]'
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-text-muted">{label}</span>
      <span className={'font-display text-base tabular-nums tracking-normal sm:text-lg ' + valueClass}>
        {value}
      </span>
    </span>
  )
}

function Sep() {
  return (
    <span aria-hidden className="text-text-muted/40">
      ◢
    </span>
  )
}

/**
 * Pick a clamp() font-size for the closing-distance headline based on the
 * formatted gap's character count (digits + thousand separators).
 *
 * Display-font digits are ~0.65× their font size in width. A static peak
 * sized for "9 999" (5 chars) overflows the column once the gap reaches
 * "999 999" (7) or "9 999 999" (9) chars. Stepping the cap down by digit
 * bracket preserves drama for typical values and keeps extreme values legible.
 */
function pickGapFontSize(charLen: number): string {
  if (charLen <= 6) return 'clamp(72px, 11vw, 168px)' // up to "99 999"
  if (charLen <= 7) return 'clamp(64px, 9.5vw, 144px)' // up to "999 999"
  if (charLen <= 9) return 'clamp(56px, 8vw, 120px)' // up to "9 999 999"
  return 'clamp(48px, 6.5vw, 96px)' // 10M+ XP gaps
}

function BriefSection({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.4em] uppercase text-text-muted">
        <span className="text-rga-cyan/70" aria-hidden>{`>`}</span>
        <span>{eyebrow}</span>
      </div>
      <p className="font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
        {children}
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* STATE: suggest (first-visit auto-suggestion)                              */
/* ──────────────────────────────────────────────────────────────────────── */

interface SuggestCardProps {
  suggested: LeaderboardEntry
  gap: number
  levelLabel: string | null
  rosterCountAbove: number
  onConfirm?: () => void
  onDismiss?: () => void
  onOpenRoster?: () => void
}

function SuggestCard({
  suggested,
  gap,
  levelLabel,
  rosterCountAbove,
  onConfirm,
  onDismiss,
  onOpenRoster,
}: SuggestCardProps) {
  return (
    <article className="group/sug relative border border-rga-cyan/20 bg-[rgba(0,0,0,0.55)] p-5 transition-all duration-300 hover:border-rga-cyan/40 hover:shadow-[0_0_48px_rgba(0,255,255,0.12)] sm:p-7 lg:p-8">
      {/* Eyebrow */}
      <div className="mb-5 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.4em] uppercase">
        <div className="flex items-center gap-2 text-rga-cyan/80">
          <span aria-hidden className="inline-block h-1 w-3 bg-rga-cyan shadow-[0_0_6px_#00FFFF] animate-pulse" />
          <span>SUGGESTED POINT</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">AWAITING CONFIRM</span>
        </div>
        <div className="hidden font-mono text-[9px] tracking-[0.35em] text-text-muted sm:block">
          SCAN · ACQUIRING
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-10 xl:grid-cols-[300px_1fr]">
        {/* Avatar — scanning state (cyan reticle, no lock yet) */}
        <div className="mx-auto w-full max-w-[300px] lg:mx-0">
          <AvatarFrame entry={suggested} state="scanning" color="cyan" />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
              CLOSEST OPERATIVE ABOVE YOU
            </div>
            <h3
              className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-primary"
              style={{ fontSize: 'clamp(38px, 5vw, 72px)' }}
            >
              <GlitchName name={suggested.displayName} />
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.3em] uppercase">
              <Stat label="RNK" value={`#${String(suggested.rank).padStart(3, '0')}`} tone="cyan" />
              <Sep />
              <Stat label="LV" value={String(suggested.level).padStart(2, '0')} tone="cyan" />
              {levelLabel && (
                <>
                  <Sep />
                  <Stat label="BAND" value={levelLabel} tone="magenta" />
                </>
              )}
              <Sep />
              <Stat label="GAP" value={`${gap.toLocaleString()} XP`} tone="green" />
            </div>
          </div>

          <div className="flex h-px items-center gap-1" aria-hidden>
            <span className="h-px w-8 bg-rga-cyan/50" />
            <span className="h-px flex-1 bg-rga-cyan/15" />
          </div>

          {/* Onboarding brief — first-visit context */}
          <div className="flex flex-col gap-3 border-l-2 border-rga-cyan/40 bg-[rgba(0,255,255,0.025)] py-1 pl-4">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan/80">
              // OPERATIONS BRIEF · FIRST DEPLOY
            </div>

            <BriefSection eyebrow="WHAT IS A POINT">
              The operative directly above you in the formation. Your closest target — pace them, catch them, climb the board together.
            </BriefSection>

            <BriefSection eyebrow="THE LOOP">
              Earn XP in Discord. Distance closes across visits. When you overtake, your POINT is{' '}
              <span className="text-rga-magenta">RELIEVED</span> — you step up, the next one auto-suggests. Cooperative, not adversarial.
            </BriefSection>

            <BriefSection eyebrow="DESIGNATE?">
              Locked across visits. Revocable any time. Stored on this device only — no server, no sharing.
            </BriefSection>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onConfirm}
              className="group/lock relative flex items-center justify-center gap-3 border border-rga-green bg-[rgba(0,255,65,0.08)] px-5 py-3 font-mono text-[11px] tracking-[0.4em] uppercase text-rga-green transition-all hover:bg-[rgba(0,255,65,0.15)] hover:[text-shadow:0_0_12px_rgba(0,255,65,0.6)] hover:shadow-[0_0_24px_rgba(0,255,65,0.3),inset_0_0_24px_rgba(0,255,65,0.08)]"
            >
              <span aria-hidden className="font-mono">[</span>
              <span>LOCK IN</span>
              <span aria-hidden className="font-mono transition-transform group-hover/lock:translate-x-0.5">◢</span>
              <span aria-hidden className="font-mono">]</span>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="border border-[rgba(255,255,255,0.12)] bg-transparent px-5 py-3 font-mono text-[11px] tracking-[0.4em] uppercase text-text-secondary transition-all hover:border-text-secondary hover:text-text-primary"
            >
              PICK SOMEONE ELSE
            </button>
            <button
              type="button"
              onClick={onOpenRoster}
              className="px-3 py-3 font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted underline-offset-4 transition-colors hover:text-rga-cyan hover:underline"
            >
              ▾ FULL ROSTER ({rosterCountAbove})
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* STATE: relieved (overtake celebration)                                    */
/* ──────────────────────────────────────────────────────────────────────── */

interface RelievedCardProps {
  relievedOp: LeaderboardEntry
  rankDelta: number
  relievedAgo: string
  callerXp: number
  suggestions: LeaderboardEntry[]
  rosterCountAbove: number
  onDesignate?: (discordId: string) => void
  onOpenRoster?: () => void
}

function RelievedCard({
  relievedOp,
  rankDelta,
  relievedAgo,
  callerXp,
  suggestions,
  rosterCountAbove,
  onDesignate,
  onOpenRoster,
}: RelievedCardProps) {
  return (
    <article className="group/rel relative border border-rga-magenta/25 bg-[rgba(20,0,20,0.55)] p-5 sm:p-7 lg:p-8">
      {/* Subtle neon flicker animation overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-neon-flicker opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,0,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        {/* Eyebrow with chevron pattern */}
        <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase">
          <span className="text-rga-magenta">◢</span>
          <span className="text-rga-magenta [text-shadow:0_0_8px_rgba(255,0,255,0.5)]">
            POINT RELIEVED
          </span>
          <span className="text-rga-magenta">◢</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">{relievedAgo}</span>
        </div>

        {/* Big headline */}
        <h3
          className="mb-5 font-display uppercase leading-[0.9] tracking-[0.005em] text-text-primary"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          YOU TOOK POINT
          <span className="text-rga-magenta [text-shadow:0_0_24px_rgba(255,0,255,0.5)]"> ◢</span>
        </h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr] lg:gap-10">
          {/* Dimmed/desaturated avatar of the relieved op */}
          <div className="mx-auto w-full max-w-[260px] lg:mx-0">
            <AvatarFrame entry={relievedOp} state="relieved" color="magenta" />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
                SIGNAL LOST FROM
              </div>
              <h4
                className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-secondary"
                style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}
              >
                {relievedOp.displayName}
              </h4>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted">
                LAST KNOWN · #{String(relievedOp.rank).padStart(3, '0')} · LV {String(relievedOp.level).padStart(2, '0')}
              </div>
            </div>

            <div className="flex h-px items-center gap-1" aria-hidden>
              <span className="h-px w-8 bg-rga-magenta/40" />
              <span className="h-px flex-1 bg-rga-magenta/15" />
            </div>

            {/* Rank delta — the headline number */}
            <div className="flex items-baseline gap-4 sm:gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-green/80">
                  RANK DELTA
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-rga-green [text-shadow:0_0_24px_rgba(0,255,65,0.5)]" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
                    +{rankDelta}
                  </span>
                  <span className="font-mono text-sm uppercase tracking-[0.3em] text-rga-green/70">
                    ranks
                  </span>
                </div>
              </div>
            </div>

            <p className="max-w-prose font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
              <span className="text-rga-magenta">{`>`}</span> THE FORMATION HAS REARRANGED. YOU STEPPED UP SO{' '}
              <span className="text-text-primary">{relievedOp.displayName}</span> COULD FALL BACK. DESIGNATE THE NEXT POINT TO KEEP MOVING.
            </p>
          </div>
        </div>

        {/* Replace-point CTA strip */}
        {(suggestions.length > 0 || rosterCountAbove > 0) && (
          <div className="mt-7 sm:mt-8">
            <BackupTargets
              suggestions={suggestions}
              gaps={suggestions.map((s) => Math.max(0, s.xp - callerXp))}
              rosterCountAbove={rosterCountAbove}
              onDesignate={onDesignate}
              onOpenRoster={onOpenRoster}
            />
          </div>
        )}
      </div>
    </article>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* STATE: top (viewer is rank 1)                                             */
/* ──────────────────────────────────────────────────────────────────────── */

interface TopCardProps {
  rearGuard: LeaderboardEntry | null
  rearGap: number | null
  rearLevelLabel: string | null
}

function TopCard({ rearGuard, rearGap, rearLevelLabel }: TopCardProps) {
  return (
    <article className="relative border border-rga-green/35 bg-[rgba(0,40,8,0.25)] p-5 shadow-[inset_0_0_64px_rgba(0,255,65,0.07)] sm:p-7 lg:p-8">
      {/* Eyebrow */}
      <div className="mb-5 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.4em] uppercase">
        <div className="flex items-center gap-2 text-rga-green">
          <span aria-hidden className="inline-block h-1 w-3 bg-rga-green animate-pulse shadow-[0_0_8px_#00FF41]" />
          <span>YOU ARE ON POINT</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.35em] text-text-muted">FORMATION LEAD</div>
      </div>

      <h3
        className="mb-3 font-display uppercase leading-[0.9] tracking-[0.005em] text-rga-green [text-shadow:0_0_32px_rgba(0,255,65,0.55),0_0_64px_rgba(0,255,65,0.25)]"
        style={{ fontSize: 'clamp(40px, 6.5vw, 96px)' }}
      >
        KEEP THE FORMATION MOVING
      </h3>

      <p className="mb-7 max-w-prose font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
        <span className="text-rga-green">{`>`}</span> YOU HOLD THE LEAD POSITION. THE BOARD IS BEHIND YOU. THE FORMATION MOVES AT YOUR PACE.
      </p>

      {rearGuard && typeof rearGap === 'number' && (
        <div className="border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.45)] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan/80">
            <span aria-hidden>◣</span>
            <span>REAR GUARD</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">CLOSEST PURSUIT</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-rga-cyan/40 shadow-[0_0_16px_rgba(0,255,255,0.18)] sm:h-16 sm:w-16">
              <Image
                src={leaderboardAvatarSrc(rearGuard)}
                alt={rearGuard.displayName}
                width={128}
                height={128}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted">
                #{String(rearGuard.rank).padStart(2, '0')} · LV {String(rearGuard.level).padStart(2, '0')}
                {rearLevelLabel ? ` · ${rearLevelLabel}` : ''}
              </div>
              <div className="truncate font-display text-xl uppercase tracking-[0.005em] text-text-primary sm:text-2xl">
                {rearGuard.displayName}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end font-mono">
              <span className="text-[10px] tracking-[0.35em] uppercase text-rga-cyan/80">BEHIND</span>
              <span className="font-display tabular-nums text-2xl text-rga-cyan [text-shadow:0_0_14px_rgba(0,255,255,0.5)] sm:text-3xl">
                {rearGap.toLocaleString()}
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-text-muted">XP</span>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* STATE: unranked (no XP yet)                                               */
/* ──────────────────────────────────────────────────────────────────────── */

function UnrankedCard() {
  return (
    <article className="relative border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.35)] p-6 sm:p-9 lg:p-12">
      <div className="flex flex-col items-start gap-5">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
          <span aria-hidden className="inline-block h-1 w-1 bg-text-muted/60" />
          <span>STANDBY</span>
          <span>·</span>
          <span>NO TELEMETRY</span>
        </div>

        <h3
          className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-secondary"
          style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}
        >
          NO FORMATION DATA<br />
          <span className="text-text-muted/70">YET</span>
        </h3>

        <p className="max-w-prose font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
          <span className="text-rga-green">{`>`}</span> DROP INTO DISCORD TO EARN YOUR FIRST RANK.
          YOUR POINT WILL BE DESIGNATED ON FIRST DEPLOY. THE FORMATION IS WAITING.
        </p>

        <a
          href="https://discord.gg/rga"
          className="group/cta mt-1 flex items-center gap-3 border border-rga-green/40 bg-[rgba(0,255,65,0.04)] px-5 py-3 font-mono text-[11px] tracking-[0.4em] uppercase text-rga-green transition-all hover:border-rga-green hover:bg-[rgba(0,255,65,0.12)] hover:shadow-[0_0_24px_rgba(0,255,65,0.25)]"
        >
          <span aria-hidden>[</span>
          <span>ENTER DISCORD</span>
          <span aria-hidden className="transition-transform group-hover/cta:translate-x-1">→</span>
          <span aria-hidden>]</span>
        </a>
      </div>
    </article>
  )
}
