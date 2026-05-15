import { execFileSync } from 'node:child_process'
import { withPayload } from '@payloadcms/next/withPayload'

const commitSha = (() => {
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim() }
  catch { return 'unknown' }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  // Required for sharp to work correctly in Vercel serverless functions
  serverExternalPackages: ['sharp'],

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/division2/img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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
