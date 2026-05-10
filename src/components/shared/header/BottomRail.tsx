'use client'

import Link from 'next/link'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { Avatar } from './Avatar'
import { BracketButton } from './BracketButton'
import type { MemberSession } from '@/lib/auth/types'
import type { PrimaryBadge } from '@/lib/auth/badges'

interface BottomRailProps {
  member: MemberSession | null
  onLogout: () => void
}

const BADGE_ACCENT: Record<PrimaryBadge, { color: string; glow: string }> = {
  DEVELOPER: { color: '#00FFFF', glow: 'rgba(0,255,255,0.55)' },
  STAFF: { color: '#00FF41', glow: 'rgba(0,255,65,0.55)' },
  BOOSTER: { color: '#FF00FF', glow: 'rgba(255,0,255,0.55)' },
  MEMBER: { color: '#9aa3a6', glow: 'rgba(154,163,166,0.4)' },
}

export function BottomRail({ member, onLogout }: BottomRailProps) {
  return (
    <div
      className="
        mt-6 flex flex-wrap items-end justify-end gap-6
        border-t border-rga-green/[0.12] pt-[18px]
      "
    >
      <div className="min-w-0">
        <div
          className="font-mono uppercase text-white/40 mb-[10px] text-right"
          style={{ fontSize: 9, letterSpacing: '0.25em' }}
        >
          MEMBER OPS
        </div>

        {member ? (
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-4 mr-1 order-2 md:order-1">
              <Link
                href="/me"
                className="font-mono uppercase text-rga-cyan hover:text-white transition-colors"
                style={{ fontSize: 10, letterSpacing: '0.2em' }}
              >
                Profile →
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="font-mono uppercase text-white/40 hover:text-white transition-colors"
                style={{ fontSize: 10, letterSpacing: '0.2em' }}
              >
                Logout
              </button>
            </div>
            <div className="min-w-0 text-right order-3 md:order-2">
              <div
                className="font-display text-white truncate"
                style={{ fontSize: 16, letterSpacing: '0.06em' }}
              >
                {(member.globalName ?? member.username).toUpperCase()}
              </div>
              <BadgeLine badge={member.primaryBadge} />
            </div>
            <div className="order-1 md:order-3">
              <Avatar member={member} size={36} booster={member.isBooster} />
            </div>
          </div>
        ) : (
          <BracketButton
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/discord'
            }}
            accent="cyan"
            className="px-5 py-3 text-rga-cyan group-hover:text-white"
          >
            <DiscordIcon className="w-[14px] h-[14px] text-rga-cyan transition-colors group-hover:text-white" />
            <span className="relative">Sign in with Discord</span>
          </BracketButton>
        )}
      </div>
    </div>
  )
}

function BadgeLine({ badge }: { badge: PrimaryBadge }) {
  const accent = BADGE_ACCENT[badge] ?? BADGE_ACCENT.MEMBER
  return (
    <div
      className="font-mono uppercase mt-[2px]"
      style={{
        fontSize: 9,
        letterSpacing: '0.25em',
        color: accent.color,
        textShadow: `0 0 8px ${accent.glow}`,
      }}
    >
      [ {badge} ]
    </div>
  )
}
