/**
 * Trello card URL parsing and utilities.
 * Supports embedding Trello cards from public boards.
 */

export interface ParsedTrelloUrl {
  shortLink: string
  slug: string | null
  originalUrl: string
}

export interface TrelloChecklist {
  id: string
  name: string
  checkItems: {
    id: string
    name: string
    state: 'complete' | 'incomplete'
  }[]
}

export interface TrelloLabel {
  id: string
  name: string
  color: string | null
}

export interface TrelloCardData {
  id: string
  name: string
  desc: string
  labels: TrelloLabel[]
  due: string | null
  dueComplete: boolean
  checklists: TrelloChecklist[]
  coverImage: string | null
  shortUrl: string
}

// Trello color name to hex mapping
const trelloColors: Record<string, string> = {
  green: '#61bd4f',
  yellow: '#f2d600',
  orange: '#ff9f1a',
  red: '#eb5a46',
  purple: '#c377e0',
  blue: '#0079bf',
  sky: '#00c2e0',
  lime: '#51e898',
  pink: '#ff78cb',
  black: '#344563',
  green_dark: '#519839',
  yellow_dark: '#d9b51c',
  orange_dark: '#cd8313',
  red_dark: '#b04632',
  purple_dark: '#89609e',
  blue_dark: '#055a8c',
  sky_dark: '#026aa7',
  lime_dark: '#49852e',
  pink_dark: '#c76aa1',
  black_dark: '#1c2a4a',
  green_light: '#b3ecb6',
  yellow_light: '#f5ea92',
  orange_light: '#fad29c',
  red_light: '#efb3ab',
  purple_light: '#dfc0eb',
  blue_light: '#8bbdd9',
  sky_light: '#8fdfeb',
  lime_light: '#b3f1bf',
  pink_light: '#ffcce6',
  black_light: '#8590a2',
}

/**
 * Get hex color for a Trello color name
 */
export function getTrelloColorHex(color: string | null): string {
  if (!color) return '#8590a2' // Default gray
  return trelloColors[color] || '#8590a2'
}

/**
 * Parse Trello card URL and extract card info
 * Supports: trello.com/c/{shortLink}/{optional-slug}
 */
export function parseTrelloUrl(url: string): ParsedTrelloUrl | null {
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

    // Only support trello.com
    if (hostname !== 'trello.com') {
      return null
    }

    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    // Trello Card: trello.com/c/{shortLink}/{optional-slug}
    if (pathParts[0] === 'c' && pathParts[1]) {
      return {
        shortLink: pathParts[1],
        slug: pathParts[2] || null,
        originalUrl: normalizedUrl,
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Check if a URL is a valid Trello card URL
 */
export function isTrelloCardUrl(url: string): boolean {
  return parseTrelloUrl(url) !== null
}
