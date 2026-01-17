import type { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'username',
    description: 'Discord members who have authenticated via OAuth',
    defaultColumns: ['username', 'discordId', 'status', 'lastLogin'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => Boolean(user), // Only admins can delete
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
            description: 'Array of Discord role IDs',
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
        { label: 'Banned', value: 'banned' },
      ],
      admin: {
        description: 'Set to Banned to revoke access',
      },
    },
  ],
}
