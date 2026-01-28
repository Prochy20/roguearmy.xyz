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
import { MEMBER_SESSION_COOKIE } from './cookies'
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
  reason?: 'not_authenticated' | 'banned' | 'left_server' | 'error'
}

/**
 * Get full member authentication state with DB verification.
 * Cached per-request via React.cache() - safe to call multiple times.
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
        reason: 'not_authenticated',
      }
    }

    const status = member.status as MemberStatus

    if (status === 'banned') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status,
        member: null,
        reason: 'banned',
      }
    }

    if (status === 'left_server') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status,
        member: null,
        reason: 'left_server',
      }
    }

    if (status !== 'active') {
      return {
        authenticated: false,
        memberId: session.memberId,
        status,
        member: null,
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
    }
  } catch {
    return {
      authenticated: false,
      memberId: null,
      status: null,
      member: null,
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
