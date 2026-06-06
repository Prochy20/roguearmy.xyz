import type { BasePayload } from 'payload'
import { pickBestAvatar, type AvatarBundle } from '@/lib/discord/avatar'
import {
  refreshStaleDiscordCaches,
  flushPendingDiscordWrites,
  type PendingWrite,
} from '@/lib/discord/refreshStale'
import type { Division2Clan } from '@/payload-types'

interface ClanLeaderCacheData {
  cached_leaderUsername: string | null
  cached_leaderDisplayName: string | null
  cached_leaderAvatarUrl: string | null
  cached_leaderAt: string
}

export interface RefreshResult {
  clans: Division2Clan[]
  pendingWrites: PendingWrite<ClanLeaderCacheData>[]
}

/**
 * Page-time TTL refresh for clan leader caches — thin wrapper that supplies
 * the clan-specific field mapping (cached_leader*) to the generic refresher.
 *
 * Clans without a `leaderDiscordId` are skipped (nothing to refresh). Same
 * fail-open policy as the staff variant.
 */
export async function refreshStaleClanLeaderCaches(
  clans: Division2Clan[],
): Promise<RefreshResult> {
  const cachedAt = new Date().toISOString()
  const { items, pendingWrites } = await refreshStaleDiscordCaches<Division2Clan, ClanLeaderCacheData>(
    clans,
    {
      getDiscordId: (c) => c.leaderDiscordId,
      getCachedAt: (c) => c.cached_leaderAt,
      buildData: (member) => ({
        cached_leaderUsername: (member.username ?? null) as string | null,
        cached_leaderDisplayName: member.displayName,
        cached_leaderAvatarUrl: pickBestAvatar(
          member.serverAvatarUrls as AvatarBundle,
          member.avatarUrls as AvatarBundle,
        ),
        cached_leaderAt: cachedAt,
      }),
    },
  )
  return { clans: items, pendingWrites }
}

export async function flushClanLeaderWrites(
  payload: BasePayload,
  pendingWrites: PendingWrite<ClanLeaderCacheData>[],
): Promise<void> {
  await flushPendingDiscordWrites(pendingWrites, (id, data) =>
    // System-context write (no req.user) — overrideAccess: true documents
    // that we're intentionally writing outside the field-level read gates
    // on the cached_leader* fields.
    payload.update({
      collection: 'division2-clans',
      id,
      data,
      overrideAccess: true,
    }),
  )
}
