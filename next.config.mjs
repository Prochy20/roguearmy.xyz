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
