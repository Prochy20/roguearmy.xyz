import 'server-only'
import { lookupAshleyMembers, type AshleyMember } from './syncCache'

/**
 * Page-time TTL refresh for any list of rows backed by a Discord ID.
 *
 * The two consumers (community staff page, division-2 clans page) share the
 * same shape: walk the list, identify stale rows by `cached_at` vs TTL, batch
 * one Ashley lookup, mutate a fresh array, return the result + pendingWrites
 * for the caller to flush via `after()`.
 *
 * Per-collection differences (which field holds the discordId, which fields
 * carry the cached snapshot) are supplied via `accessors`. The flusher takes
 * a write callback so each caller keeps its `payload.update` typed against
 * its own collection slug — no string-typed collection slug needs to leak
 * through the generic.
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

export interface PendingWrite<TData> {
  id: string
  data: TData
}

export interface DiscordCacheAccessors<TItem, TData> {
  /** Return the Discord ID for this item, or null/undefined to skip. */
  getDiscordId(item: TItem): string | null | undefined
  /** Return the cached_*_at timestamp string, or null/undefined if never cached. */
  getCachedAt(item: TItem): string | null | undefined
  /** Build the cached_* field map from a fresh Ashley member DTO. */
  buildData(member: AshleyMember): TData
}

export interface RefreshStaleOptions {
  /** Override the default 24h TTL. */
  ttlMs?: number
}

export interface RefreshStaleResult<TItem, TData> {
  /** New array (input slice — caller's array is untouched). */
  items: TItem[]
  pendingWrites: PendingWrite<TData>[]
}

export async function refreshStaleDiscordCaches<
  TItem extends { id: string },
  TData,
>(
  items: TItem[],
  accessors: DiscordCacheAccessors<TItem, TData>,
  options: RefreshStaleOptions = {},
): Promise<RefreshStaleResult<TItem, TData>> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
  const now = Date.now()

  const staleIndexes: number[] = []
  for (let i = 0; i < items.length; i++) {
    const discordId = accessors.getDiscordId(items[i]!)
    if (!discordId) continue
    const cachedAtStr = accessors.getCachedAt(items[i]!)
    const ms = cachedAtStr ? Date.parse(cachedAtStr) : NaN
    const isStale = Number.isNaN(ms) || now - ms > ttlMs
    if (isStale) staleIndexes.push(i)
  }

  if (staleIndexes.length === 0) return { items, pendingWrites: [] }

  const ids = staleIndexes
    .map((i) => accessors.getDiscordId(items[i]!)!)
    .filter((id): id is string => Boolean(id))

  const members = await lookupAshleyMembers(ids)
  if (members === null) return { items, pendingWrites: [] } // fail-open

  const byId = new Map(members.map((m) => [m.discordId, m]))
  const next = items.slice()
  const pendingWrites: PendingWrite<TData>[] = []

  for (const i of staleIndexes) {
    const discordId = accessors.getDiscordId(items[i]!)
    if (!discordId) continue
    const member = byId.get(discordId)
    if (!member) continue
    const data = accessors.buildData(member)
    next[i] = { ...items[i]!, ...data }
    pendingWrites.push({ id: items[i]!.id, data })
  }

  return { items: next, pendingWrites }
}

/**
 * Flush pending writes via a caller-supplied `writeOne` callback. The
 * callback is the typed `payload.update({ collection: 'foo', ... })` call —
 * keeping the typed surface at the call site rather than threading a string
 * collection slug through this generic.
 *
 * Writes are concurrent; failures are swallowed (the next render retries on
 * still-stale `cached_at`).
 */
export async function flushPendingDiscordWrites<TData>(
  pendingWrites: PendingWrite<TData>[],
  writeOne: (id: string, data: TData) => Promise<unknown>,
): Promise<void> {
  if (pendingWrites.length === 0) return
  await Promise.all(
    pendingWrites.map(async ({ id, data }) => {
      try {
        await writeOne(id, data)
      } catch {
        // Non-fatal; see function doc.
      }
    }),
  )
}
