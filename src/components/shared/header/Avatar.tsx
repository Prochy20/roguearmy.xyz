'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import type { MemberSession } from '@/lib/auth/types'

interface AvatarProps {
  member: MemberSession
  size?: number
  className?: string
}

export function Avatar({ member, size = 36, className }: AvatarProps) {
  const initial = (member.globalName ?? member.username).charAt(0).toUpperCase()
  const avatarUrl = member.avatar
    ? getDiscordAvatarUrl(member.discordId, member.avatar)
    : null

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'border border-rga-green/50 shrink-0',
        className,
      )}
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
  )
}
