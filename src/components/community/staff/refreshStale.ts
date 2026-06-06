import type { BasePayload } from 'payload'
import { pickBestAvatar, type AvatarBundle } from '@/lib/discord/avatar'
import {
  refreshStaleDiscordCaches,
  flushPendingDiscordWrites,
  type PendingWrite,
} from '@/lib/discord/refreshStale'
import type { StaffProfile as PayloadStaffProfile } from '@/payload-types'

interface StaffCacheData {
  cached_username: string | null
  cached_displayName: string
  cached_avatarUrl: string | null
  cached_joinedAt: string | null
  cached_accountCreatedAt: string | null
  cached_at: string
}

export interface RefreshResult {
  profiles: PayloadStaffProfile[]
  pendingWrites: PendingWrite<StaffCacheData>[]
}

/**
 * Page-time TTL refresh for staff profiles — thin wrapper that supplies the
 * staff-specific field mapping to the generic Discord cache refresher.
 *
 * Fail-open per the grilling decision: on Ashley failure we leave the stored
 * values untouched and serve stale.
 */
export async function refreshStaleStaffCaches(
  profiles: PayloadStaffProfile[],
): Promise<RefreshResult> {
  const cachedAt = new Date().toISOString()
  const { items, pendingWrites } = await refreshStaleDiscordCaches<PayloadStaffProfile, StaffCacheData>(
    profiles,
    {
      getDiscordId: (p) => p.discordId,
      getCachedAt: (p) => p.cached_at,
      buildData: (member) => ({
        cached_username: (member.username ?? null) as string | null,
        cached_displayName: member.displayName,
        cached_avatarUrl: pickBestAvatar(
          member.serverAvatarUrls as AvatarBundle,
          member.avatarUrls as AvatarBundle,
        ),
        cached_joinedAt: member.joinedAt ?? null,
        cached_accountCreatedAt: member.accountCreatedAt ?? null,
        cached_at: cachedAt,
      }),
    },
  )
  return { profiles: items, pendingWrites }
}

/**
 * Persist refreshed staff cache values. Runs via `after()` so the response
 * ships before the writes complete. System-context write (no `req.user`) —
 * `overrideAccess: true` is required so the page-time flush doesn't silently
 * fail against the collection's default update gate.
 */
export async function flushStaffCacheWrites(
  payload: BasePayload,
  pendingWrites: PendingWrite<StaffCacheData>[],
): Promise<void> {
  await flushPendingDiscordWrites(pendingWrites, (id, data) =>
    payload.update({
      collection: 'staff-profiles',
      id,
      data,
      overrideAccess: true,
    }),
  )
}
