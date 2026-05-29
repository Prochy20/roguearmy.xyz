import { CountUp } from '@/components/ui/CountUp'
import { CyberButton } from '@/components/ui/CyberButton'
import { FailRow } from '@/components/ui/FailRow'
import { TierBand } from '@/components/community/leaderboard/formation/TierBand'
import type { AshleyResult } from '@/lib/api/server'

export type AshleyLevel = {
  level: number
  /** Optional configured label for the current level (e.g. "VETERAN"). */
  levelLabel?: unknown
  xp: number
  progress: number
  nextLevel?: {
    level: number
    xpRequired: number
    /** Optional configured label for the next level (e.g. "ELITE"). */
    label?: unknown
  } | null
  xpToNextLevel?: unknown
}

interface ProgressionBandProps {
  level: AshleyResult<AshleyLevel>
}

export function ProgressionBand({ level }: ProgressionBandProps) {
  if (!level.ok) {
    return (
      <div className="flex flex-col gap-3">
        <FailRow code={level.error.code} status={level.error.status} returnTo="/me" />
      </div>
    )
  }

  const data = level.data
  const xpToNext = extractXpToNext(data.xpToNextLevel)
  const levelLabel = normalizeLabel(data.levelLabel)
  const nextLevelLabel = normalizeLabel(data.nextLevel?.label)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
            CURRENT LEVEL
          </div>
          <div className="mt-1 font-display text-[clamp(48px,7vw,96px)] leading-none tabular-nums text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.35)]">
            <CountUp value={data.level} duration={900} delay={250} padZeros={4} reveal="glitch" />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
            TOTAL XP
          </div>
          <div className="mt-1 font-mono text-2xl tabular-nums text-text-primary">
            <CountUp value={data.xp} duration={1100} delay={250} locale reveal="glitch" />
          </div>
        </div>
      </div>

      <TierBand
        compact
        level={data.level}
        levelLabel={levelLabel}
        progress={data.progress}
        xpToNextLevel={xpToNext}
        nextLevel={data.nextLevel?.level ?? null}
        nextLevelLabel={nextLevelLabel}
      />

      <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="flex max-w-xl flex-col gap-2 border-l-2 border-rga-cyan/30 pl-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-rga-cyan/80">
            // brief
          </span>
          <p className="font-mono text-xs leading-relaxed text-text-muted">
            XP accrues from sustained activity — voice presence, message
            contributions, raid attendance. Standing advances tier automatically
            and ranks against the rest of the formation.
          </p>
        </div>

        <CyberButton
          href="/leaderboard"
          color="cyan"
          iconRight={<span aria-hidden>→</span>}
          className="shrink-0 self-start sm:self-center"
        >
          OPEN FORMATION
        </CyberButton>
      </div>
    </div>
  )
}

// xpToNextLevel arrives as either a raw number or a boxed { value } object —
// the schema is opaque (Record<string, never>) so we accept both shapes.
function extractXpToNext(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const n = Number((value as { value: unknown }).value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function normalizeLabel(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  return null
}
