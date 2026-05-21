'use client'

import { BracketButton } from './BracketButton'
import type { MemberSession } from '@/lib/auth/types'

interface TopBarProps {
  onOpen: () => void
  member: MemberSession | null
}

// `member` is accepted for future use but the closed top bar intentionally
// shows no avatar — the overlay's bottom rail handles member identity.
//
// The outer flex container is `pointer-events-none` so the otherwise-empty
// 80px-tall strip across the top of the viewport doesn't intercept clicks
// meant for any page-level sticky content that docks at `top-0` (e.g. the
// Division 2 content filter bar). The MENU button itself re-enables hit
// detection via `pointer-events-auto`.
export function TopBar({ onOpen }: TopBarProps) {
  return (
    <div className="pointer-events-none relative z-[1] flex items-center justify-end gap-3 h-20 px-7">
      <BracketButton
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        accent="cyan"
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
