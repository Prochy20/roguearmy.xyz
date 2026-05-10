import Image from 'next/image'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { CountUp } from '@/components/shared/CountUp'
import { leaderboardAvatarSrc } from './avatar'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface LeaderboardHeroProps {
  /** Top 3 entries, in rank order (rank 1 first). */
  entries: LeaderboardEntry[]
  /** Logged-in user's own rank, used to highlight a podium card if they're in the top 3. */
  myRank: number | null
  /** Configured label for the caller's current level (shown on their podium card if they're in the top 3). */
  myLevelLabel: string | null
}

type Tone = 'green' | 'cyan' | 'magenta'

const TONE_FOR_RANK: Record<1 | 2 | 3, Tone> = {
  1: 'green',
  2: 'cyan',
  3: 'magenta',
}

const ACCENT_TEXT: Record<Tone, string> = {
  green: 'text-rga-green [text-shadow:0_0_24px_rgba(0,255,65,0.55)]',
  cyan: 'text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.55)]',
  magenta: 'text-rga-magenta [text-shadow:0_0_24px_rgba(255,0,255,0.55)]',
}

const ACCENT_BORDER: Record<Tone, string> = {
  green: 'border-rga-green/30 shadow-[0_0_28px_rgba(0,255,65,0.18)]',
  cyan: 'border-rga-cyan/30 shadow-[0_0_28px_rgba(0,255,255,0.18)]',
  magenta: 'border-rga-magenta/30 shadow-[0_0_28px_rgba(255,0,255,0.18)]',
}

const ACCENT_PILL: Record<Tone, string> = {
  green: 'border-rga-green/40 text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.6)]',
  cyan: 'border-rga-cyan/40 text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.6)]',
  magenta: 'border-rga-magenta/40 text-rga-magenta [text-shadow:0_0_10px_rgba(255,0,255,0.6)]',
}

export function LeaderboardHero({ entries, myRank, myLevelLabel }: LeaderboardHeroProps) {
  if (entries.length === 0) return null

  return (
    <section
      aria-label="top operatives"
      className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10"
    >
      {entries.map((entry, i) => {
        const isMe = myRank === entry.rank
        return (
          <PodiumCard
            key={entry.discordId}
            entry={entry}
            rank={(i + 1) as 1 | 2 | 3}
            isMe={isMe}
            levelLabel={isMe ? myLevelLabel : null}
          />
        )
      })}
    </section>
  )
}

function PodiumCard({
  entry,
  rank,
  isMe,
  levelLabel,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  isMe: boolean
  levelLabel: string | null
}) {
  const tone = TONE_FOR_RANK[rank]
  const isFirst = rank === 1
  const avatarSrc = leaderboardAvatarSrc(entry)

  return (
    <article
      className={
        'group relative ' +
        (isFirst ? 'lg:-translate-y-2' : '')
      }
      data-rank={rank}
    >
      <CyberCorners color={tone} size={isFirst ? 'lg' : 'md'} glow>
        <div
          className={
            'relative flex flex-col gap-5 border bg-[rgba(0,0,0,0.45)] p-6 sm:p-7 ' +
            ACCENT_BORDER[tone]
          }
        >
          {/* Rank glyph in the corner */}
          <div className="flex items-start justify-between">
            <div
              className={
                'font-display tabular-nums uppercase leading-none ' +
                ACCENT_TEXT[tone]
              }
              style={{ fontSize: isFirst ? 'clamp(56px, 7vw, 96px)' : 'clamp(40px, 5vw, 64px)' }}
            >
              {`#${String(rank).padStart(2, '0')}`}
            </div>
            {isMe && (
              <span
                className={
                  'border bg-void/80 px-2 py-1 font-mono text-[9px] tracking-[0.35em] uppercase ' +
                  ACCENT_PILL[tone]
                }
              >
                YOU
              </span>
            )}
          </div>

          {/* Avatar */}
          <div className={isFirst ? 'w-full max-w-[180px]' : 'w-full max-w-[140px]'}>
            <div
              className={
                'relative aspect-square w-full overflow-hidden border ' +
                ACCENT_BORDER[tone]
              }
            >
              <Image
                src={avatarSrc}
                alt={entry.displayName}
                width={256}
                height={256}
                className="h-full w-full object-cover"
                unoptimized
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    tone === 'green'
                      ? 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,255,65,0.08) 0%, transparent 60%)'
                      : tone === 'cyan'
                        ? 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,255,255,0.08) 0%, transparent 60%)'
                        : 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,0,255,0.08) 0%, transparent 60%)',
                }}
              />
            </div>
          </div>

          {/* Identity */}
          <div className="flex min-w-0 flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
              CODENAME
            </div>
            <div
              className="font-display uppercase leading-tight text-text-primary break-words"
              style={{
                fontSize: isFirst ? 'clamp(22px, 2.6vw, 36px)' : 'clamp(18px, 2vw, 28px)',
              }}
            >
              {entry.displayName}
            </div>
          </div>

          {/* Stats: level + XP */}
          <div className="flex items-end justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[9px] tracking-[0.3em] text-text-muted uppercase">
                LEVEL
              </div>
              <div
                className={
                  'font-display tabular-nums leading-none ' + ACCENT_TEXT[tone]
                }
                style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}
              >
                {String(entry.level).padStart(2, '0')}
              </div>
              {levelLabel && (
                <div className={'font-mono text-[10px] tracking-[0.3em] uppercase ' + ACCENT_TEXT[tone]}>
                  {levelLabel}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="font-mono text-[9px] tracking-[0.3em] text-text-muted uppercase">
                TOTAL XP
              </div>
              <div className="font-mono tabular-nums text-text-primary" style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}>
                {isFirst ? (
                  <CountUp value={entry.xp} duration={1100} delay={200} locale reveal="glitch" />
                ) : (
                  entry.xp.toLocaleString()
                )}
              </div>
            </div>
          </div>
        </div>
      </CyberCorners>
    </article>
  )
}

