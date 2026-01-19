import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Games } from './collections/Games'
import { Members } from './collections/Members'
import { Topics } from './collections/Topics'
import { ContentTypes } from './collections/ContentTypes'
import { Series } from './collections/Series'
import { Articles } from './collections/Articles'
import { ReadProgress } from './collections/ReadProgress'
import { Homepage } from './globals/Homepage'
import { CalloutBlock, CodeBlock, MermaidBlock } from './blocks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Server URL - required for production to generate correct URLs
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: ({ data, collectionConfig }) => {
        // Use relative URLs so preview works from any origin (localhost, IP, production)
        if (collectionConfig?.slug === 'articles') {
          const slug = data?.slug || 'preview'
          return `/members/articles/${slug}?preview=true`
        }

        return '/'
      },
      collections: ['articles'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  // CORS configuration - add your production domains here
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ''].filter(Boolean),

  // Order determines admin menu group ordering: Content, Taxonomies, Assets, Users
  collections: [Articles, Series, Games, Topics, ContentTypes, Media, Users, Members, ReadProgress],
  globals: [Homepage],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [CalloutBlock, CodeBlock, MermaidBlock],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
