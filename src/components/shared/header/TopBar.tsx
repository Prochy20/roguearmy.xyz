'use client'

import { BracketButton } from './BracketButton'
import type { MemberSession } from '@/lib/auth/types'

interface TopBarProps {
  onOpen: () => void
  member: MemberSession | null
}

// `member` is accepted for future use but the closed top bar intentionally
// shows no avatar — the overlay's bottom rail handles member identity.
export function TopBar({ onOpen }: TopBarProps) {
  return (
    <div className="relative z-[1] flex items-center justify-end gap-3 h-20 px-7">
      <BracketButton
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        accent="cyan"
        className="h-11 px-4"
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
