import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { StaffPortrait } from './StaffPortrait'
import type { StaffAccent, StaffProfile } from './types'
import { accentFor, operativeIdAt } from './utils'

interface StaffCardProps {
  profile: StaffProfile
  index: number
  /** When true, reveals the Discord handle + DM affordance row at the bottom. */
  showMemberSurface: boolean
}

const ACCENT_TEXT: Record<StaffAccent, string> = {
  green: 'text-rga-green',
  cyan: 'text-rga-cyan',
  magenta: 'text-rga-magenta',
}

const ACCENT_FRAME: Record<StaffAccent, string> = {
  green: 'border-rga-green/15 group-hover/card:border-rga-green/40',
  cyan: 'border-rga-cyan/15 group-hover/card:border-rga-cyan/40',
  magenta: 'border-rga-magenta/15 group-hover/card:border-rga-magenta/40',
}

const ACCENT_GLOW_HOVER: Record<StaffAccent, string> = {
  green: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(0,255,65,0.55)]',
  cyan: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(0,255,255,0.55)]',
  magenta: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(255,0,255,0.55)]',
}

const ACCENT_TAPE_BG: Record<StaffAccent, string> = {
  green:
    'bg-linear-to-b from-rga-green/15 via-rga-green/30 to-rga-green/15 border-rga-green/30',
  cyan: 'bg-linear-to-b from-rga-cyan/15 via-rga-cyan/30 to-rga-cyan/15 border-rga-cyan/30',
  magenta:
    'bg-linear-to-b from-rga-magenta/15 via-rga-magenta/30 to-rga-magenta/15 border-rga-magenta/30',
}

const ACCENT_TAPE_TEXT: Record<StaffAccent, string> = {
  green: 'text-rga-green',
  cyan: 'text-rga-cyan',
  magenta: 'text-rga-magenta',
}

export function StaffCard({ profile, index, showMemberSurface }: StaffCardProps) {
  const accent = accentFor(profile.discordId)
  const operativeId = operativeIdAt(index)
  const discordUrl = `https://discord.com/users/${profile.discordId}`

  return (
    <article
      className={cn(
        'rga-staff-card group/card relative flex h-full w-full transition-all duration-300 ease-out',
        'hover:-translate-y-0.5',
      )}
      style={{ animationDelay: `${80 + index * 60}ms` }}
    >
      {/* Vertical tape strip — the unforgettable detail. A manila-folder label
          with operative ID rotated 90°, running the full height of the card. */}
      <aside
        className={cn(
          'relative flex w-7 shrink-0 items-center justify-center border-y border-l transition-colors duration-300',
          ACCENT_TAPE_BG[accent],
        )}
        aria-hidden
      >
        <div
          className={cn(
            'flex items-center gap-3 whitespace-nowrap font-mono text-[10px] uppercase',
            ACCENT_TAPE_TEXT[accent],
          )}
          style={{
            transform: 'rotate(-90deg)',
            letterSpacing: '0.5em',
          }}
        >
          <span
            aria-hidden
            className={cn(
              'inline-block h-1.5 w-1.5 shrink-0',
              accent === 'green'
                ? 'bg-rga-green'
                : accent === 'cyan'
                  ? 'bg-rga-cyan'
                  : 'bg-rga-magenta',
            )}
          />
          <span>{operativeId}</span>
          <span className="opacity-50">·</span>
          <span className="opacity-75">ACTIVE</span>
        </div>
      </aside>

      {/* Main card body */}
      <CyberCorners color={accent} size="sm" glow className="flex flex-1 flex-col">
        <div
          className={cn(
            'relative flex h-full min-h-[460px] flex-1 flex-col border bg-[rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300',
            ACCENT_FRAME[accent],
            ACCENT_GLOW_HOVER[accent],
          )}
        >
          {/* Single scanline sweep that travels top-to-bottom on hover — a
              transition rather than a keyframe loop so the gesture is one-shot
              and respects pointer-leave by reversing back to start. */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-10 h-px translate-y-0 opacity-0 transition-all duration-[900ms] ease-out group-hover/card:translate-y-[460px] group-hover/card:opacity-100',
              accent === 'green'
                ? 'bg-linear-to-r from-transparent via-rga-green/80 to-transparent'
                : accent === 'cyan'
                  ? 'bg-linear-to-r from-transparent via-rga-cyan/80 to-transparent'
                  : 'bg-linear-to-r from-transparent via-rga-magenta/80 to-transparent',
            )}
          />

          {/* Portrait */}
          <div className="p-4 pb-3">
            <StaffPortrait
              displayName={profile.cached_displayName}
              avatarUrl={profile.cached_avatarUrl}
              accent={accent}
            />
          </div>

          {/* Info block */}
          <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
            {/* Display name */}
            <h3
              className="font-display leading-[0.95] tracking-[0.01em] text-text-primary uppercase"
              style={{ fontSize: 'clamp(22px, 1.8vw, 28px)' }}
            >
              {profile.cached_displayName}
            </h3>

            {/* Role title */}
            <div
              className={cn(
                'font-mono text-[10px] tracking-[0.3em] uppercase',
                ACCENT_TEXT[accent],
              )}
            >
              // {profile.roleTitle}
            </div>

            {/* Bio — line-clamped to 3 so cards stay rhythmic */}
            {profile.bio ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                {profile.bio}
              </p>
            ) : (
              <p className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
                // dossier pending
              </p>
            )}
          </div>

          {/* Member-only contact bar */}
          {showMemberSurface && (
            <div
              className={cn(
                'relative mx-4 mb-4 mt-2 flex items-center justify-between gap-3 border-t border-dashed pt-3',
                accent === 'green'
                  ? 'border-rga-green/25'
                  : accent === 'cyan'
                    ? 'border-rga-cyan/25'
                    : 'border-rga-magenta/25',
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[9px] tracking-[0.35em] text-text-muted uppercase">
                  // direct line
                </span>
                <code
                  className={cn(
                    'truncate font-mono text-[11px] tracking-wide',
                    profile.cached_username ? ACCENT_TEXT[accent] : 'text-text-muted',
                  )}
                >
                  {profile.cached_username ? `@${profile.cached_username}` : '@ — syncing'}
                </code>
              </div>

              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group/dm relative inline-flex items-center gap-2 border bg-black/40 px-3 py-2 font-mono text-[10px] tracking-[0.3em] uppercase backdrop-blur-md transition-all duration-200',
                  accent === 'green'
                    ? 'border-rga-green/30 text-rga-green hover:border-rga-green hover:bg-rga-green/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,65,0.6)]'
                    : accent === 'cyan'
                      ? 'border-rga-cyan/30 text-rga-cyan hover:border-rga-cyan hover:bg-rga-cyan/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,255,0.6)]'
                      : 'border-rga-magenta/30 text-rga-magenta hover:border-rga-magenta hover:bg-rga-magenta/10 hover:shadow-[0_0_16px_-4px_rgba(255,0,255,0.6)]',
                )}
                aria-label={`DM ${profile.cached_displayName} on Discord`}
              >
                <DiscordIcon className="h-3 w-3 transition-transform duration-200 group-hover/dm:scale-110" />
                <MessageSquare className="h-3 w-3" aria-hidden />
                <span>DM</span>
              </a>
            </div>
          )}
        </div>
      </CyberCorners>
    </article>
  )
}
