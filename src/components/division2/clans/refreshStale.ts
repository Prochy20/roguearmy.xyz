import type { BasePayload } from 'payload'
import { fetchAshleyService } from '@/lib/api/server'
import { pickBestAvatar, type AvatarBundle } from '@/lib/discord/avatar'
import type { Division2Clan } from '@/payload-types'

const TTL_MS = 24 * 60 * 60 * 1000

interface PendingWrite {
  id: string
  data: {
    cached_leaderUsername: string | null
    cached_leaderDisplayName: string | null
    cached_leaderAvatarUrl: string | null
    cached_leaderAt: string
  }
}

export interface RefreshResult {
  clans: Division2Clan[]
  pendingWrites: PendingWrite[]
}

/**
 * Walk the clan list, find rows whose leader cache is stale (or missing),
 * refresh them from Ashley, and return the mutated clans + a list of
 * pending Payload writes (executed via after() so they don't block).
 *
 * Symmetric with refreshStaleStaffCaches — same fail-open policy: on Ashley
 * failure we leave the stored values untouched and serve stale. Clans with
 * no leaderDiscordId are skipped (nothing to refresh).
 */
export async function refreshStaleClanLeaderCaches(
  clans: Division2Clan[],
): Promise<RefreshResult> {
  const now = Date.now()
  const staleIndexes: number[] = []
  for (let i = 0; i < clans.length; i++) {
    const c = clans[i]!
    if (!c.leaderDiscordId) continue
    const ms = c.cached_leaderAt ? Date.parse(c.cached_leaderAt) : NaN
    const isStale = Number.isNaN(ms) || now - ms > TTL_MS
    if (isStale) staleIndexes.push(i)
  }

  if (staleIndexes.length === 0) return { clans, pendingWrites: [] }

  const ids = staleIndexes.map((i) => clans[i]!.leaderDiscordId!).join(',')
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids } },
    }),
  )

  if (!result.ok || !result.data) return { clans, pendingWrites: [] }

  const byId = new Map(result.data.map((m) => [m.discordId, m]))
  const cachedAt = new Date().toISOString()
  const pendingWrites: PendingWrite[] = []

  // Build a fresh array rather than mutating the caller's input. The page
  // currently passes ownership through, but functional purity here makes the
  // helper safe to reuse in contexts where the input gets reused (e.g. a
  // future "render once, refresh in background" path).
  const next = clans.slice()
  for (const i of staleIndexes) {
    const c = clans[i]!
    const member = byId.get(c.leaderDiscordId!)
    if (!member) continue

    const data = {
      cached_leaderUsername: (member.username ?? null) as string | null,
      cached_leaderDisplayName: member.displayName,
      cached_leaderAvatarUrl: pickBestAvatar(
        member.serverAvatarUrls as AvatarBundle,
        member.avatarUrls as AvatarBundle,
      ),
      cached_leaderAt: cachedAt,
    }

    next[i] = { ...c, ...data }
    pendingWrites.push({ id: c.id, data })
  }

  return { clans: next, pendingWrites }
}

export async function flushClanLeaderWrites(
  payload: BasePayload,
  pendingWrites: PendingWrite[],
): Promise<void> {
  if (pendingWrites.length === 0) return
  await Promise.all(
    pendingWrites.map(async ({ id, data }) => {
      try {
        // Fired after the response from a system context (Ashley cache
        // refresh) — no `req.user`, no transaction. Explicit
        // `overrideAccess: true` documents that we're intentionally writing
        // outside the field-level read gates set on the cached_leader* fields.
        await payload.update({
          collection: 'division2-clans',
          id,
          data,
          overrideAccess: true,
        })
      } catch {
        // Non-fatal — next render retries.
      }
    }),
  )
}
