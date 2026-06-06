import Image from 'next/image'
import { leaderboardAvatarSrc } from '../avatar'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface MiniPodiumProps {
  /** Top-3 entries in rank order (rank 1 first). */
  entries: LeaderboardEntry[]
  /** Caller's own rank, if any — highlights the row if caller appears in top 3. */
  myRank?: number | null
}

const TONE_FOR_RANK: Record<1 | 2 | 3, 'green' | 'cyan' | 'magenta'> = {
  1: 'green',
  2: 'cyan',
  3: 'magenta',
}

/**
 * Demoted top-3 row. Three compact horizontal cards rendered side-by-side.
 *
 * Deliberate weight calibration: this is supporting context now, NOT the
 * hero. Uses the tone palette but at ~30% of the original podium's
 * intensity. Should read at a glance, never compete with the POINT card.
 */
export function MiniPodium({ entries, myRank }: MiniPodiumProps) {
  if (entries.length === 0) return null

  return (
    <section aria-label="current leaders" className="flex flex-col gap-3">
      {/* Section eyebrow */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.4em] uppercase">
        <span className="text-text-muted">// CURRENT LEADERS</span>
        <span aria-hidden className="inline-block h-px flex-1 bg-text-muted/30" />
        <span className="text-text-muted">RANGE · 01—03</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {entries.slice(0, 3).map((entry, i) => {
          const rank = (i + 1) as 1 | 2 | 3
          const tone = TONE_FOR_RANK[rank]
          const isMe = myRank === entry.rank
          return <PodiumCell key={entry.discordId} entry={entry} rank={rank} tone={tone} isMe={isMe} />
        })}
      </div>
    </section>
  )
}

interface PodiumCellProps {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  tone: 'green' | 'cyan' | 'magenta'
  isMe: boolean
}

function PodiumCell({ entry, rank, tone, isMe }: PodiumCellProps) {
  const border =
    tone === 'green'
      ? 'border-rga-green/15'
      : tone === 'cyan'
        ? 'border-rga-cyan/15'
        : 'border-rga-magenta/15'
  const hoverBorder =
    tone === 'green'
      ? 'hover:border-rga-green/40'
      : tone === 'cyan'
        ? 'hover:border-rga-cyan/40'
        : 'hover:border-rga-magenta/40'
  const accentText =
    tone === 'green' ? 'text-rga-green' : tone === 'cyan' ? 'text-rga-cyan' : 'text-rga-magenta'
  const accentGlow =
    tone === 'green'
      ? '[text-shadow:0_0_8px_rgba(0,255,65,0.35)]'
      : tone === 'cyan'
        ? '[text-shadow:0_0_8px_rgba(0,255,255,0.35)]'
        : '[text-shadow:0_0_8px_rgba(255,0,255,0.35)]'
  const leftEdge =
    tone === 'green'
      ? 'bg-rga-green/60 group-hover/cell:bg-rga-green group-hover/cell:shadow-[0_0_10px_#00FF41]'
      : tone === 'cyan'
        ? 'bg-rga-cyan/60 group-hover/cell:bg-rga-cyan group-hover/cell:shadow-[0_0_10px_#00FFFF]'
        : 'bg-rga-magenta/60 group-hover/cell:bg-rga-magenta group-hover/cell:shadow-[0_0_10px_#FF00FF]'

  return (
    <article
      className={
        'group/cell relative flex items-center gap-3 border bg-[rgba(0,0,0,0.4)] py-3 pl-4 pr-3 transition-all ' +
        border +
        ' ' +
        hoverBorder +
        (isMe ? ' bg-[rgba(0,255,65,0.03)]' : '')
      }
    >
      {/* Tone-coded left edge — brightens on hover */}
      <span aria-hidden className={'absolute inset-y-2 left-0 w-px transition-all ' + leftEdge} />

      {/* Rank glyph */}
      <div
        className={'shrink-0 font-display tabular-nums leading-none ' + accentText + ' ' + accentGlow}
        style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}
      >
        #{String(rank).padStart(2, '0')}
      </div>

      {/* Avatar */}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-[rgba(255,255,255,0.1)] sm:h-11 sm:w-11">
        <Image
          src={leaderboardAvatarSrc(entry)}
          alt={entry.displayName}
          width={88}
          height={88}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      {/* Identity */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="truncate font-display text-sm uppercase tracking-[0.005em] text-text-primary sm:text-base">
          {entry.displayName}
        </div>
        <div className="flex items-baseline gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-text-muted">
          <span>LV {String(entry.level).padStart(2, '0')}</span>
          <span>·</span>
          <span className="tabular-nums">{entry.xp.toLocaleString()} XP</span>
        </div>
      </div>

      {isMe && (
        <span
          className={
            'shrink-0 border bg-void/80 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.3em] uppercase ' +
            accentText +
            ' ' +
            (tone === 'green'
              ? 'border-rga-green/40'
              : tone === 'cyan'
                ? 'border-rga-cyan/40'
                : 'border-rga-magenta/40')
          }
        >
          YOU
        </span>
      )}
    </article>
  )
}
