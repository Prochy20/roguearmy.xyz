import type { GlobalConfig } from 'payload'

/**
 * Singleton Settings global. Currently holds the role-gate relationship that
 * controls who can reach `/division-2`. Tabs are scaffolded so future settings
 * (feature flags, integration toggles) can slot in without restructuring.
 *
 * Pick a `game-roles` entry under "Role Gates" → its Discord-role snapshot is
 * what `checkRoleGate('division2Role')` intersects against `member.guildMember.roles`.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: {
    group: 'Config',
    description:
      'Site-wide configuration. Role Gates wire game-roles to access-controlled features.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'roleGates',
          label: 'Role Gates',
          fields: [
            {
              name: 'division2Role',
              type: 'relationship',
              relationTo: 'game-roles',
              hasMany: false,
              admin: {
                description:
                  'Game-roles entry whose Discord roles grant access to /division-2. Clearing this disables the section for everyone.',
              },
            },
          ],
        },
        {
          name: 'features',
          label: 'Features',
          fields: [],
        },
        {
          name: 'integrations',
          label: 'Integrations',
          fields: [],
        },
      ],
    },
  ],
}
