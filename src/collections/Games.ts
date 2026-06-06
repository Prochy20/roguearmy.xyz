import type { CollectionConfig } from 'payload'
import { publicRead } from '@/access'

export const Games: CollectionConfig = {
  slug: 'games',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'color', 'featured'],
    group: 'Taxonomies',
  },
  access: {
    read: publicRead,
  },
  hooks: {
    afterDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'game-roles',
          where: { game: { equals: id } },
          req,
          overrideAccess: false,
        })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'color',
      type: 'select',
      required: true,
      defaultValue: 'orange',
      options: [
        { label: 'Orange', value: 'orange' },
        { label: 'Blue', value: 'blue' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Teal', value: 'teal' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Red', value: 'red' },
        { label: 'Pink', value: 'pink' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Shows "Main Game" badge and larger display',
      },
    },
  ],
}
