import 'server-only'

import type { Payload } from 'payload'
import { createAshleyUserClient } from '@/lib/api/client'
import {
  isQuarantined,
  normalizeSymbolicRoles,
  type SymbolicRole,
} from './badges'

// Tunables. Asymmetric on purpose: a successful sync stays cached for 5 min
// (good enough for community moderation latency), but a failed sync is
// retried after 60s so the system self-heals quickly once Ashley recovers.
const SUCCESS_TTL_MS = 5 * 60 * 1000
const FAILURE_BACKOFF_MS = 60 * 1000

export type RoleSyncOutcome =
  | { kind: 'fresh'; roles: SymbolicRole[]; statusOverride: 'banned' | 'active' | null }
  | { kind: 'stale'; roles: SymbolicRole[] } // skipped — backoff or recently-synced
  | { kind: 'unauthenticated' } // no Ashley access cookie
  | { kind: 'failed' } // tried, Ashley rejected/unreachable

interface MemberSyncSnapshot {
  symbolicRoles: SymbolicRole[]
  rolesSyncedAt: number | null
  rolesSyncFailedAt: number | null
  status: 'active' | 'banned' | 'left_server' | string
}

export function readMemberSnapshot(member: {
  guildMember?:
    | {
        symbolicRoles?: unknown
        rolesSyncedAt?: string | null
        rolesSyncFailedAt?: string | null
      }
    | null
  status?: string | null
}): MemberSyncSnapshot {
  return {
    symbolicRoles: normalizeSymbolicRoles(member.guildMember?.symbolicRoles),
    rolesSyncedAt: parseDateMs(member.guildMember?.rolesSyncedAt),
    rolesSyncFailedAt: parseDateMs(member.guildMember?.rolesSyncFailedAt),
    status: member.status ?? 'active',
  }
}

function parseDateMs(value: string | null | undefined): number | null {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : null
}

function shouldAttemptSync(snap: MemberSyncSnapshot): boolean {
  const now = Date.now()
  if (snap.rolesSyncedAt && now - snap.rolesSyncedAt < SUCCESS_TTL_MS) return false
  if (snap.rolesSyncFailedAt && now - snap.rolesSyncFailedAt < FAILURE_BACKOFF_MS) return false
  return true
}

/**
 * Refresh a member's symbolic roles from Ashley if the snapshot is stale and
 * we're past the failure backoff window. Persists the new snapshot and any
 * status flip (QUARANTINE → banned, or auto-restore banned → active when the
 * quarantine role is gone).
 *
 * Fail-open by design: when Ashley is down or returns no access cookie, the
 * existing snapshot is returned untouched and the caller carries on.
 */
export async function syncMemberRoles(args: {
  payload: Payload
  memberId: string
  ashleyAccessToken: string | undefined
  snapshot: MemberSyncSnapshot
}): Promise<RoleSyncOutcome> {
  const { payload, memberId, ashleyAccessToken, snapshot } = args

  if (!shouldAttemptSync(snapshot)) {
    return { kind: 'stale', roles: snapshot.symbolicRoles }
  }

  if (!ashleyAccessToken) {
    return { kind: 'unauthenticated' }
  }

  let fetched: SymbolicRole[] | null = null
  try {
    const client = createAshleyUserClient(ashleyAccessToken)
    const { data, response } = await client.GET('/api/auth/me')
    if (data?.user?.roles) {
      fetched = normalizeSymbolicRoles(data.user.roles)
    } else if (response && response.status >= 400) {
      fetched = null
    }
  } catch {
    fetched = null
  }

  if (fetched === null) {
    // Record the failure so the next read knows we're in backoff. Don't
    // touch symbolicRoles or status — last-known-good wins during outages.
    await payload
      .update({
        collection: 'members',
        id: memberId,
        data: { guildMember: { rolesSyncFailedAt: new Date().toISOString() } },
      })
      .catch((err) => {
        // Non-fatal for this request, but persistent failures here mean we'll
        // retry Ashley on every page load (no backoff persisted) — surface it.
        console.warn('Role sync: failed to record sync-failure timestamp', err)
      })
    return { kind: 'failed' }
  }

  const statusOverride = computeStatusOverride(fetched, snapshot.status)
  const now = new Date().toISOString()

  await payload
    .update({
      collection: 'members',
      id: memberId,
      data: {
        guildMember: {
          symbolicRoles: fetched,
          rolesSyncedAt: now,
          rolesSyncFailedAt: null,
        },
        ...(statusOverride && statusOverride !== snapshot.status
          ? { status: statusOverride }
          : {}),
      },
    })
    .catch((err) => {
      // Non-fatal for this request — in-memory result is authoritative — but
      // a persistent write failure means TTL never advances and we'll re-call
      // Ashley on every request. Surface it.
      console.warn('Role sync: failed to persist refreshed snapshot', err)
    })

  return { kind: 'fresh', roles: fetched, statusOverride }
}

/**
 * Recompute status from a fresh role snapshot.
 *
 * Per the design call: Discord is the source of truth for moderation state.
 *  - QUARANTINE present → status flips to 'banned'
 *  - QUARANTINE absent  → if currently 'banned', auto-restore to 'active'
 *  - 'left_server' is owned by the OAuth callback (guild membership check) and
 *    must not be overwritten by role-sync.
 *
 * Manual admin bans set via the Payload panel will be cleared here when the
 * user has no QUARANTINE role — accepted tradeoff documented in the auth design.
 */
function computeStatusOverride(
  roles: readonly SymbolicRole[],
  currentStatus: string,
): 'banned' | 'active' | null {
  if (currentStatus === 'left_server') return null
  if (isQuarantined(roles)) return currentStatus === 'banned' ? null : 'banned'
  if (currentStatus === 'banned') return 'active'
  return null
}
