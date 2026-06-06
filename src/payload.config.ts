import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor, BlocksFeature, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Games } from './collections/Games'
import { GameRoles } from './collections/GameRoles'
import { DiscordRoles } from './collections/DiscordRoles'
import { Members } from './collections/Members'
import { Topics } from './collections/Topics'
import { ContentTypes } from './collections/ContentTypes'
import { Series } from './collections/Series'
import { Articles } from './collections/Articles'
import { ReadProgress } from './collections/ReadProgress'
import { Bookmarks } from './collections/Bookmarks'
import { StaffProfiles } from './collections/StaffProfiles'
import { Division2Clans } from './collections/Division2Clans'
import { CommunityPage } from './globals/CommunityPage'
import { Division2 } from './globals/Division2'
import { Homepage } from './globals/Homepage'
import { Manifesto } from './globals/Manifesto'
import { SiteChrome } from './globals/SiteChrome'
import { StaffPage } from './globals/StaffPage'
import { CalloutBlock, CodeBlock, MermaidBlock, SocialEmbedBlock, TrelloCardBlock, VideoEmbedBlock } from './blocks'

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
        // Live Preview uses iframe with postMessage for real-time updates
        // Return direct URL - admin is already authenticated in Payload
        if (collectionConfig?.slug === 'articles') {
          const articleSlug = data?.slug || 'preview'
          const topic = data?.categorization?.topic
          // Topic could be an ID string or a populated object with slug
          const topicSlug = typeof topic === 'object' && topic?.slug
            ? topic.slug
            : 'preview'

          return `/blog/${topicSlug}/${articleSlug}?preview=true`
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
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || '', 'https://rga.local'].filter(Boolean),

  // Sidebar group order is driven by first-appearance across collections then
  // globals — so the first collection in each group seeds its position in the
  // nav. Order below produces: Editorial, Identity, Division 2, Taxonomies,
  // Community, Assets, System. Within a group Payload lists collections first
  // then globals, so the globals array order only matters between siblings in
  // the same group (e.g. StaffPage before Manifesto under Identity).
  collections: [
    Articles, Series,                                // Editorial
    StaffProfiles,                                   // Identity
    Division2Clans,                                  // Division 2
    Games, GameRoles, DiscordRoles, Topics, ContentTypes, // Taxonomies
    Members, Bookmarks, ReadProgress,                // Community
    Media,                                           // Assets
    Users,                                           // System
  ],
  globals: [Homepage, StaffPage, CommunityPage, Manifesto, Division2, SiteChrome],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [CalloutBlock, CodeBlock, MermaidBlock, SocialEmbedBlock, TrelloCardBlock, VideoEmbedBlock],
      }),
      FixedToolbarFeature(),
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
