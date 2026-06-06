import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

/**
 * Resolve a usable image src for a leaderboard entry's avatar.
 *
 * Ashley's schema describes `avatar` as a hash string, but the live API
 * returns the full pre-built CDN URL (including `.webp`/`.png` extension).
 * We accept both shapes — and fall back to Discord's default avatar PNG
 * when nothing usable is present.
 */
export function leaderboardAvatarSrc(entry: LeaderboardEntry): string {
  // Schema types `avatar` as `Record<string, never> | null` (opaque), but the
  // live API returns either a hash string or a full pre-built CDN URL.
  const raw = entry.avatar as unknown as string | null | undefined
  if (typeof raw === 'string' && raw.length > 0) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    return getDiscordAvatarUrl(entry.discordId, raw)
  }
  return getDiscordAvatarUrl(entry.discordId, null)
}
