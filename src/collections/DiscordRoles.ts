import type { CollectionConfig } from 'payload'
import { publicRead, adminOnly } from '@/access'

export const DiscordRoles: CollectionConfig = {
  slug: 'discord-roles',
  labels: { singular: 'Discord Role', plural: 'Discord Roles' },
  admin: {
    useAsTitle: 'name',
    group: 'Taxonomies',
    defaultColumns: ['name', 'position', 'managed', 'isPrimary', 'lastSyncedAt'],
    description:
      'Canonical Discord role identity. Sync from Discord populates the read-only fields; admin curates isPrimary + accentOverride.',
    components: {
      beforeListTable: ['@/components/admin/SyncDiscordRolesButton#SyncDiscordRolesButton'],
    },
  },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    // ─── Sync-managed (readOnly here — only syncDiscordRoles writes)
    {
      name: 'discordId',
      type: 'text',
      unique: true,
      required: true,
      index: true,
      admin: { readOnly: true, description: 'Discord Snowflake ID. Identity key.' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'color',
      type: 'text',
      admin: { readOnly: true, description: 'Hex color from Discord, or null.' },
    },
    {
      name: 'position',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Discord guild hierarchy. Higher renders above lower; used for sort.',
      },
    },
    {
      name: 'mentionable',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, description: 'Drives the @MENTION marker in /me lattice.' },
    },
    {
      name: 'managed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'True for integration roles (booster, bots). Drives INTEGRATION badge.',
      },
    },
    {
      name: 'iconUrls',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Multi-size icon URLs from Discord, or null. {64, 128, 256, 512}.',
      },
    },
    {
      name: 'unicodeEmoji',
      type: 'text',
      admin: { readOnly: true, description: 'Fallback unicode emoji when no custom icon.' },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: { readOnly: true },
    },

    // ─── CMS-managed (admin-editable, sync preserves)
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Pin this role to the PRIMARY row in /me lattice.' },
    },
    {
      name: 'badgeLabel',
      type: 'text',
      maxLength: 16,
      admin: {
        description:
          'Override the category badge text (e.g. "LEVEL", "ASSIGNMENT", "BANNER"). ' +
          'Leave empty to use the derived label: PRIMARY / TAG / INTEGRATION. ' +
          'Rendered uppercase regardless of input casing.',
      },
    },
    {
      name: 'accentOverride',
      type: 'select',
      options: [
        { label: 'Green (brand)', value: 'green' },
        { label: 'Cyan', value: 'cyan' },
        { label: 'Magenta (booster)', value: 'magenta' },
        { label: 'Orange (D2 / mod)', value: 'orange' },
        { label: 'Chartreuse (dev)', value: 'chartreuse' },
        { label: 'Yellow (warn / hazard)', value: 'yellow' },
        { label: 'Amber', value: 'amber' },
        { label: 'Azure', value: 'azure' },
        { label: 'Gold', value: 'gold' },
        { label: 'Red', value: 'red' },
        { label: 'Rose (AFK / failure)', value: 'rose' },
        { label: 'Gray', value: 'gray' },
      ],
      admin: {
        description:
          'Override Discord color with a design-system palette token. ' +
          'Leave empty to derive accent from Discord color. ' +
          'Semantic hints: Chartreuse = dev roles, Yellow = warn/stale, ' +
          'Rose = AFK/failure, Magenta = booster tier, Orange = mod / D2.',
      },
    },
  ],
}
