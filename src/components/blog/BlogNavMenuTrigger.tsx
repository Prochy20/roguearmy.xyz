'use client'

import { BracketButton } from '@/components/chrome/header/BracketButton'
import { useMenu } from '@/components/chrome/header/MenuContext'

export function BlogNavMenuTrigger() {
  const { open } = useMenu()

  return (
    <BracketButton
      type="button"
      onClick={open}
      aria-label="Open site menu"
      accent="cyan"
      className="h-9 px-3"
    >
      <svg
        width="16"
        height="16"
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
  )
}
