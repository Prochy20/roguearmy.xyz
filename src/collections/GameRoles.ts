import type { CollectionConfig } from 'payload'
import { publicRead } from '@/access'

type RoleSnapshot = {
  id: string
  name: string
  color: string | null
}

function normalizeRoles(value: unknown): RoleSnapshot[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const out: RoleSnapshot[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const r = entry as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : null
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      name: typeof r.name === 'string' ? r.name : '',
      color: typeof r.color === 'string' ? r.color : null,
    })
  }
  return out
}

export const GameRoles: CollectionConfig = {
  slug: 'game-roles',
  labels: {
    singular: 'Game Role',
    plural: 'Game Roles',
  },
  admin: {
    // displayName is a virtual field resolved on read — see below. We can't
    // useAsTitle: 'game' directly because it's a relationship and Payload
    // renders relationship-typed titles as the raw target id.
    useAsTitle: 'displayName',
    group: 'Taxonomies',
    defaultColumns: ['game', 'roles'],
    description: 'Pair Discord roles with games. Members holding any paired role count as playing that game.',
  },
  access: {
    read: publicRead,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const gameId = typeof data.game === 'object' && data.game !== null
          ? (data.game as { id?: string | number }).id
          : data.game
        if (!gameId) return data

        const existing = await req.payload.find({
          collection: 'game-roles',
          where: {
            and: [
              { game: { equals: gameId } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          req,
          overrideAccess: false,
        })

        if (existing.totalDocs > 0) {
          throw new Error('A GameRoles entry for this game already exists. Edit the existing entry instead.')
        }

        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data && 'roles' in data) {
          data.roles = normalizeRoles(data.roles)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      // Payload-3 virtual-on-relationship: resolves the linked game's `name`
      // automatically on read. We point `useAsTitle` at this so the
      // relationship picker in Settings shows "The Division 2" instead of
      // the raw entry id.
      virtual: 'game.name',
      admin: { hidden: true },
    },
    {
      name: 'game',
      type: 'relationship',
      relationTo: 'games',
      required: true,
      hasMany: false,
      admin: {
        description: 'One GameRoles entry per game.',
      },
    },
    {
      name: 'roles',
      type: 'json',
      required: true,
      defaultValue: [],
      admin: {
        description: 'Discord roles paired with this game. Snapshot of {id, name, color} taken at save.',
        components: {
          Field: '@/components/admin/GameRolesPicker#GameRolesPicker',
          Cell: '@/components/admin/GameRolesCell#GameRolesCell',
        },
      },
    },
  ],
}
