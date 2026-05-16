import type { BasePayload } from 'payload'
import { fetchAshleyService } from '@/lib/api/server'
import type { StaffProfile as PayloadStaffProfile } from '@/payload-types'

const TTL_MS = 24 * 60 * 60 * 1000

type AvatarBundle = { 64: string; 128: string; 256: string; 512: string } | null | undefined

function pickBestAvatar(server: AvatarBundle, global: AvatarBundle): string | null {
  return server?.[512] ?? global?.[512] ?? null
}

/**
 * Walk the profile list, find rows whose Discord cache is older than the
 * TTL (or missing entirely), and refresh them inline from Ashley before the
 * page renders. Uses /api/community/members/lookup so we get the rich DTO
 * (username, displayName, avatarUrls, serverAvatarUrls) in a single batched
 * call. Writes new values back into Payload so the next render skips the
 * refresh. Fail-open per the grilling decision: on Ashley failure we leave
 * the stored values untouched and serve stale.
 */
export async function refreshStaleStaffCaches(
  payload: BasePayload,
  profiles: PayloadStaffProfile[],
): Promise<PayloadStaffProfile[]> {
  const now = Date.now()
  const staleIndexes: number[] = []
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i]!
    const ms = p.cached_at ? Date.parse(p.cached_at) : NaN
    const isStale = isNaN(ms) || now - ms > TTL_MS
    if (isStale) staleIndexes.push(i)
  }

  if (staleIndexes.length === 0) return profiles

  const ids = staleIndexes.map((i) => profiles[i]!.discordId).join(',')
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids } },
    }),
  )

  if (!result.ok || !result.data) return profiles

  const byId = new Map(result.data.map((m) => [m.discordId, m]))
  const cachedAt = new Date().toISOString()

  await Promise.all(
    staleIndexes.map(async (i) => {
      const p = profiles[i]!
      const member = byId.get(p.discordId)
      if (!member) return

      const username = (member.username ?? null) as string | null
      const displayName = member.displayName
      const avatarUrl = pickBestAvatar(
        member.serverAvatarUrls as AvatarBundle,
        member.avatarUrls as AvatarBundle,
      )
      const joinedAt = member.joinedAt ?? null
      const accountCreatedAt = member.accountCreatedAt ?? null

      profiles[i] = {
        ...p,
        cached_username: username,
        cached_displayName: displayName,
        cached_avatarUrl: avatarUrl,
        cached_joinedAt: joinedAt,
        cached_accountCreatedAt: accountCreatedAt,
        cached_at: cachedAt,
      }

      try {
        await payload.update({
          collection: 'staff-profiles',
          id: p.id,
          data: {
            cached_username: username,
            cached_displayName: displayName,
            cached_avatarUrl: avatarUrl,
            cached_joinedAt: joinedAt,
            cached_accountCreatedAt: accountCreatedAt,
            cached_at: cachedAt,
          },
        })
      } catch {
        // Write-back failure is non-fatal — fresh data is already in memory
        // for this render. The next render will retry since cached_at on
        // disk is still stale.
      }
    }),
  )

  return profiles
}
