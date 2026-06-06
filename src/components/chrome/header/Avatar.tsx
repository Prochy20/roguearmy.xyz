'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import type { MemberSession } from '@/lib/auth/types'

interface AvatarProps {
  member: MemberSession
  size?: number
  className?: string
  /**
   * When true, renders the BOOSTER decoration — an additive magenta glow
   * ring around the avatar. Mirrors Discord's avatar-decoration pattern so
   * the BOOSTER signal is visible alongside a competing functional badge.
   */
  booster?: boolean
}

export function Avatar({ member, size = 36, className, booster = false }: AvatarProps) {
  const initial = (member.globalName ?? member.username).charAt(0).toUpperCase()
  const avatarUrl = member.avatar
    ? getDiscordAvatarUrl(member.discordId, member.avatar)
    : null

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <div
        className="relative inline-flex items-center justify-center rounded-full overflow-hidden border border-rga-green/50"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #1a4a2a 0%, #003b1f 100%)',
          boxShadow: '0 0 12px rgba(0,255,65,0.35)',
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${member.username} avatar`}
            fill
            sizes={`${size}px`}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span
            className="font-mono font-bold text-rga-green"
            style={{
              fontSize: Math.round(size * 0.45),
              textShadow: '0 0 6px rgba(0,255,65,0.6)',
            }}
          >
            {initial}
          </span>
        )}
      </div>

      {booster && (
        <span
          aria-label="Server Booster"
          title="Server Booster"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            border: '1.5px solid rgba(255,0,255,0.85)',
            boxShadow:
              '0 0 10px rgba(255,0,255,0.65), inset 0 0 6px rgba(255,0,255,0.45)',
          }}
        />
      )}
    </div>
  )
}
