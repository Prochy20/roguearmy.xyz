import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access'

export const Bookmarks: CollectionConfig = {
  slug: 'bookmarks',
  dbName: 'bookmarks',
  labels: {
    singular: 'Bookmark',
    plural: 'Bookmarks',
  },
  admin: {
    group: 'Community',
    description: 'Member bookmarks across articles and briefings',
    defaultColumns: ['member', 'targetType', 'article', 'targetId', 'createdAt'],
  },
  access: {
    // Mutations go through the BFF route handler at /api/member/bookmarks,
    // which scopes by the authenticated member. Admin-only read keeps PII
    // (which member bookmarked what) off the public REST mount.
    read: adminOnly,
    create: () => false,
    update: () => false, // Toggle semantics = delete + create
    delete: adminOnly,
  },
  indexes: [
    {
      // Compound covers leftmost-prefix queries on `member` and
      // `[member, targetType]` for free; pair index on `targetId` covers
      // standalone target lookups.
      fields: ['member', 'targetType', 'targetId'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'targetType',
      type: 'select',
      required: true,
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Briefing', value: 'briefing' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Payload article ID or Ashley briefing UUID',
      },
    },
    {
      // Kept as a relationship for admin UX — when targetType='article',
      // this resolves to a clickable linked row in the admin panel.
      // For briefing rows, this stays null; `targetId` is the source of truth.
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: false,
      admin: {
        readOnly: true,
        description: 'Linked article (article-type rows only)',
      },
    },
  ],
}
