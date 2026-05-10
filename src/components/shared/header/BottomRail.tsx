'use client'

import Link from 'next/link'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { Avatar } from './Avatar'
import { BracketButton } from './BracketButton'
import type { MemberSession } from '@/lib/auth/types'

interface BottomRailProps {
  member: MemberSession | null
  rank?: string
  onLogout: () => void
}

export function BottomRail({
  member,
  rank = 'RANK · RECRUIT · — OPS',
  onLogout,
}: BottomRailProps) {
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
                href="/members/me"
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
              <div
                className="font-mono uppercase text-rga-green/70"
                style={{ fontSize: 9, letterSpacing: '0.2em' }}
              >
                {rank}
              </div>
            </div>
            <div className="order-1 md:order-3">
              <Avatar member={member} size={36} />
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
