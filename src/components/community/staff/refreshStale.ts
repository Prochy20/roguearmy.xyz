import type { BasePayload } from 'payload'
import { fetchAshleyService } from '@/lib/api/server'
import { pickBestAvatar, type AvatarBundle } from '@/lib/discord/avatar'
import type { StaffProfile as PayloadStaffProfile } from '@/payload-types'

const TTL_MS = 24 * 60 * 60 * 1000

interface PendingWrite {
  id: string
  data: {
    cached_username: string | null
    cached_displayName: string
    cached_avatarUrl: string | null
    cached_joinedAt: string | null
    cached_accountCreatedAt: string | null
    cached_at: string
  }
}

export interface RefreshResult {
  profiles: PayloadStaffProfile[]
  pendingWrites: PendingWrite[]
}

/**
 * Walk the profile list, find rows whose Discord cache is older than the TTL
 * (or missing entirely), refresh them from Ashley, and return the mutated
 * profiles together with a list of pending Payload writes.
 *
 * Writes are NOT executed here — the caller flushes them via `after()` so
 * the response ships before DB writes complete. Fail-open per the grilling
 * decision: on Ashley failure we leave the stored values untouched and
 * serve stale.
 */
export async function refreshStaleStaffCaches(
  profiles: PayloadStaffProfile[],
): Promise<RefreshResult> {
  const now = Date.now()
  const staleIndexes: number[] = []
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i]!
    const ms = p.cached_at ? Date.parse(p.cached_at) : NaN
    const isStale = isNaN(ms) || now - ms > TTL_MS
    if (isStale) staleIndexes.push(i)
  }

  if (staleIndexes.length === 0) return { profiles, pendingWrites: [] }

  const ids = staleIndexes.map((i) => profiles[i]!.discordId).join(',')
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids } },
    }),
  )

  if (!result.ok || !result.data) return { profiles, pendingWrites: [] }

  const byId = new Map(result.data.map((m) => [m.discordId, m]))
  const cachedAt = new Date().toISOString()
  const pendingWrites: PendingWrite[] = []

  for (const i of staleIndexes) {
    const p = profiles[i]!
    const member = byId.get(p.discordId)
    if (!member) continue

    const username = (member.username ?? null) as string | null
    const displayName = member.displayName
    const avatarUrl = pickBestAvatar(
      member.serverAvatarUrls as AvatarBundle,
      member.avatarUrls as AvatarBundle,
    )
    const joinedAt = member.joinedAt ?? null
    const accountCreatedAt = member.accountCreatedAt ?? null

    const data = {
      cached_username: username,
      cached_displayName: displayName,
      cached_avatarUrl: avatarUrl,
      cached_joinedAt: joinedAt,
      cached_accountCreatedAt: accountCreatedAt,
      cached_at: cachedAt,
    }

    profiles[i] = { ...p, ...data }
    pendingWrites.push({ id: p.id, data })
  }

  return { profiles, pendingWrites }
}

/**
 * Persist the refreshed cache values back to Payload. Designed to be run via
 * `after()` so it doesn't delay the response. Write failures are swallowed —
 * the next render will retry since cached_at on disk is still stale.
 */
export async function flushStaffCacheWrites(
  payload: BasePayload,
  pendingWrites: PendingWrite[],
): Promise<void> {
  if (pendingWrites.length === 0) return
  await Promise.all(
    pendingWrites.map(async ({ id, data }) => {
      try {
        await payload.update({ collection: 'staff-profiles', id, data })
      } catch {
        // Non-fatal; see function doc.
      }
    }),
  )
}
