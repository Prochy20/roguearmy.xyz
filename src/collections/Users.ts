import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Admin User',
    plural: 'Admin Users',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Users',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
