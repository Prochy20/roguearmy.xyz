import type { CollectionConfig } from 'payload'
import { publicRead } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Assets',
  },
  access: {
    read: publicRead,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
