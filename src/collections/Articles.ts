import type { CollectionConfig } from 'payload'
import { setPublishedAt } from '@/hooks/articles/setPublishedAt'
import { calculateReadingTime } from '@/hooks/articles/calculateReadingTime'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'games', '_status', 'publishedAt'],
    group: 'Content',
    listSearchableFields: ['title', 'slug', 'perex'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  hooks: {
    beforeChange: [setPublishedAt],
    afterRead: [calculateReadingTime],
  },
  fields: [
    {
      name: 'title',
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
        description: 'Auto-generated from title. Used in URLs.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.title) {
              return data.title
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
      name: 'perex',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short excerpt/description shown in article listings',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'games',
      type: 'relationship',
      relationTo: 'games',
      hasMany: true,
      admin: {
        description: 'Optional: Link to specific games this article is about',
      },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'topics',
      required: true,
      admin: {
        description: 'Primary content type (Guide, Build, News, etc.)',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Optional: Additional tags for discovery',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Automatically set when first published',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated reading time in minutes (virtual field)',
      },
    },
  ],
}
