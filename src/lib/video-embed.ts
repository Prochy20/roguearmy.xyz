/**
 * Video embed URL parsing and utilities.
 * Supports YouTube, Vimeo, Twitch, and Kick platforms.
 */

export type VideoPlatform = 'youtube' | 'vimeo' | 'twitch' | 'kick'

export type VideoContentType =
  | 'video'
  | 'playlist'
  | 'channel'
  | 'live'
  | 'clip'
  | 'vod'
  | 'showcase'
  | 'collection'
  | 'short'

export interface ParsedVideoUrl {
  platform: VideoPlatform
  contentType: VideoContentType
  id: string
  embedUrl: string
  thumbnailUrl: string | null
}

// Platform labels for display
const platformLabels: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  twitch: 'Twitch',
  kick: 'Kick',
}

// Content type labels for display
const contentTypeLabels: Record<VideoContentType, string> = {
  video: 'Video',
  playlist: 'Playlist',
  channel: 'Channel',
  live: 'Live',
  clip: 'Clip',
  vod: 'VOD',
  showcase: 'Showcase',
  collection: 'Collection',
  short: 'Short',
}

export function getPlatformLabel(platform: VideoPlatform): string {
  return platformLabels[platform]
}

export function getContentTypeLabel(contentType: VideoContentType): string {
  return contentTypeLabels[contentType]
}

/**
 * Parse YouTube URL and extract video/playlist/channel info
 */
function parseYouTubeUrl(url: string): ParsedVideoUrl | null {
  const urlObj = new URL(url)
  const hostname = urlObj.hostname.replace('www.', '')

  // YouTube Shorts: youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch) {
    const id = shortsMatch[1]
    return {
      platform: 'youtube',
      contentType: 'short',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    }
  }

  // YouTube Live: youtube.com/live/ID
  const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/)
  if (liveMatch) {
    const id = liveMatch[1]
    return {
      platform: 'youtube',
      contentType: 'live',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    }
  }

  // YouTube Channel: youtube.com/@handle or youtube.com/channel/ID
  const channelHandleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
  if (channelHandleMatch) {
    const id = channelHandleMatch[1]
    return {
      platform: 'youtube',
      contentType: 'channel',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=user_uploads&list=${id}`,
      thumbnailUrl: null,
    }
  }

  const channelIdMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/)
  if (channelIdMatch) {
    const id = channelIdMatch[1]
    return {
      platform: 'youtube',
      contentType: 'channel',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=playlist&list=UU${id.substring(2)}`,
      thumbnailUrl: null,
    }
  }

  // YouTube Playlist: youtube.com/playlist?list=ID or watch with list param
  const playlistMatch = urlObj.searchParams.get('list')
  if (playlistMatch && urlObj.pathname === '/playlist') {
    return {
      platform: 'youtube',
      contentType: 'playlist',
      id: playlistMatch,
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistMatch}`,
      thumbnailUrl: null,
    }
  }

  // YouTube Video: youtube.com/watch?v=ID or youtu.be/ID
  let videoId: string | null = null

  if (hostname === 'youtu.be') {
    videoId = urlObj.pathname.slice(1).split('/')[0]
  } else if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
    videoId = urlObj.searchParams.get('v')

    // Also check embed URLs: youtube.com/embed/ID
    const embedMatch = url.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]+)/)
    if (embedMatch) {
      videoId = embedMatch[1]
    }
  }

  if (videoId) {
    // If there's also a playlist, include it in the embed
    const listId = urlObj.searchParams.get('list')
    const embedUrl = listId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?list=${listId}`
      : `https://www.youtube-nocookie.com/embed/${videoId}`

    return {
      platform: 'youtube',
      contentType: 'video',
      id: videoId,
      embedUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    }
  }

  return null
}

/**
 * Parse Vimeo URL and extract video/channel/showcase info
 */
function parseVimeoUrl(url: string): ParsedVideoUrl | null {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(Boolean)

  // Vimeo Showcase: vimeo.com/showcase/ID
  if (pathParts[0] === 'showcase' && pathParts[1]) {
    const id = pathParts[1]
    return {
      platform: 'vimeo',
      contentType: 'showcase',
      id,
      embedUrl: `https://vimeo.com/showcase/${id}/embed`,
      thumbnailUrl: null,
    }
  }

  // Vimeo Channel: vimeo.com/channels/NAME
  if (pathParts[0] === 'channels' && pathParts[1]) {
    const id = pathParts[1]
    return {
      platform: 'vimeo',
      contentType: 'channel',
      id,
      embedUrl: `https://vimeo.com/channels/${id}`,
      thumbnailUrl: null,
    }
  }

  // Vimeo Video: vimeo.com/ID or vimeo.com/video/ID
  let videoId: string | null = null

  if (pathParts[0] === 'video' && pathParts[1]) {
    videoId = pathParts[1]
  } else if (pathParts[0] && /^\d+$/.test(pathParts[0])) {
    videoId = pathParts[0]
  }

  // Also check player embeds: player.vimeo.com/video/ID
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/)
  if (playerMatch) {
    videoId = playerMatch[1]
  }

  if (videoId) {
    return {
      platform: 'vimeo',
      contentType: 'video',
      id: videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1`,
      thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`,
    }
  }

  return null
}

/**
 * Parse Twitch URL and extract channel/video/clip info
 */
function parseTwitchUrl(url: string): ParsedVideoUrl | null {
  const urlObj = new URL(url)
  const hostname = urlObj.hostname.replace('www.', '')
  const pathParts = urlObj.pathname.split('/').filter(Boolean)

  // Twitch Clip: clips.twitch.tv/CLIP_ID or twitch.tv/USERNAME/clip/CLIP_ID
  if (hostname === 'clips.twitch.tv' && pathParts[0]) {
    const id = pathParts[0]
    return {
      platform: 'twitch',
      contentType: 'clip',
      id,
      embedUrl: `https://clips.twitch.tv/embed?clip=${id}&parent=PARENT_DOMAIN`,
      thumbnailUrl: null,
    }
  }

  if (pathParts[1] === 'clip' && pathParts[2]) {
    const id = pathParts[2]
    return {
      platform: 'twitch',
      contentType: 'clip',
      id,
      embedUrl: `https://clips.twitch.tv/embed?clip=${id}&parent=PARENT_DOMAIN`,
      thumbnailUrl: null,
    }
  }

  // Twitch VOD: twitch.tv/videos/ID
  if (pathParts[0] === 'videos' && pathParts[1]) {
    const id = pathParts[1]
    return {
      platform: 'twitch',
      contentType: 'vod',
      id,
      embedUrl: `https://player.twitch.tv/?video=${id}&parent=PARENT_DOMAIN`,
      thumbnailUrl: null,
    }
  }

  // Twitch Collection: twitch.tv/collections/ID
  if (pathParts[0] === 'collections' && pathParts[1]) {
    const id = pathParts[1]
    return {
      platform: 'twitch',
      contentType: 'collection',
      id,
      embedUrl: `https://player.twitch.tv/?collection=${id}&parent=PARENT_DOMAIN`,
      thumbnailUrl: null,
    }
  }

  // Twitch Channel (live): twitch.tv/USERNAME
  if (pathParts[0] && !['videos', 'collections', 'clip'].includes(pathParts[0])) {
    const id = pathParts[0]
    return {
      platform: 'twitch',
      contentType: 'live',
      id,
      embedUrl: `https://player.twitch.tv/?channel=${id}&parent=PARENT_DOMAIN`,
      thumbnailUrl: null,
    }
  }

  return null
}

/**
 * Parse Kick URL and extract channel/video/clip info
 */
function parseKickUrl(url: string): ParsedVideoUrl | null {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(Boolean)

  // Kick Clip: kick.com/USERNAME?clip=CLIP_ID
  const clipId = urlObj.searchParams.get('clip')
  if (clipId) {
    return {
      platform: 'kick',
      contentType: 'clip',
      id: clipId,
      embedUrl: `https://player.kick.com/clip/${clipId}`,
      thumbnailUrl: null,
    }
  }

  // Kick VOD: kick.com/video/ID
  if (pathParts[0] === 'video' && pathParts[1]) {
    const id = pathParts[1]
    return {
      platform: 'kick',
      contentType: 'vod',
      id,
      embedUrl: `https://player.kick.com/video/${id}`,
      thumbnailUrl: null,
    }
  }

  // Kick Channel: kick.com/USERNAME
  if (pathParts[0] && pathParts[0] !== 'video') {
    const id = pathParts[0]
    return {
      platform: 'kick',
      contentType: 'channel',
      id,
      embedUrl: `https://player.kick.com/${id}`,
      thumbnailUrl: null,
    }
  }

  return null
}

/**
 * Main URL parser - detects platform and delegates to platform-specific parser
 */
export function parseVideoUrl(url: string): ParsedVideoUrl | null {
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

    // YouTube
    if (
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'youtube-nocookie.com'
    ) {
      return parseYouTubeUrl(normalizedUrl)
    }

    // Vimeo
    if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
      return parseVimeoUrl(normalizedUrl)
    }

    // Twitch
    if (
      hostname === 'twitch.tv' ||
      hostname === 'clips.twitch.tv' ||
      hostname === 'player.twitch.tv'
    ) {
      return parseTwitchUrl(normalizedUrl)
    }

    // Kick
    if (hostname === 'kick.com' || hostname === 'player.kick.com') {
      return parseKickUrl(normalizedUrl)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Check if a URL is a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null
}

/**
 * Get list of supported platforms for error messages
 */
export function getSupportedPlatforms(): string[] {
  return ['YouTube', 'Vimeo', 'Twitch', 'Kick']
}
