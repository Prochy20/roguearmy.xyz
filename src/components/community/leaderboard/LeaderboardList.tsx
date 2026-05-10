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
  /** Configured level label for the caller — shown on their own row when present. */
  myLevelLabel: string | null
}

export function LeaderboardList({ entries, startRank, myRank, myLevelLabel }: LeaderboardListProps) {
  return (
    <section
      aria-label="leaderboard roster"
      className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-[64px_1fr_auto_auto] gap-4 border-b border-[rgba(255,255,255,0.08)] px-5 py-3 font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted sm:grid-cols-[80px_1fr_auto_auto] sm:gap-6 sm:px-8">
        <div>// RANK</div>
        <div>OPERATIVE</div>
        <div className="text-right">LV</div>
        <div className="text-right">XP</div>
      </div>

      <ul>
        {entries.map((entry, i) => {
          const rank = entry.rank ?? startRank + i
          const isMe = myRank === rank
          const label = isMe ? myLevelLabel : null
          return (
            <li
              key={entry.discordId}
              className={
                'group/row relative grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 px-5 py-3 transition-colors sm:grid-cols-[80px_1fr_auto_auto] sm:gap-6 sm:px-8 sm:py-4 ' +
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
                {`#${String(rank).padStart(2, '0')}`}
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
                      'mt-1 max-w-[160px] truncate font-mono text-[9px] tracking-[0.3em] uppercase ' +
                      (isMe ? 'text-rga-green/80' : 'text-rga-cyan/65')
                    }
                  >
                    {label}
                  </span>
                )}
              </div>

              <div
                className={
                  'font-mono tabular-nums text-sm sm:text-base ' +
                  (isMe ? 'text-text-primary' : 'text-text-secondary')
                }
              >
                {entry.xp.toLocaleString()}
              </div>
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
