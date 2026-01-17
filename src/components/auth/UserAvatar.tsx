'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'

interface UserAvatarProps {
  discordId: string
  avatar: string | null
  username: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export function UserAvatar({
  discordId,
  avatar,
  username,
  size = 'md',
  className,
}: UserAvatarProps) {
  const avatarUrl = getDiscordAvatarUrl(discordId, avatar)

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden border-2 border-rga-cyan/50',
        sizes[size],
        className
      )}
    >
      <Image
        src={avatarUrl}
        alt={`${username}'s avatar`}
        fill
        className="object-cover"
        unoptimized // Discord CDN handles optimization
      />
    </div>
  )
}
