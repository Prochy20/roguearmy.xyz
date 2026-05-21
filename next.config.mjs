import { execFileSync } from 'node:child_process'
import { withPayload } from '@payloadcms/next/withPayload'

const commitSha = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim()
  } catch {
    return 'unknown'
  }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  allowedDevOrigins: ['rga.local', '*.rga.local'],
  // Required for sharp to work correctly in Vercel serverless functions
  serverExternalPackages: ['sharp'],

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // YouTube thumbnails (Division 2 content feed)
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i9.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      // Reddit thumbnails — most are blocked by hotlink protection, the
      // ContentCard uses `unoptimized` for Reddit so these are mostly
      // belt-and-suspenders.
      { protocol: 'https', hostname: 'i.redd.it' },
      { protocol: 'https', hostname: 'preview.redd.it' },
      { protocol: 'https', hostname: 'g.redd.it' },
      { protocol: 'https', hostname: 'external-preview.redd.it' },
      // Ubisoft news thumbnails (Contentful CDN, confirmed via Ashley probe).
      { protocol: 'https', hostname: 'images.ctfassets.net' },
    ],
  },

  async headers() {
    return [
      {
        source: '/division2/img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
