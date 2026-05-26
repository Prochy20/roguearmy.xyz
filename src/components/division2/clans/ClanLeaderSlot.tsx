import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CLAN_ACCENTS, type ClanAccent } from './accent'

export interface ClanLeader {
  discordId: string
  displayName: string
  avatarUrl: string | null
}

interface ClanLeaderSlotProps {
  leader: ClanLeader
  accent: ClanAccent
  className?: string
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '··'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/**
 * Member-only leader card slot. Server-rendered conditional — when a clan
 * has no leader assigned, the parent simply doesn't render this. For anon
 * visitors the parent skips this entirely.
 *
 * Lightweight by design: small circle avatar + display name + a single
 * "MESSAGE ON DISCORD" affordance pointing at discord.com/users/<id>.
 */
export function ClanLeaderSlot({ leader, accent, className }: ClanLeaderSlotProps) {
  const theme = CLAN_ACCENTS[accent]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p
        className="font-mono uppercase text-white/35"
        style={{ fontSize: 10, letterSpacing: '0.18em' }}
      >
        // FIRETEAM LEAD
      </p>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative h-10 w-10 shrink-0 overflow-hidden rounded-full border ring-2 ring-offset-1 ring-offset-bg-elevated',
            theme.border,
            theme.ring,
          )}
        >
          {leader.avatarUrl ? (
            // `unoptimized` because Discord CDN (cdn.discordapp.com) isn't in
            // next.config.mjs remotePatterns. For 40×40 avatars the savings
            // from AVIF/WebP conversion are negligible, so keeping the raw
            // CDN URL is the cheaper trade. Add the host to remotePatterns
            // and drop this flag if avatar optimization ever matters.
            <Image
              src={leader.avatarUrl}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center font-mono text-[11px] uppercase',
                theme.text,
                theme.fill,
              )}
              style={{ letterSpacing: '0.08em' }}
              aria-hidden="true"
            >
              {initialsOf(leader.displayName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate font-display text-white"
            style={{ fontSize: 17, letterSpacing: '0.02em', lineHeight: 1.1 }}
          >
            {leader.displayName}
          </p>
          <p
            className="font-mono text-white/30 truncate"
            style={{ fontSize: 10, letterSpacing: '0.14em' }}
          >
            DISCORD · OPERATIVE
          </p>
        </div>
      </div>
    </div>
  )
}
