'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

/**
 * Cyberpunk-styled login button for blog navigation
 * Features terminal access point aesthetic with:
 * - Corner targeting brackets that expand on hover
 * - Animated scan line effect
 * - Pulsing "READY" status indicator
 * - Discord icon integration
 */
export function BlogNavLoginButton() {
  const pathname = usePathname()

  const handleLogin = () => {
    const returnTo = encodeURIComponent(pathname)
    window.location.href = `/api/auth/discord?returnTo=${returnTo}`
  }

  return (
    <button
      onClick={handleLogin}
      className="group relative flex items-center gap-2.5 px-4 py-2 bg-void/80 backdrop-blur-sm font-mono text-sm transition-colors duration-300"
    >
      {/* Corner brackets - top left */}
      <span
        className={cn(
          'absolute -top-px -left-px w-3 h-px bg-rga-cyan transition-all duration-300',
          'group-hover:w-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />
      <span
        className={cn(
          'absolute -top-px -left-px w-px h-3 bg-rga-cyan transition-all duration-300',
          'group-hover:h-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />

      {/* Corner brackets - top right */}
      <span
        className={cn(
          'absolute -top-px -right-px w-3 h-px bg-rga-cyan transition-all duration-300',
          'group-hover:w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />
      <span
        className={cn(
          'absolute -top-px -right-px w-px h-3 bg-rga-cyan transition-all duration-300',
          'group-hover:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />

      {/* Corner brackets - bottom left */}
      <span
        className={cn(
          'absolute -bottom-px -left-px w-3 h-px bg-rga-cyan transition-all duration-300',
          'group-hover:w-4 group-hover:-translate-x-0.5 group-hover:translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />
      <span
        className={cn(
          'absolute -bottom-px -left-px w-px h-3 bg-rga-cyan transition-all duration-300',
          'group-hover:h-4 group-hover:-translate-x-0.5 group-hover:translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />

      {/* Corner brackets - bottom right */}
      <span
        className={cn(
          'absolute -bottom-px -right-px w-3 h-px bg-rga-cyan transition-all duration-300',
          'group-hover:w-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />
      <span
        className={cn(
          'absolute -bottom-px -right-px w-px h-3 bg-rga-cyan transition-all duration-300',
          'group-hover:h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5',
          'shadow-[0_0_6px_rgba(0,255,255,0.5)]'
        )}
      />

      {/* Scan line effect on hover */}
      <span className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-rga-cyan/40 to-transparent animate-scan" />
      </span>

      {/* Inner glow on hover */}
      <span
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-rga-cyan/10 to-transparent opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100'
        )}
      />

      {/* Discord icon with hover effect */}
      <DiscordIcon
        className={cn(
          'relative w-4 h-4 text-rga-gray transition-all duration-300',
          'group-hover:text-rga-cyan group-hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]'
        )}
      />

      {/* Text */}
      <span
        className={cn(
          'relative tracking-wider text-rga-gray transition-colors duration-300 uppercase text-xs font-medium',
          'group-hover:text-rga-cyan'
        )}
      >
        Login
      </span>
    </button>
  )
}
