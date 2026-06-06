'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/community/SectionHeader'
import { FormationBlock } from '@/components/community/leaderboard/formation/FormationBlock'
import { FormationDossier } from '@/components/community/leaderboard/formation/FormationDossier'
import { PointCard, type PointCardState } from '@/components/community/leaderboard/formation/PointCard'
import { TierBand } from '@/components/community/leaderboard/formation/TierBand'
import { ProgressStrip } from '@/components/community/leaderboard/formation/ProgressStrip'
import { MiniPodium } from '@/components/community/leaderboard/formation/MiniPodium'
import { BootOverlay } from '@/components/community/leaderboard/formation/BootOverlay'
import { RosterModal } from '@/components/community/leaderboard/formation/RosterModal'
import {
  MOCK_TOP3,
  MOCK_POINT,
  MOCK_RELIEVED_OP,
  MOCK_REAR_GUARD,
  MOCK_SUGGESTIONS,
  MOCK_NEXT_SUGGESTIONS,
  MOCK_ROSTER,
  MOCK_ME,
} from '@/components/community/leaderboard/formation/_mock'

type Variant = 'standard' | 'suggest' | 'relieved' | 'top' | 'unranked'

const VARIANT_LABELS: Record<Variant, string> = {
  standard: 'STANDARD',
  suggest: 'FIRST-VISIT SUGGESTION',
  relieved: 'POINT RELIEVED',
  top: 'RANK #1',
  unranked: 'UNRANKED VIEWER',
}

const VARIANT_DESCS: Record<Variant, string> = {
  standard: 'Locked-on POINT, normal pacing.',
  suggest: 'Auto-suggested closest above on first visit; awaiting confirm.',
  relieved: 'Overtake celebration — relieved op dimmed, rank delta highlighted.',
  top: 'Viewer is rank #1; mirrored mechanic showing rear guard.',
  unranked: 'Viewer has no XP yet; onboarding card.',
}

export default function FormationPreviewPage() {
  const [variant, setVariant] = useState<Variant>('standard')
  const [bootOpen, setBootOpen] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [mobile, setMobile] = useState(false)

  const state = buildState(variant)

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 pt-10 pb-32 sm:px-8 sm:pt-16 sm:pb-40 lg:px-16 lg:pt-24 lg:pb-48">
        <SectionHeader
          num="00"
          eyebrow="DESIGN PREVIEW"
          kicker="// FORMATION HUD · DESIGN PROPOSAL"
          title="TARGETING LOCK"
        />

        <div className="mb-10 grid grid-cols-1 gap-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] p-5 sm:mb-14 sm:p-6 lg:grid-cols-[1fr_auto] lg:gap-8">
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-green/80">
              // POINT CARD · STATE PICKER
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(VARIANT_LABELS) as Variant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={
                    'border px-3 py-2 font-mono text-[10px] tracking-[0.35em] uppercase transition-all ' +
                    (variant === v
                      ? 'border-rga-green bg-[rgba(0,255,65,0.08)] text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
                      : 'border-[rgba(255,255,255,0.12)] bg-transparent text-text-secondary hover:border-rga-green/40 hover:text-text-primary')
                  }
                >
                  {VARIANT_LABELS[v]}
                </button>
              ))}
            </div>
            <div className="font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
              <span className="text-rga-green/70">{`>`}</span> {VARIANT_DESCS[variant]}
            </div>
            <div className="mt-1 flex flex-col gap-1 border-l-2 border-rga-cyan/40 pl-3 font-mono text-[10px] leading-relaxed tracking-wide text-text-muted">
              <span>
                <span className="text-rga-cyan/80">// DATA AUDIT</span> · all values reflect what
                Ashley actually returns
              </span>
              <span>
                · POINT / suggested / rear-guard show LV only — Ashley does not ship per-entry tier
                labels
              </span>
              <span>
                · &quot;DESIGNATED 4D 12H AGO&quot; &amp; ΔXP / ΔRANK are derived from
                client-side localStorage snapshots
              </span>
              <span>
                · BootOverlay gated by server-readable cookie (rga_formation_seen, 30d)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan/80">
              // SECONDARY SURFACES
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBootOpen(true)}
                className="border border-rga-cyan/40 bg-transparent px-3 py-2 font-mono text-[10px] tracking-[0.35em] uppercase text-rga-cyan transition-all hover:bg-[rgba(0,255,255,0.06)]"
              >
                BOOT OVERLAY
              </button>
              <button
                type="button"
                onClick={() => setRosterOpen(true)}
                className="border border-rga-cyan/40 bg-transparent px-3 py-2 font-mono text-[10px] tracking-[0.35em] uppercase text-rga-cyan transition-all hover:bg-[rgba(0,255,255,0.06)]"
              >
                ROSTER MODAL
              </button>
              <button
                type="button"
                onClick={() => setMobile((v) => !v)}
                className={
                  'border px-3 py-2 font-mono text-[10px] tracking-[0.35em] uppercase transition-all ' +
                  (mobile
                    ? 'border-rga-magenta bg-[rgba(255,0,255,0.06)] text-rga-magenta'
                    : 'border-[rgba(255,255,255,0.12)] bg-transparent text-text-secondary hover:border-rga-magenta/40')
                }
              >
                {mobile ? 'MOBILE · ON' : 'MOBILE · OFF'}
              </button>
            </div>
          </div>
        </div>

        <PreviewFrame mobile={mobile}>
          <FormationBlock
            status={variant === 'relieved' ? 'relieved' : variant === 'unranked' ? 'standby' : 'live'}
          >
            <FormationDossier />

            <PointCard
              state={state}
              onDesignate={(id) => console.log('designate', id)}
              onConfirmSuggested={() => setVariant('standard')}
              onDismissSuggested={() => console.log('dismiss suggested')}
              onOpenRoster={() => setRosterOpen(true)}
            />

            {variant !== 'unranked' && (
              <TierBand
                level={MOCK_ME.level}
                levelLabel={MOCK_ME.levelLabel}
                progress={MOCK_ME.progress}
                xpToNextLevel={MOCK_ME.xpToNextLevel}
                nextLevelLabel={MOCK_ME.nextLevelLabel}
                nextLevel={MOCK_ME.nextLevel}
              />
            )}

            {variant !== 'unranked' && (
              <ProgressStrip
                windowLabel="LAST 6 DAYS"
                xpDelta={1240}
                rankDelta={4}
                fresh
              />
            )}
          </FormationBlock>

          <div className="mt-10 sm:mt-12">
            <MiniPodium entries={MOCK_TOP3} myRank={MOCK_ME.rank} />
          </div>

          <div className="mt-10 border border-dashed border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)] p-6 font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            // EXISTING LEADERBOARD LIST RENDERS HERE — UNCHANGED
          </div>
        </PreviewFrame>

        <section className="mt-20 flex flex-col gap-12">
          <h2 className="font-display text-2xl uppercase tracking-[0.005em] text-text-primary sm:text-3xl">
            // COMPONENT GALLERY
          </h2>

          <div className="flex flex-col gap-4">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
              TIER BAND · VARIANTS
            </div>
            <TierBand
              level={1}
              levelLabel="RECRUIT"
              progress={0.12}
              xpToNextLevel={2640}
              nextLevelLabel="OPERATOR"
              nextLevel={2}
            />
            <TierBand
              level={12}
              levelLabel="VETERAN"
              progress={0.64}
              xpToNextLevel={4800}
              nextLevelLabel="ELITE"
              nextLevel={13}
            />
            <TierBand
              level={29}
              levelLabel="ARCHON"
              progress={1}
              xpToNextLevel={null}
              nextLevelLabel={null}
              nextLevel={null}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
              PROGRESS STRIP · WINDOW VARIANTS
            </div>
            <div className="flex flex-col gap-2 border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.25)] px-4 py-4">
              <ProgressStrip windowLabel="TODAY" xpDelta={120} rankDelta={0} fresh />
              <ProgressStrip windowLabel="LAST 6 DAYS" xpDelta={1240} rankDelta={4} fresh />
              <ProgressStrip windowLabel="SINCE 11 MAY" xpDelta={2840} rankDelta={9} fresh />
              <ProgressStrip
                windowLabel="FIRST DEPLOY · 2H AGO"
                xpDelta={120}
                rankDelta={0}
                fresh
              />
              <ProgressStrip windowLabel="LAST 9 DAYS" xpDelta={-80} rankDelta={-1} fresh={false} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
              ROSTER MODAL · TRIGGER
            </div>
            <p className="font-mono text-xs text-text-secondary">
              <span className="text-rga-green">{`>`}</span> Click the ROSTER MODAL button above to open. Search filters live; long-range picks (gap &gt; 5,000 XP) render with magenta warning band.
            </p>
          </div>
        </section>
      </main>

      {bootOpen && (
        <BootOverlay
          operativeName="PROCHAZKA"
          cohortSize={MOCK_ROSTER.length + 1}
          onComplete={() => setBootOpen(false)}
        />
      )}

      <RosterModal
        open={rosterOpen}
        entries={MOCK_ROSTER.filter((e) => e.rank < MOCK_ME.rank)}
        callerXp={MOCK_ME.xp}
        callerRank={MOCK_ME.rank}
        onClose={() => setRosterOpen(false)}
        onDesignate={(id) => {
          console.log('designate from modal', id)
          setRosterOpen(false)
        }}
      />
    </>
  )
}

function buildState(variant: Variant): PointCardState {
  // Ashley does NOT ship level labels per leaderboard entry — only the
  // caller's own label is available (via /api/leveling/me). For every
  // *other* operative (POINT, suggested, rear-guard, relieved) we pass
  // null. The PointCard hides the BAND chip when the label is null.
  switch (variant) {
    case 'standard':
      return {
        kind: 'standard',
        point: MOCK_POINT,
        gap: 230,
        designatedAgo: '04D 12H',
        pointLevelLabel: null,
        suggestions: MOCK_SUGGESTIONS,
        rosterCountAbove: 46,
      }
    case 'suggest':
      return {
        kind: 'suggest',
        suggested: MOCK_POINT,
        gap: 230,
        suggestedLevelLabel: null,
        rosterCountAbove: 46,
      }
    case 'relieved':
      return {
        kind: 'relieved',
        relievedOp: MOCK_RELIEVED_OP,
        rankDelta: 3,
        relievedAgo: '02H AGO',
        callerXp: MOCK_ME.xp,
        suggestions: MOCK_NEXT_SUGGESTIONS,
        rosterCountAbove: 47,
      }
    case 'top':
      return {
        kind: 'top',
        rearGuard: MOCK_REAR_GUARD,
        rearGap: 5110,
        rearGuardLevelLabel: null,
      }
    case 'unranked':
      return { kind: 'unranked' }
  }
}

/**
 * Wraps the preview in a constrained-width frame to simulate mobile.
 */
function PreviewFrame({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  if (!mobile) return <>{children}</>
  return (
    <div className="mx-auto w-full max-w-[420px] border border-rga-magenta/20 bg-[rgba(0,0,0,0.2)] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[9px] tracking-[0.4em] uppercase text-rga-magenta/60">
        <span>// VIEWPORT · 420W</span>
        <span>MOBILE PREVIEW</span>
      </div>
      {children}
    </div>
  )
}
