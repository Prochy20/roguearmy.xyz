// Production fallback so misconfigured preview builds still emit absolute URLs
// pointing at the canonical host instead of localhost / empty string.
const PROD_FALLBACK = 'https://roguearmy.xyz'

function normalize(value: string): string {
  return value.replace(/\/+$/, '')
}

/**
 * Canonical absolute origin for the site. Reads `NEXT_PUBLIC_SERVER_URL`
 * (set per environment in Vercel) and falls back to the production host.
 *
 * Always returns a value without a trailing slash so callers can append
 * paths with a leading slash without doubling.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL
  if (typeof raw === 'string' && raw.length > 0) return normalize(raw)
  return PROD_FALLBACK
}

/** Join the site origin with a path that already starts with `/`. */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}
