import type { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Community Member',
    plural: 'Community Members',
  },
  admin: {
    useAsTitle: 'username',
    group: 'Users',
    description: 'Discord members who have authenticated via OAuth',
    defaultColumns: ['avatar', 'username', 'status', 'lastLogin'],
  },
  // Member rows hold PII (Discord email, symbolic-role snapshot) and the
  // status field that drives quarantine. The OAuth callback and roleSync
  // both use Local API via `getPayload()` without a `user`, which bypasses
  // access control by default — so locking these down to admin-only does
  // not break the auth flow. Without these locks, the Payload REST mount
  // at /api/payload/members would let anyone read PII or flip status.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Discord Identity
    {
      name: 'discordId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Discord user ID',
      },
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'Discord username',
        components: {
          Cell: '@/components/admin/DiscordAvatarCell#UsernameCell',
        },
      },
    },
    {
      name: 'globalName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Discord display name',
      },
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Discord avatar hash',
        components: {
          Cell: '@/components/admin/DiscordAvatarCell#DiscordAvatarCell',
          Field: '@/components/admin/DiscordAvatarField#DiscordAvatarField',
        },
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        readOnly: true,
        description: 'Discord email (if provided)',
      },
    },

    // Guild Membership
    {
      name: 'guildMember',
      type: 'group',
      admin: {
        description: 'Guild membership information',
      },
      fields: [
        {
          name: 'nickname',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Server nickname',
          },
        },
        {
          name: 'roles',
          type: 'json',
          admin: {
            readOnly: true,
            description: 'Array of raw Discord role snowflake IDs',
          },
        },
        {
          name: 'symbolicRoles',
          type: 'json',
          admin: {
            readOnly: true,
            description:
              'Ashley-resolved symbolic role list (DISCORD_ROLE_*). Drives badges and quarantine. Refreshed on a TTL via getMemberAuth.',
          },
        },
        {
          name: 'rolesSyncedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last successful symbolic-role sync from Ashley.',
          },
        },
        {
          name: 'rolesSyncFailedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description:
              'Last failed sync attempt — drives short retry backoff after Ashley outages.',
          },
        },
        {
          name: 'joinedDiscordAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When they joined the Discord server',
          },
        },
      ],
    },

    // Session Tracking
    {
      name: 'joinedAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'First login to this site',
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'Most recent login',
      },
    },

    // Status (for banning)
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Banned (auto-managed)', value: 'banned' },
        { label: 'Left Server', value: 'left_server' },
      ],
      admin: {
        description:
          'Auto-managed by role sync: DISCORD_ROLE_QUARANTINE → Banned; role removed → Active. Manual edits will be overwritten on the next page load.',
      },
    },
  ],
}
