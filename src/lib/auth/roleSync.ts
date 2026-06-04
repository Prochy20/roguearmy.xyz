import 'server-only'

import { after } from 'next/server'
import type { Payload } from 'payload'
import { createAshleyUserClient } from '@/lib/api/ashley-factories'
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

// Per-instance result cache. Bridges the window between Ashley returning
// and the deferred after() write landing in Mongo. Without it, concurrent
// requests each see a stale DB timestamp, schedule their own
// payload.update() on the same Members doc, and race in Mongo's transaction
// layer — producing WriteConflict (code 112) errors.
interface CachedSync {
  at: number
  roles: SymbolicRole[]
  statusOverride: 'banned' | 'active' | null
}
const recentSyncs = new Map<string, CachedSync>()
const recentFailures = new Map<string, number>()

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
  adminBanned: boolean
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
  adminBanned?: boolean | null
}): MemberSyncSnapshot {
  return {
    symbolicRoles: normalizeSymbolicRoles(member.guildMember?.symbolicRoles),
    rolesSyncedAt: parseDateMs(member.guildMember?.rolesSyncedAt),
    rolesSyncFailedAt: parseDateMs(member.guildMember?.rolesSyncFailedAt),
    status: member.status ?? 'active',
    adminBanned: Boolean(member.adminBanned),
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

// In-flight role-sync promises keyed by memberId. Collapses concurrent
// requests for the same member into a single Ashley round-trip — without
// this, N parallel hits all pass shouldAttemptSync (the DB timestamp is
// still stale until after() flushes) and stampede Ashley.
//
// Module-level state is intentional: it's the deduplication scope we want.
// In a multi-instance runtime each instance has its own map; per-instance
// dedup is strictly better than none.
const inflightSyncs = new Map<string, Promise<RoleSyncOutcome>>()

interface SyncMemberRolesArgs {
  payload: Payload
  memberId: string
  ashleyAccessToken: string | undefined
  snapshot: MemberSyncSnapshot
}

/**
 * Refresh a member's symbolic roles from Ashley if the snapshot is stale and
 * we're past the failure backoff window. Persists the new snapshot and any
 * status flip (QUARANTINE → banned, or auto-restore banned → active when the
 * quarantine role is gone).
 *
 * Fail-open by design: when Ashley is down or returns no access cookie, the
 * existing snapshot is returned untouched and the caller carries on.
 *
 * Concurrent calls for the same memberId share a single in-flight promise.
 */
export function syncMemberRoles(args: SyncMemberRolesArgs): Promise<RoleSyncOutcome> {
  const now = Date.now()

  // Fast path: per-instance cache. Matches the DB-TTL gate exactly, so it
  // tracks DB state once the after()-deferred write lands and short-circuits
  // every request that arrives between Ashley resolving and the DB flush.
  const cached = recentSyncs.get(args.memberId)
  if (cached && now - cached.at < SUCCESS_TTL_MS) {
    return Promise.resolve({
      kind: 'fresh',
      roles: cached.roles,
      statusOverride: cached.statusOverride,
    })
  }
  const failedAt = recentFailures.get(args.memberId)
  if (failedAt && now - failedAt < FAILURE_BACKOFF_MS) {
    return Promise.resolve({ kind: 'stale', roles: args.snapshot.symbolicRoles })
  }

  // Same-tick race dedup — collapses calls that arrive while Ashley is in
  // flight, before recentSyncs is populated by the resolving promise.
  const existing = inflightSyncs.get(args.memberId)
  if (existing) return existing

  const promise = syncMemberRolesUncached(args).finally(() => {
    inflightSyncs.delete(args.memberId)
  })
  inflightSyncs.set(args.memberId, promise)
  return promise
}

async function syncMemberRolesUncached(args: SyncMemberRolesArgs): Promise<RoleSyncOutcome> {
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
    // Mirror the after()-deferred timestamp in memory so the next request
    // in the FAILURE_BACKOFF_MS window short-circuits without racing Mongo.
    recentFailures.set(memberId, Date.now())
    // Record the failure so the next read knows we're in backoff. Defer via
    // after() so the auth result returns without waiting on the write — the
    // backoff timestamp is purely for the *next* request anyway.
    after(() =>
      payload
        .update({
          collection: 'members',
          id: memberId,
          data: { guildMember: { rolesSyncFailedAt: new Date().toISOString() } },
        })
        .catch((err) => {
          // Benign race at multi-worker boundaries — another worker wrote the
          // same timestamp; doc state is correct either way.
          if (err?.code === 112 || err?.codeName === 'WriteConflict') return
          // Non-fatal for this request, but persistent failures here mean we'll
          // retry Ashley on every page load (no backoff persisted) — surface it.
          console.warn('Role sync: failed to record sync-failure timestamp', err)
        }),
    )
    return { kind: 'failed' }
  }

  const statusOverride = computeStatusOverride(fetched, snapshot.status, snapshot.adminBanned)
  const now = new Date().toISOString()

  // Mirror the after()-deferred snapshot in memory so concurrent requests in
  // the SUCCESS_TTL_MS window resolve from cache instead of racing into
  // their own Ashley call + payload.update().
  recentSyncs.set(memberId, {
    at: Date.now(),
    roles: fetched,
    statusOverride,
  })
  recentFailures.delete(memberId)

  // Defer the writeback so it doesn't block the response. The current request
  // already serves the freshly-fetched roles + status from memory (below); the
  // DB write is purely to advance the TTL gate for *future* requests.
  after(() =>
    payload
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
        // Benign race at multi-worker boundaries — another worker wrote the
        // same Ashley result; doc state is correct either way.
        if (err?.code === 112 || err?.codeName === 'WriteConflict') return
        // Non-fatal for this request — in-memory result is authoritative — but
        // a persistent write failure means TTL never advances and we'll re-call
        // Ashley on every request. Surface it.
        console.warn('Role sync: failed to persist refreshed snapshot', err)
      }),
  )

  return { kind: 'fresh', roles: fetched, statusOverride }
}

/**
 * Recompute status from a fresh role snapshot.
 *
 * Per the design call: Discord is the source of truth for moderation state,
 * but admins can also impose a hard ban via the `adminBanned` flag which
 * wins over Discord state.
 *  - adminBanned=true → status flips to 'banned' (admin override)
 *  - QUARANTINE present → status flips to 'banned'
 *  - QUARANTINE absent and not adminBanned → if currently 'banned', auto-restore to 'active'
 *  - 'left_server' is owned by the OAuth callback (guild membership check) and
 *    must not be overwritten by role-sync.
 */
function computeStatusOverride(
  roles: readonly SymbolicRole[],
  currentStatus: string,
  adminBanned: boolean,
): 'banned' | 'active' | null {
  if (currentStatus === 'left_server') return null
  if (adminBanned) return currentStatus === 'banned' ? null : 'banned'
  if (isQuarantined(roles)) return currentStatus === 'banned' ? null : 'banned'
  if (currentStatus === 'banned') return 'active'
  return null
}
