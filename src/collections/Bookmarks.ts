import type { CollectionConfig } from 'payload'

export const Bookmarks: CollectionConfig = {
  slug: 'bookmarks',
  labels: {
    singular: 'Bookmark',
    plural: 'Bookmarks',
  },
  admin: {
    group: 'Users',
    description: 'Member bookmarked articles',
    defaultColumns: ['member', 'article', 'createdAt'],
  },
  access: {
    // Only admins via admin panel
    read: ({ req }) => Boolean(req.user),
    create: () => false, // API only
    update: () => false, // No updates needed (toggle = delete + create)
    delete: ({ req }) => Boolean(req.user), // Only admins can delete
  },
  indexes: [
    {
      fields: ['member', 'article'],
      unique: true, // One bookmark per member per article
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
    // createdAt is auto-added by timestamps: true (default)
  ],
}
