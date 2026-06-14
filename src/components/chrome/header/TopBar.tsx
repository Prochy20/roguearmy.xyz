'use client'

import { LogIn } from 'lucide-react'
import { BracketButton } from './BracketButton'
import { BracketTooltip } from '@/components/ui/BracketTooltip'
import type { MemberSession } from '@/lib/auth/types'

interface TopBarProps {
  onOpen: () => void
  member: MemberSession | null
}

// Logged-out visitors get a cyan sign-in shortcut to the left of MENU so the
// Discord login isn't buried in the overlay; when a member is present the bar
// shows only MENU (identity lives in the overlay's bottom rail, no avatar here).
//
// The outer flex container is `pointer-events-none` so the otherwise-empty
// 80px-tall strip across the top of the viewport doesn't intercept clicks
// meant for any page-level sticky content that docks at `top-0` (e.g. the
// Division 2 content filter bar). The MENU button and the sign-in wrapper
// re-enable hit detection via `pointer-events-auto`.
export function TopBar({ onOpen, member }: TopBarProps) {
  return (
    <div className="pointer-events-none relative z-[1] flex items-center justify-end gap-3 h-20 px-7">
      {member ? null : (
        <BracketTooltip
          title="Sign in with Discord"
          side="bottom"
          accentText="text-rga-cyan"
          accentBorder="border-rga-cyan/40"
          cornerTick="border-rga-cyan/80"
          className="pointer-events-auto"
        >
          <BracketButton
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/discord'
            }}
            aria-label="Sign in with Discord"
            accent="cyan"
            className="h-11 px-4"
          >
            <LogIn width={20} height={20} aria-hidden />
          </BracketButton>
        </BracketTooltip>
      )}
      <BracketButton
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        accent="green"
        className="pointer-events-auto h-11 px-4"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path d="M4 8h16 M4 16h16" />
        </svg>
        <span>Menu</span>
      </BracketButton>
    </div>
  )
}
