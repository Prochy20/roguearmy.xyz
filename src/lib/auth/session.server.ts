/**
 * Server-side session utilities with React.cache() for request deduplication.
 * Import this in Server Components to avoid redundant auth queries.
 */
import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from './jwt'
import { MEMBER_SESSION_COOKIE, ASHLEY_ACCESS_COOKIE } from './cookies'
import { readMemberSnapshot, syncMemberRoles } from './roleSync'
import {
  hasBoosterDecoration,
  pickPrimaryBadge,
  type PrimaryBadge,
  type SymbolicRole,
} from './badges'
import type { MemberSession } from './types'

// Member status from DB (matches Payload schema)
export type MemberStatus = 'active' | 'banned' | 'left_server'

export interface MemberAuthResult {
  authenticated: boolean
  memberId: string | null
  status: MemberStatus | null
  member: {
    discordId: string
    avatar: string | null
    username: string
    globalName: string | null
  } | null
  /** Symbolic roles (post-sync if a refresh just happened, else last-known). */
  symbolicRoles: SymbolicRole[]
  primaryBadge: PrimaryBadge
  isBooster: boolean
  reason?: 'not_authenticated' | 'banned' | 'left_server' | 'error'
}

const EMPTY_BADGE_FIELDS = {
  symbolicRoles: [] as SymbolicRole[],
  primaryBadge: 'MEMBER' as PrimaryBadge,
  isBooster: false,
}

/**
 * Get full member authentication state with DB verification.
 * Cached per-request via React.cache() - safe to call multiple times.
 *
 * Side-effect: when the symbolic-role snapshot is past its TTL and we have an
 * Ashley access cookie, this triggers a refresh that writes back to the
 * Members row (symbolicRoles, rolesSyncedAt, and possibly status). Fail-open
 * on Ashley outages — last-known snapshot is served unchanged.
 *
 * This is the primary auth function. All other auth helpers derive from this.
 */
export const getMemberAuth = cache(async (): Promise<MemberAuthResult> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) {
    return {
      authenticated: false,
      memberId: null,
      status: null,
      member: null,
      ...EMPTY_BADGE_FIELDS,
      reason: 'not_authenticated',
    }
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return {
      authenticated: false,
      memberId: null,
      status: null,
      member: null,
      ...EMPTY_BADGE_FIELDS,
      reason: 'not_authenticated',
    }
  }

  const payload = await getPayload({ config })

  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member) {
      return {
        authenticated: false,
        memberId: null,
        status: null,
        member: null,
        ...EMPTY_BADGE_FIELDS,
        reason: 'not_authenticated',
      }
    }

    // Refresh symbolic roles from Ashley if the snapshot is stale and we're
    // past the failure backoff. Fail-open: outages leave last-known intact.
    const ashleyAccessToken = cookieStore.get(ASHLEY_ACCESS_COOKIE)?.value
    const snapshot = readMemberSnapshot(member)
    const sync = await syncMemberRoles({
      payload,
      memberId: session.memberId,
      ashleyAccessToken,
      snapshot,
    })

    const symbolicRoles = sync.kind === 'fresh' ? sync.roles : snapshot.symbolicRoles
    // A successful sync may have flipped status (QUARANTINE applied or cleared).
    const effectiveStatus =
      sync.kind === 'fresh' && sync.statusOverride
        ? sync.statusOverride
        : (member.status as MemberStatus)

    const primaryBadge = pickPrimaryBadge(symbolicRoles)
    const isBooster = hasBoosterDecoration(symbolicRoles)

    if (effectiveStatus === 'banned') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status: effectiveStatus,
        member: null,
        symbolicRoles,
        primaryBadge,
        isBooster,
        reason: 'banned',
      }
    }

    if (effectiveStatus === 'left_server') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status: effectiveStatus,
        member: null,
        symbolicRoles,
        primaryBadge,
        isBooster,
        reason: 'left_server',
      }
    }

    if (effectiveStatus !== 'active') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status: effectiveStatus,
        member: null,
        symbolicRoles,
        primaryBadge,
        isBooster,
        reason: 'banned',
      }
    }

    return {
      authenticated: true,
      memberId: session.memberId,
      status: 'active',
      member: {
        discordId: member.discordId,
        avatar: member.avatar ?? null,
        username: member.username,
        globalName: member.globalName ?? null,
      },
      symbolicRoles,
      primaryBadge,
      isBooster,
    }
  } catch {
    return {
      authenticated: false,
      memberId: null,
      status: null,
      member: null,
      ...EMPTY_BADGE_FIELDS,
      reason: 'error',
    }
  }
})

/**
 * Get active member ID only (convenience wrapper).
 * Returns null if not authenticated or not active.
 * Uses cached getMemberAuth() internally.
 */
export async function getActiveMemberId(): Promise<string | null> {
  const auth = await getMemberAuth()
  return auth.authenticated ? auth.memberId : null
}

/**
 * JWT-only member ID check (no DB verification).
 * Faster but doesn't verify member status - use when status check isn't critical.
 * Cached per-request.
 */
export const getOptionalMemberId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
})

/**
 * Get the raw JWT session without DB verification.
 * Useful when you need JWT claims but don't need to verify member status.
 * Cached per-request.
 */
export const getJwtSession = cache(async (): Promise<MemberSession | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  return verifyMemberToken(token)
})
