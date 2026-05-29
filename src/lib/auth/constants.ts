/**
 * Cookie-name + lifetime constants.
 *
 * Lives in its own file with NO imports so it can be safely loaded from
 * both the edge runtime (middleware.ts) and the Node runtime (cookies.ts,
 * route handlers, server components). Adding any import that pulls in
 * `next/headers` would break edge compatibility.
 */

// Ashley backend tokens (sidecar to the local Discord session).
// Cookie expiry is intentionally longer than the JWT lifetime — JWT freshness
// is enforced by Ashley returning 401, which the BFF turns into a refresh.
// If the cookie expired with the JWT, the browser would stop sending it and
// refresh would be impossible.
export const ASHLEY_ACCESS_COOKIE = 'rga_ashley_access'
export const ASHLEY_REFRESH_COOKIE = 'rga_ashley_refresh'
export const ASHLEY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
