# Payload CMS

## Configuration

**File**: `src/payload.config.ts`

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Games } from './collections/Games'
import { Homepage } from './globals/Homepage'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,  // Auth collection
  },
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ''].filter(Boolean),
  collections: [Users, Media, Games],
  globals: [Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,  // Image optimization
})
```

## Collections

### Users
**File**: `src/collections/Users.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,  // Enables authentication
  fields: [
    // Email added by default with auth: true
    // Add custom fields here
  ],
}
```

- Authentication-enabled (login, sessions)
- Email as display title in admin
- Used for admin panel access

### Media
**File**: `src/collections/Media.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,  // Public read access
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,  // Accessibility
    },
  ],
  upload: true,  // Enables file uploads
}
```

- Public read access (no auth required)
- Required alt text for accessibility
- Upload-enabled for images/files

### Games
**File**: `src/collections/Games.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Games: CollectionConfig = {
  slug: 'games',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'color', 'featured'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'textarea' },
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
      admin: { description: 'Shows "Main Game" badge and larger display' },
    },
  ],
}
```

- Public read access
- 8 color options for UI theming
- `featured` flag for homepage prominence

## Globals

### Homepage
**File**: `src/globals/Homepage.ts`

```typescript
import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'claim',
      type: 'text',
      admin: { description: 'Tagline text displayed under the headline' },
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
```

- Single global document for homepage configuration
- `claim` - Tagline text for hero section
- `games` - Sortable relationship to Games collection
- Public read access

## Critical Patterns

### Local API Security

**CRITICAL**: When passing `user` to Local API, ALWAYS set `overrideAccess: false`:

```typescript
// WRONG - access control bypassed
await payload.find({
  collection: 'posts',
  user: someUser,
})

// CORRECT - enforces permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false,
})
```

Without `overrideAccess: false`, the user parameter is informational only - access control is still bypassed!

### Transaction Safety in Hooks

**CRITICAL**: ALWAYS pass `req` to nested operations in hooks:

```typescript
// WRONG - separate transaction, breaks atomicity
hooks: {
  afterChange: [async ({ req, doc }) => {
    await req.payload.create({
      collection: 'logs',
      data: { action: 'created', docId: doc.id },
    })
  }]
}

// CORRECT - maintains transaction
hooks: {
  afterChange: [async ({ req, doc }) => {
    await req.payload.create({
      collection: 'logs',
      data: { action: 'created', docId: doc.id },
      req,  // Pass req to maintain transaction
    })
  }]
}
```

### Preventing Hook Loops

Use context to prevent infinite loops when updating the same document:

```typescript
hooks: {
  afterChange: [async ({ context, req, doc }) => {
    if (context.skipHooks) return  // Exit if already processed

    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { lastModified: new Date() },
      context: { skipHooks: true },  // Prevent loop
      req,
    })
  }]
}
```

## Adding a New Collection

1. Create collection file:
```typescript
// src/collections/Posts.ts
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
```

2. Register in config:
```typescript
// src/payload.config.ts
import { Posts } from './collections/Posts'

export default buildConfig({
  collections: [Users, Media, Posts],
  // ...
})
```

3. Generate types:
```bash
pnpm generate:types
```

## Type Generation

After schema changes, regenerate types:

```bash
pnpm generate:types      # Generate payload-types.ts
pnpm generate:importmap  # Regenerate component imports
```

**Never edit `payload-types.ts` manually** - it's auto-generated.

## Using Payload in Components

### Server Component (RSC)
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    limit: 10,
  })

  return <div>{/* render posts */}</div>
}
```

### API Route
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'posts',
  })

  return NextResponse.json(data)
}
```

## Directory Structure

```
src/
├── collections/      # Collection configs
│   ├── Users.ts
│   ├── Media.ts
│   └── Games.ts
├── globals/          # Global document configs
│   └── Homepage.ts
└── payload.config.ts # Main configuration
```

### Recommended Additions

When extending the project, consider adding:

```
src/
├── access/           # Reusable access control functions
│   ├── isAdmin.ts
│   └── isOwner.ts
├── hooks/            # Collection and field hooks
│   ├── populateAuthor.ts
│   └── logActivity.ts
└── components/       # Custom admin components
    └── CustomField.tsx
```
