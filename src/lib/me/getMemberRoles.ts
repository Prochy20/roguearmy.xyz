import 'server-only'

import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { DiscordRole } from '@/payload-types'

// Wrapped in cache() so multiple components reading the member's roles
// within the same request share a single Mongo round-trip.
export const getMemberRoles = cache(
  async (memberRoleIds: readonly string[]): Promise<DiscordRole[]> => {
    if (memberRoleIds.length === 0) return []
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'discord-roles',
      where: { discordId: { in: [...memberRoleIds] } },
      sort: '-position',
      limit: 200,
    })
    return res.docs
  },
)
