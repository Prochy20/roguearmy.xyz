import type { CollectionConfig } from 'payload'

export const Series: CollectionConfig = {
  slug: 'series',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from name. Used in URLs.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this series',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional hero image for the series. Falls back to first article hero if not set.',
      },
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: {
        description:
          'Articles in this series. Drag to reorder - the order here defines the series order.',
      },
    },
  ],
}
