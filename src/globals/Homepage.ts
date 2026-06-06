import type { GlobalConfig } from 'payload'
import { publicRead } from '@/access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'System',
  },
  access: {
    read: publicRead,
  },
  fields: [
    {
      name: 'claim',
      type: 'text',
      admin: {
        description: 'Tagline text displayed under the headline',
      },
    },
    {
      name: 'games',
      type: 'relationship',
      relationTo: 'games',
      hasMany: true,
      admin: {
        isSortable: true,
        description: 'Drag to reorder games on the homepage',
      },
    },
  ],
}
