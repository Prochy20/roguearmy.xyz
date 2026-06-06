'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchAshleyService } from '@/lib/api/server'

export type SyncResult =
  | {
      ok: true
      data: { created: number; updated: number; deleted: number; lastSyncedAt: string }
    }
  | { ok: false; error: { code: string; message?: string } }

export async function syncDiscordRoles(): Promise<SyncResult> {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return { ok: false, error: { code: 'unauthenticated' } }

  if (user.collection === 'users' && user.role !== 'admin') {
    return { ok: false, error: { code: 'forbidden' } }
  }

  const live = await fetchAshleyService((c) => c.GET('/api/community/roles'))
  if (!live.ok) {
    return { ok: false, error: { code: live.error.code, message: live.error.message } }
  }

  const existing = await payload.find({ collection: 'discord-roles', limit: 1000 })

  // Refuse to wipe the collection on a single empty response — guards against
  // upstream blips (wrong guild ID, transient permission failure) silently
  // dropping curated metadata.
  if (live.data.length === 0 && existing.totalDocs > 0) {
    return {
      ok: false,
      error: {
        code: 'empty_response',
        message:
          'Live Discord roles response was empty but the collection has docs. Refusing to wipe — check Ashley.',
      },
    }
  }

  const liveById = new Map(live.data.map((r) => [r.id, r]))
  const existingById = new Map(existing.docs.map((d) => [d.discordId, d]))

  let created = 0
  let updated = 0
  let deleted = 0
  const lastSyncedAt = new Date().toISOString()

  // Only sync-managed fields go into the write payload — `isPrimary`,
  // `badgeLabel`, `accentOverride` are admin-curated and must survive sync.
  for (const role of live.data) {
    const syncFields = {
      discordId: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      mentionable: role.mentionable,
      managed: role.managed,
      iconUrls: role.iconUrls,
      unicodeEmoji: role.unicodeEmoji,
      lastSyncedAt,
    }
    const cmsDoc = existingById.get(role.id)
    if (cmsDoc) {
      await payload.update({
        collection: 'discord-roles',
        id: cmsDoc.id,
        data: syncFields,
      })
      updated++
    } else {
      await payload.create({
        collection: 'discord-roles',
        data: syncFields,
      })
      created++
    }
  }

  for (const cmsDoc of existing.docs) {
    if (!liveById.has(cmsDoc.discordId)) {
      await payload.delete({ collection: 'discord-roles', id: cmsDoc.id })
      deleted++
    }
  }

  revalidatePath('/admin/collections/discord-roles')

  return { ok: true, data: { created, updated, deleted, lastSyncedAt } }
}
