import 'server-only'
import { fetchAshleyService } from '@/lib/api/server'

/**
 * Discord cache sync primitives — shared between collection hooks (single-id
 * refresh on save) and page-time stale checks (batch refresh on render).
 *
 * Both flows hit the same Ashley endpoint (`/api/community/members/lookup`)
 * with one or more Discord IDs. The per-collection cached_* field mapping is
 * supplied by the caller as an `applyMember` callback so this module stays
 * generic over staff profiles, clan leaders, and any future Discord-backed
 * row that wants the same TTL caching shape.
 */

export type AshleyMember = {
  discordId: string
  username?: string | null
  displayName: string
  serverAvatarUrls?: unknown
  avatarUrls?: unknown
  joinedAt?: string | null
  accountCreatedAt?: string | null
}

export type RefreshOutcome =
  | { kind: 'ok' }
  | { kind: 'ashley_down' }
  | { kind: 'member_not_found' }

/**
 * Batch lookup against Ashley's member-lookup endpoint.
 *
 * Returns:
 *   - `[]` when `ids` is empty (no roundtrip)
 *   - `null` when Ashley is unreachable / errored — distinguishable from
 *     "every id missing" so callers can apply fail-open semantics
 *   - the member array on success (may be shorter than `ids` if some are
 *     unknown to Ashley)
 */
export async function lookupAshleyMembers(
  ids: string[],
): Promise<AshleyMember[] | null> {
  if (ids.length === 0) return []
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids: ids.join(',') } },
    }),
  )
  if (!result.ok || !result.data) return null
  return result.data as unknown as AshleyMember[]
}

/**
 * Single-id refresh used by `beforeChange` hooks. Looks up the member, then
 * mutates `data` via the caller-supplied field mapping.
 *
 * The discriminated outcome lets the hook decide whether to fail the save
 * (new row / changed id — we cannot persist mismatched cached_* fields) or
 * warn-and-continue (same id, manual re-save — the lazy TTL retries later).
 */
export async function refreshDiscordCacheFields<T>(
  data: T,
  discordId: string,
  applyMember: (target: T, member: AshleyMember) => void,
): Promise<RefreshOutcome> {
  const members = await lookupAshleyMembers([discordId])
  if (members === null) return { kind: 'ashley_down' }
  const member = members[0]
  if (!member) return { kind: 'member_not_found' }
  applyMember(data, member)
  return { kind: 'ok' }
}
