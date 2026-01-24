/**
 * Social media embed URL parsing and utilities.
 * Supports Twitter/X, Instagram, Facebook, and TikTok platforms.
 */

export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok'

export type SocialContentType =
  | 'post'
  | 'tweet'
  | 'reel'
  | 'video'

export interface ParsedSocialUrl {
  platform: SocialPlatform
  contentType: SocialContentType
  id: string
  username: string | null
  originalUrl: string
}

// Platform labels for display
const platformLabels: Record<SocialPlatform, string> = {
  twitter: 'X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

// Content type labels for display
const contentTypeLabels: Record<SocialContentType, string> = {
  post: 'Post',
  tweet: 'Tweet',
  reel: 'Reel',
  video: 'Video',
}

export function getPlatformLabel(platform: SocialPlatform): string {
  return platformLabels[platform]
}

export function getContentTypeLabel(contentType: SocialContentType): string {
  return contentTypeLabels[contentType]
}

/**
 * Parse Twitter/X URL and extract tweet info
 * Supports: twitter.com/user/status/id, x.com/user/status/id
 */
function parseTwitterUrl(url: string): ParsedSocialUrl | null {
  // Match both twitter.com and x.com
  const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/)
  if (match) {
    return {
      platform: 'twitter',
      contentType: 'tweet',
      id: match[2],
      username: match[1],
      originalUrl: url,
    }
  }
  return null
}

/**
 * Parse Instagram URL and extract post/reel info
 * Supports: instagram.com/p/id, instagram.com/reel/id, instagram.com/tv/id
 */
function parseInstagramUrl(url: string): ParsedSocialUrl | null {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(Boolean)

  // Instagram Post: instagram.com/p/ID
  if (pathParts[0] === 'p' && pathParts[1]) {
    return {
      platform: 'instagram',
      contentType: 'post',
      id: pathParts[1],
      username: null,
      originalUrl: url,
    }
  }

  // Instagram Reel: instagram.com/reel/ID
  if (pathParts[0] === 'reel' && pathParts[1]) {
    return {
      platform: 'instagram',
      contentType: 'reel',
      id: pathParts[1],
      username: null,
      originalUrl: url,
    }
  }

  // Instagram TV/Video: instagram.com/tv/ID
  if (pathParts[0] === 'tv' && pathParts[1]) {
    return {
      platform: 'instagram',
      contentType: 'video',
      id: pathParts[1],
      username: null,
      originalUrl: url,
    }
  }

  // Instagram post from user profile: instagram.com/username/p/ID
  if (pathParts[1] === 'p' && pathParts[2]) {
    return {
      platform: 'instagram',
      contentType: 'post',
      id: pathParts[2],
      username: pathParts[0],
      originalUrl: url,
    }
  }

  // Instagram reel from user profile: instagram.com/username/reel/ID
  if (pathParts[1] === 'reel' && pathParts[2]) {
    return {
      platform: 'instagram',
      contentType: 'reel',
      id: pathParts[2],
      username: pathParts[0],
      originalUrl: url,
    }
  }

  return null
}

/**
 * Parse TikTok URL and extract video info
 * Supports: tiktok.com/@user/video/id, vm.tiktok.com/id
 */
function parseTikTokUrl(url: string): ParsedSocialUrl | null {
  const urlObj = new URL(url)
  const hostname = urlObj.hostname.replace('www.', '')
  const pathParts = urlObj.pathname.split('/').filter(Boolean)

  // TikTok Video: tiktok.com/@user/video/ID
  if (pathParts[0]?.startsWith('@') && pathParts[1] === 'video' && pathParts[2]) {
    return {
      platform: 'tiktok',
      contentType: 'video',
      id: pathParts[2],
      username: pathParts[0].slice(1), // Remove @
      originalUrl: url,
    }
  }

  // TikTok short URL: vm.tiktok.com/ID
  if (hostname === 'vm.tiktok.com' && pathParts[0]) {
    return {
      platform: 'tiktok',
      contentType: 'video',
      id: pathParts[0],
      username: null,
      originalUrl: url,
    }
  }

  // TikTok mobile short URL: tiktok.com/t/ID
  if (pathParts[0] === 't' && pathParts[1]) {
    return {
      platform: 'tiktok',
      contentType: 'video',
      id: pathParts[1],
      username: null,
      originalUrl: url,
    }
  }

  return null
}

/**
 * Main URL parser - detects platform and delegates to platform-specific parser
 */
export function parseSocialUrl(url: string): ParsedSocialUrl | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Normalize URL
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  try {
    const urlObj = new URL(normalizedUrl)
    const hostname = urlObj.hostname.replace('www.', '')

    // Twitter/X
    if (hostname === 'twitter.com' || hostname === 'x.com') {
      return parseTwitterUrl(normalizedUrl)
    }

    // Instagram
    if (hostname === 'instagram.com') {
      return parseInstagramUrl(normalizedUrl)
    }

    // TikTok
    if (
      hostname === 'tiktok.com' ||
      hostname === 'vm.tiktok.com'
    ) {
      return parseTikTokUrl(normalizedUrl)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Check if a URL is a supported social media platform
 */
export function isSupportedSocialUrl(url: string): boolean {
  return parseSocialUrl(url) !== null
}

/**
 * Get list of supported platforms for error messages
 */
export function getSupportedSocialPlatforms(): string[] {
  return ['Twitter/X', 'Instagram', 'TikTok']
}
