import type { CollectionConfig } from 'payload'

/**
 * Staff profiles for the /community/staff manifest. Each row pairs an editorial
 * layer (role title, bio, visibility, order) with synced Discord identity data
 * (display name, avatar URL, last cache timestamp) that a future Ashley TTL
 * refresh will keep current. Editors can pick any Discord member — there's no
 * role validation, the page is curated by hand.
 */
export const StaffProfiles: CollectionConfig = {
  slug: 'staff-profiles',
  labels: {
    singular: 'Staff Profile',
    plural: 'Staff Profiles',
  },
  admin: {
    useAsTitle: 'cached_displayName',
    group: 'Content',
    description: 'Operatives shown on /community/staff. Order ascending.',
    defaultColumns: ['order', 'cached_displayName', 'roleTitle', 'isPublic'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'discordId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Discord snowflake ID for this operative. Used to render the DM link and (once Ashley sync is wired) populate the cached display name + avatar.',
      },
    },
    {
      name: 'roleTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable title shown under the operative name (e.g. "Community Lead").',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Optional dossier text. Line-clamped to three lines on the card; click-through reveals the full bio on the future operative detail page.',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'When off, this operative only appears for signed-in members.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: {
        description: 'Display sort, ascending. Lower numbers appear first. Leave gaps (10, 20, 30…) so reordering is cheap.',
        step: 10,
      },
    },
    {
      type: 'collapsible',
      label: 'Discord Sync (read-only)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'cached_displayName',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Latest known display name from Discord. Refreshed lazily on page render past TTL.',
          },
        },
        {
          name: 'cached_avatarUrl',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Latest known Discord avatar URL. Falls back to the tactical ID-portrait when empty.',
          },
        },
        {
          name: 'cached_at',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When the cached fields were last refreshed from Ashley.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
  ],
}
