import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Games } from './collections/Games'
import { Members } from './collections/Members'
import { Topics } from './collections/Topics'
import { Tags } from './collections/Tags'
import { Series } from './collections/Series'
import { Articles } from './collections/Articles'
import { ReadProgress } from './collections/ReadProgress'
import { Homepage } from './globals/Homepage'

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
  },

  // CORS configuration - add your production domains here
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ''].filter(Boolean),

  // Order determines admin menu group ordering: Content, Taxonomies, Assets, Users
  collections: [Articles, Series, Games, Topics, Tags, Media, Users, Members, ReadProgress],
  globals: [Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
