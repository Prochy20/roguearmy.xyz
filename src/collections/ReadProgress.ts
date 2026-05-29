import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access'

export const ReadProgress: CollectionConfig = {
  slug: 'read-progress',
  labels: {
    singular: 'Read Progress',
    plural: 'Read Progress',
  },
  admin: {
    group: 'Community',
    description: 'Tracks reading progress for members across articles and briefings',
    defaultColumns: ['member', 'targetType', 'targetId', 'progress', 'completed', 'lastVisitedAt'],
  },
  access: {
    // Admin-only read (members access their own records only via the BFF
    // routes under /api/member/read-progress, which scope the query manually).
    read: adminOnly,
    // Only create/update via API (not admin)
    create: () => false,
    update: () => false,
    delete: adminOnly, // Only admins can delete
  },
  dbName: 'readProgress',
  indexes: [
    {
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
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'targetType',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Briefing', value: 'briefing' },
      ],
      index: true,
      admin: {
        readOnly: true,
        description: 'Which content type this progress record points at',
      },
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'ID of the article (Payload ID) or briefing (Ashley UUID)',
      },
    },
    {
      // Kept as a relationship for admin UX — when targetType='article',
      // this resolves to a clickable linked row in the admin panel.
      // For briefing rows, this stays null and `targetId` is the source of truth.
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: false,
      admin: {
        readOnly: true,
        description: 'Linked article (article-type rows only)',
      },
    },
    {
      name: 'progress',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      admin: {
        description: 'Scroll percentage (0-100)',
      },
    },
    {
      name: 'firstVisitedAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'When the member first visited this target',
      },
    },
    {
      name: 'lastVisitedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the member last visited this target',
      },
    },
    {
      name: 'timeSpent',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Total time spent reading (seconds)',
      },
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'True when progress reaches 85% or higher',
      },
    },
  ],
}
