import type { CollectionConfig } from 'payload'
import { setPublishedAt } from '@/hooks/articles/setPublishedAt'
import { calculateReadingTime } from '@/hooks/articles/calculateReadingTime'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'categorization.topic', 'articleContent.contentSource', 'categorization.games', '_status'],
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
    // Hidden fields (still functional, just not visible)
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
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
      name: 'publishedAt',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        hidden: true,
      },
    },

    // Basic Info
    {
      name: 'title',
      type: 'text',
      required: true,
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
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Members Only', value: 'members_only' },
      ],
      admin: {
        description: 'Public articles are visible to everyone. Members Only requires Discord server membership.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 3,
      admin: {
        description: 'Curated articles to show in "You might also like" section. Leave empty for automatic selection.',
      },
      filterOptions: ({ id }) => ({
        id: { not_equals: id },
      }),
    },

    // Categorization
    {
      name: 'categorization',
      type: 'group',
      fields: [
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
          name: 'games',
          type: 'relationship',
          relationTo: 'games',
          hasMany: true,
          admin: {
            description: 'Optional: Link to specific games this article is about',
          },
        },
        {
          name: 'contentType',
          type: 'relationship',
          relationTo: 'content-types',
          hasMany: false,
          required: true,
          admin: {
            description: 'Content format: Article, Video, Podcast, etc.',
          },
        },
      ],
    },

    // Article Content
    {
      name: 'articleContent',
      type: 'group',
      fields: [
        {
          name: 'contentSource',
          type: 'radio',
          defaultValue: 'payload',
          options: [
            {
              label: 'Payload Content',
              value: 'payload',
            },
            {
              label: 'Wiki Link',
              value: 'wiki',
            },
          ],
          admin: {
            description: 'Choose where the article content comes from',
            layout: 'horizontal',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.contentSource !== 'wiki',
          },
          validate: (value, { siblingData }) => {
            if (siblingData?.contentSource !== 'wiki' && !value) {
              return 'Content is required for Payload articles'
            }
            return true
          },
        },
        {
          name: 'outlineDocumentId',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.contentSource === 'wiki',
            description: 'Select a published document from the Outline wiki',
            components: {
              Field: '@/components/admin/OutlineDocumentSelector',
            },
          },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData: Record<string, unknown> },
          ) => {
            if (siblingData?.contentSource === 'wiki' && !value) {
              return 'Wiki document is required for Wiki Link articles'
            }
            return true
          },
        },
      ],
    },
  ],
}
