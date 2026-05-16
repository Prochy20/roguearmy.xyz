import Image from 'next/image'
import { leaderboardAvatarSrc } from './avatar'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface LeaderboardListProps {
  entries: LeaderboardEntry[]
  /** Rank of the first entry, used for the visual numbering (e.g. 4 when this list follows a top-3 hero). */
  startRank: number
  /** Logged-in user's rank — highlights their row if it appears in this slice. */
  myRank: number | null
  /** Logged-in user's XP — drives the DST column (omitted when null). */
  myXp?: number | null
  /** Configured level label for the caller — shown on their own row when present. */
  myLevelLabel: string | null
}

export function LeaderboardList({
  entries,
  startRank,
  myRank,
  myXp,
  myLevelLabel,
}: LeaderboardListProps) {
  const showDst = typeof myXp === 'number'

  // Header and body grids are separate containers — each computes track
  // widths from its own content. Auto columns produce misalignment because
  // header text ("LV") is much narrower than body content ("09"+label).
  // Fixed widths anchor both grids to the same template.
  const gridCols = showDst
    ? 'grid-cols-[52px_1fr_72px_84px] sm:grid-cols-[72px_1fr_92px_92px_92px]'
    : 'grid-cols-[52px_1fr_72px_84px] sm:grid-cols-[72px_1fr_92px_96px]'

  return (
    <section
      aria-label="leaderboard roster"
      className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)]"
    >
      <div
        className={
          'grid items-baseline gap-3 border-b border-[rgba(255,255,255,0.08)] px-5 py-2.5 font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted sm:gap-5 sm:px-8 sm:py-3 ' +
          gridCols
        }
      >
        <div>// RANK</div>
        <div>OPERATIVE</div>
        <div className="text-right">LV</div>
        <div className="text-right">XP</div>
        {showDst && <div className="hidden text-right sm:block">DST</div>}
      </div>

      <ul>
        {entries.map((entry, i) => {
          const rank = entry.rank ?? startRank + i
          const isMe = myRank === rank
          const label = isMe ? myLevelLabel : null
          const dst = showDst && !isMe ? entry.xp - (myXp as number) : null
          return (
            <li
              key={entry.discordId}
              className={
                'group/row relative grid items-center gap-3 px-5 py-2.5 transition-colors sm:gap-5 sm:px-8 sm:py-3 ' +
                gridCols +
                ' ' +
                (i < entries.length - 1
                  ? 'border-b border-[rgba(255,255,255,0.05)] '
                  : '') +
                (isMe
                  ? 'bg-[rgba(0,255,65,0.05)] hover:bg-[rgba(0,255,65,0.08)]'
                  : 'hover:bg-[rgba(255,255,255,0.02)]')
              }
            >
              {/* Subtle left edge marker — green for "me" row, transparent otherwise */}
              <span
                aria-hidden
                className={
                  'absolute inset-y-0 left-0 w-px ' +
                  (isMe
                    ? 'bg-rga-green shadow-[0_0_8px_#00FF41]'
                    : 'bg-transparent group-hover/row:bg-rga-cyan/40')
                }
              />

              <div
                className={
                  'font-mono tabular-nums text-sm sm:text-base ' +
                  (isMe ? 'text-rga-green' : 'text-text-secondary')
                }
              >
                {`#${String(rank).padStart(3, '0')}`}
              </div>

              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <RowAvatar entry={entry} />
                <div className="flex min-w-0 flex-col">
                  <span
                    className={
                      'truncate font-display uppercase leading-tight ' +
                      (isMe ? 'text-rga-green' : 'text-text-primary')
                    }
                    style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                  >
                    {entry.displayName}
                  </span>
                  {isMe && (
                    <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-rga-green/80">
                      // YOU
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end leading-none">
                <span
                  className={
                    'font-display tabular-nums ' +
                    (isMe
                      ? 'text-rga-green [text-shadow:0_0_12px_rgba(0,255,65,0.5)]'
                      : 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.35)]')
                  }
                  style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}
                >
                  {String(entry.level).padStart(2, '0')}
                </span>
                {label && (
                  <span
                    className={
                      'mt-1 max-w-full truncate font-mono text-[9px] tracking-[0.3em] uppercase ' +
                      (isMe ? 'text-rga-green/80' : 'text-rga-cyan/65')
                    }
                  >
                    {label}
                  </span>
                )}
              </div>

              <div
                className={
                  'text-right font-mono tabular-nums text-sm sm:text-base ' +
                  (isMe ? 'text-text-primary' : 'text-text-secondary')
                }
              >
                {entry.xp.toLocaleString()}
              </div>

              {showDst && (
                <DstCell dst={dst} isMe={isMe} />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function RowAvatar({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-[rgba(255,255,255,0.1)] sm:h-11 sm:w-11">
      <Image
        src={leaderboardAvatarSrc(entry)}
        alt={entry.displayName}
        width={64}
        height={64}
        className="h-full w-full object-cover"
        unoptimized
      />
    </div>
  )
}

/**
 * Signed XP distance from caller. Positive (green) = operative is ahead;
 * negative (magenta) = operative is behind. Hidden on mobile to keep the
 * row legible at narrow widths. Caller's own row shows an em-dash.
 */
function DstCell({ dst, isMe }: { dst: number | null; isMe: boolean }) {
  if (isMe) {
    return (
      <div className="hidden text-right font-mono text-sm text-text-muted/50 sm:block">
        —
      </div>
    )
  }
  if (dst == null) return <div className="hidden sm:block" />
  const sign = dst > 0 ? '+' : dst < 0 ? '−' : '±'
  const abs = Math.abs(dst).toLocaleString()
  const tone =
    dst > 0
      ? 'text-rga-green [text-shadow:0_0_8px_rgba(0,255,65,0.35)]'
      : dst < 0
        ? 'text-rga-magenta [text-shadow:0_0_8px_rgba(255,0,255,0.3)]'
        : 'text-text-muted'
  return (
    <div className={'hidden text-right font-mono tabular-nums text-sm sm:block ' + tone}>
      {sign}
      {abs}
    </div>
  )
}
