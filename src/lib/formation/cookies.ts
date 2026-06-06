/**
 * Cookie helpers for the boot-intro session gate. Two halves:
 *
 *   - Server: shouldShowBoot() reads the cookie during SSR via next/headers
 *     and returns true when the overlay should render. The server places
 *     the overlay in the initial HTML rather than waiting for a client
 *     mount — this avoids a flash of the page before the overlay covers it.
 *
 *   - Client: setBootSeenCookieClient() writes the cookie via document.cookie
 *     when the overlay animation finishes. The cookie is intentionally not
 *     httpOnly so the client can refresh it.
 *
 * Scoped to /leaderboard (Path) because no other surface needs to read it.
 */

const COOKIE_NAME = 'rga_formation_seen'
const COOKIE_MAX_AGE_DAYS = 30
const COOKIE_MAX_AGE_SECONDS = COOKIE_MAX_AGE_DAYS * 86_400
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_DAYS * 86_400_000

/**
 * Read the cookie value as a timestamp. Returns null when absent or
 * unparseable. SERVER-ONLY — uses next/headers.
 */
export async function readBootSeenCookie(): Promise<number | null> {
  // Lazy import keeps this module client-safe (importers that only need the
  // setter shouldn't pull in next/headers).
  const { cookies } = await import('next/headers')
  const store = await cookies()
  const c = store.get(COOKIE_NAME)
  if (!c) return null
  const ts = Number(c.value)
  return Number.isFinite(ts) ? ts : null
}

/**
 * Whether the boot intro should render on this request. True when the
 * cookie is absent or older than the max-age window. SERVER-ONLY.
 */
export async function shouldShowBoot(now: number = Date.now()): Promise<boolean> {
  const ts = await readBootSeenCookie()
  if (ts == null) return true
  return now - ts > COOKIE_MAX_AGE_MS
}

/**
 * Client-side cookie write. Called by FormationPanel after the overlay
 * completes (timeout or skip-click). Re-writing on every fire refreshes
 * the 30-day window — a "sliding" expiry rather than a fixed one.
 */
export function setBootSeenCookieClient(now: number = Date.now()): void {
  if (typeof document === 'undefined') return
  const parts = [
    `${COOKIE_NAME}=${now}`,
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    'Path=/leaderboard',
    'SameSite=Lax',
  ]
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure')
  }
  document.cookie = parts.join('; ')
}

export const _internals = {
  COOKIE_NAME,
  COOKIE_MAX_AGE_DAYS,
  COOKIE_MAX_AGE_MS,
}
