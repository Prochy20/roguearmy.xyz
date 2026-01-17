'use client'

import { GlowButton } from '@/components/shared/GlowButton'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

interface DiscordLoginButtonProps {
  className?: string
}

export function DiscordLoginButton({ className }: DiscordLoginButtonProps) {
  const handleLogin = () => {
    window.location.href = '/api/auth/discord'
  }

  return (
    <GlowButton
      onClick={handleLogin}
      glowColor="cyan"
      className={className}
    >
      <DiscordIcon className="w-5 h-5 mr-2" />
      Login with Discord
    </GlowButton>
  )
}
