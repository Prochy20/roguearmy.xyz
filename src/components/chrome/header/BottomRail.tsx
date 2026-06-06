'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { DiscordIcon } from '@/components/ui/DiscordIcon'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { AfkTicker } from '@/components/afk/AfkTicker'
import { normalizeAfkRecord, type AfkRecord } from '@/components/afk/types'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import { useBookmarksOptional } from '@/contexts/BookmarksContext'
import type { MemberSession } from '@/lib/auth/types'
import type { PrimaryBadge } from '@/lib/auth/badges'
import { BracketButton } from './BracketButton'

/**
 * Storybook override for the AFK presence indicator state. Skips the
 * `/api/auth/me/afk` fetch and renders the supplied state directly.
 *  - `undefined` (default in production): fetches and renders the result.
 *  - `{ kind: 'active' }`: renders ACTIVE without fetching.
 *  - `{ kind: 'afk', record }`: renders AFK with the supplied record.
 *  - `{ kind: 'unresolved' }`: renders the failure-fallback indicator.
 */
export type PresenceOverride =
  | { kind: 'active' }
  | { kind: 'afk'; record: AfkRecord }
  | { kind: 'unresolved' }

interface BottomRailProps {
  member: MemberSession | null
  onLogout: () => void
  presenceOverride?: PresenceOverride
}

type CornerColor = 'green' | 'magenta' | 'gray' | 'dev'

const BADGE_ACCENT: Record<
  PrimaryBadge,
  { color: string; glow: string; corner: CornerColor }
> = {
  DEVELOPER: { color: '#CCFF00', glow: 'rgba(204,255,0,0.55)', corner: 'dev' },
  STAFF: { color: '#00FF41', glow: 'rgba(0,255,65,0.55)', corner: 'green' },
  BOOSTER: { color: '#FF00FF', glow: 'rgba(255,0,255,0.55)', corner: 'magenta' },
  MEMBER: { color: '#9aa3a6', glow: 'rgba(154,163,166,0.4)', corner: 'gray' },
}

function resolveCornerColor(badge: PrimaryBadge, isBooster: boolean): CornerColor {
  if (isBooster) return 'magenta'
  return BADGE_ACCENT[badge].corner
}

export function BottomRail({ member, onLogout, presenceOverride }: BottomRailProps) {
  return (
    <div
      className="
        mt-6 flex flex-wrap items-end justify-end gap-6
        border-t border-rga-green/[0.12] pt-[18px]
      "
    >
      {member ? (
        <>
          <ActionsZone onLogout={onLogout} presenceOverride={presenceOverride} />
          <div className="hidden md:block self-stretch border-l border-rga-green/[0.12]" />
          <IdentityZone member={member} />
        </>
      ) : (
        <BracketButton
          type="button"
          onClick={() => {
            window.location.href = '/api/auth/discord'
          }}
          accent="green"
          className="px-5 py-3 text-rga-green group-hover:text-white"
        >
          <DiscordIcon className="w-[14px] h-[14px] text-rga-green transition-colors group-hover:text-white" />
          <span className="relative">Sign in with Discord</span>
        </BracketButton>
      )}
    </div>
  )
}

function ActionsZone({
  onLogout,
  presenceOverride,
}: {
  onLogout: () => void
  presenceOverride?: PresenceOverride
}) {
  return (
    <div className="flex flex-col items-end gap-2.5">
      <PresenceIndicator override={presenceOverride} />
      <div className="flex items-center gap-2">
        <BookmarksMenuLink />
        <Link
          href="/me"
          className="inline-flex h-9 items-center justify-center gap-2 border border-rga-green/30 bg-rga-green/[0.05] px-3 font-mono text-[10px] uppercase tracking-[0.3em] text-rga-green/80 transition-colors hover:border-rga-green/60 hover:bg-rga-green/10 hover:text-rga-green"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5" />
          </svg>
          Profile
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-9 items-center justify-center gap-2 border border-white/20 bg-white/[0.03] px-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 transition-colors hover:border-white/40 hover:bg-white/[0.06] hover:text-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 3v9 M5.5 7.5a8 8 0 1 0 13 0" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

function BookmarksMenuLink() {
  const ctx = useBookmarksOptional()
  const count = ctx?.bookmarkedKeys.size ?? 0

  return (
    <Link
      href="/me/bookmarks"
      aria-label={count > 0 ? `Bookmarks (${count} saved)` : 'Bookmarks'}
      className="relative inline-flex h-9 w-9 items-center justify-center border border-rga-green/30 bg-rga-green/[0.05] text-rga-green/80 transition-colors hover:border-rga-green/60 hover:bg-rga-green/10 hover:text-rga-green"
    >
      <Bookmark className="h-4 w-4" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center border border-rga-green/40 bg-void px-1 font-mono text-[9px] tabular-nums text-rga-green">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

function IdentityZone({ member }: { member: MemberSession }) {
  return (
    <div className="flex items-end gap-4 min-w-0">
      <div className="flex flex-col items-end gap-1.5 min-w-0">
        <Link
          href="/me"
          className="font-display text-white truncate uppercase transition-opacity hover:opacity-80"
          style={{ fontSize: 26, letterSpacing: '1px', lineHeight: 1 }}
        >
          {member.globalName ?? member.username}
        </Link>
        <BadgeCell badge={member.primaryBadge} />
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span
          className="font-mono uppercase text-white/40"
          style={{ fontSize: 9, letterSpacing: '0.25em' }}
        >
          MEMBER OPS
        </span>
        <Link href="/me" aria-label="Profile" className="transition-opacity hover:opacity-90">
          <FramedAvatar member={member} />
        </Link>
      </div>
    </div>
  )
}

function BadgeCell({ badge }: { badge: PrimaryBadge }) {
  const accent = BADGE_ACCENT[badge]
  return (
    <span
      className="border font-mono uppercase px-2 py-1"
      style={{
        fontSize: 10,
        letterSpacing: '0.25em',
        borderColor: `${accent.color}66`,
        color: accent.color,
        textShadow: `0 0 8px ${accent.glow}`,
      }}
    >
      {badge}
    </span>
  )
}

function FramedAvatar({ member }: { member: MemberSession }) {
  const corner = resolveCornerColor(member.primaryBadge, member.isBooster)
  const initial = (member.globalName ?? member.username).charAt(0).toUpperCase()
  const avatarUrl = member.avatar
    ? getDiscordAvatarUrl(member.discordId, member.avatar)
    : null

  return (
    <CyberCorners color={corner} size="sm" glow>
      <div
        className="relative overflow-hidden border border-rga-green/30"
        style={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, #1a4a2a 0%, #003b1f 100%)',
          boxShadow: '0 0 12px rgba(0,255,65,0.35)',
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center font-mono font-bold text-rga-green"
            style={{ fontSize: 20, textShadow: '0 0 6px rgba(0,255,65,0.6)' }}
          >
            {initial}
          </span>
        )}
      </div>
    </CyberCorners>
  )
}

type PresenceState =
  | { kind: 'loading' }
  | { kind: 'active' }
  | { kind: 'afk'; record: AfkRecord }
  | { kind: 'unresolved' }

function PresenceIndicator({ override }: { override?: PresenceOverride }) {
  const [state, setState] = useState<PresenceState>(
    override ? override : { kind: 'loading' },
  )

  useEffect(() => {
    if (override) {
      setState(override)
      return
    }
    let cancelled = false
    fetch('/api/auth/me/afk', { credentials: 'same-origin' })
      .then(async (r) => {
        const body: unknown = await r.json().catch(() => null)
        if (cancelled) return
        setState(parsePresenceResponse(body))
      })
      .catch(() => {
        if (cancelled) return
        setState({ kind: 'unresolved' })
      })
    return () => {
      cancelled = true
    }
  }, [override])

  if (state.kind === 'loading') return null
  if (state.kind === 'afk') return <AfkIndicator record={state.record} />
  if (state.kind === 'unresolved') return <UnresolvedIndicator />
  return <ActiveIndicator />
}

function parsePresenceResponse(body: unknown): PresenceState {
  if (!body || typeof body !== 'object') return { kind: 'unresolved' }
  const obj = body as { afkRecord?: unknown; fallback?: unknown }
  const fallback = obj.fallback === true
  if (
    obj.afkRecord &&
    typeof obj.afkRecord === 'object' &&
    'createdAt' in obj.afkRecord &&
    typeof (obj.afkRecord as { createdAt: unknown }).createdAt === 'string'
  ) {
    return {
      kind: 'afk',
      record: normalizeAfkRecord(obj.afkRecord as Parameters<typeof normalizeAfkRecord>[0])!,
    }
  }
  if (fallback) return { kind: 'unresolved' }
  return { kind: 'active' }
}

function ActiveIndicator() {
  return (
    <Link
      href="/afk"
      aria-label="Open status console"
      className="flex items-center gap-2.5 text-rga-green hover:opacity-80 transition-opacity"
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 10, letterSpacing: '0.25em' }}
      >
        ACTIVE
      </span>
      <span
        aria-hidden
        className="me-dot-pulse"
        style={{
          width: 8,
          height: 8,
          background: '#00FF41',
          boxShadow: '0 0 6px rgba(0,255,65,0.7)',
        }}
      />
    </Link>
  )
}

function AfkIndicator({ record }: { record: AfkRecord }) {
  return (
    <Link
      href="/afk"
      aria-label="Manage AFK status"
      className="flex items-center gap-2.5 text-status-error hover:opacity-80 transition-opacity"
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 10, letterSpacing: '0.25em' }}
      >
        AFK
      </span>
      <span
        className="font-mono text-status-error/70 tabular-nums"
        style={{ fontSize: 10 }}
      >
        <AfkTicker createdAt={record.createdAt} variant="compact" />
      </span>
      <span
        aria-hidden
        className="me-dot-pulse"
        style={{
          width: 8,
          height: 8,
          background: '#FF0066',
          boxShadow: '0 0 6px rgba(255,0,102,0.7)',
        }}
      />
    </Link>
  )
}

function UnresolvedIndicator() {
  return (
    <Link
      href="/afk"
      aria-label="Manage AFK status"
      className="flex items-center gap-2.5 text-status-error/70 hover:opacity-80 transition-opacity"
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 10, letterSpacing: '0.25em' }}
      >
        AFK · UNRESOLVED
      </span>
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          background: '#FF0066',
          boxShadow: '0 0 6px rgba(255,0,102,0.5)',
        }}
      />
    </Link>
  )
}
