import type { CollectionConfig } from 'payload'

export const ReadProgress: CollectionConfig = {
  slug: 'read-progress',
  labels: {
    singular: 'Read Progress',
    plural: 'Read Progress',
  },
  admin: {
    group: 'Users',
    description: 'Tracks article reading progress for members',
    defaultColumns: ['member', 'article', 'progress', 'completed', 'lastVisitedAt'],
  },
  access: {
    // Members can only read their own records
    read: ({ req }) => {
      // Allow admin full access
      if (req.user) return true
      return false
    },
    // Only create/update via API (not admin)
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user), // Only admins can delete
  },
  // Compound unique index on (member, article) - enforced at DB adapter level
  dbName: 'readProgress',
  indexes: [
    {
      fields: ['member', 'article'],
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
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
      admin: {
        readOnly: true,
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
        description: 'When the member first visited this article',
      },
    },
    {
      name: 'lastVisitedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the member last visited this article',
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
