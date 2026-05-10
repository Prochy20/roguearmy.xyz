import { cookies } from 'next/headers'

export const MEMBER_SESSION_COOKIE = 'rga_member_session'
export const OAUTH_STATE_COOKIE = 'rga_oauth_state'

const isProduction = process.env.NODE_ENV === 'production'

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(MEMBER_SESSION_COOKIE)?.value
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(MEMBER_SESSION_COOKIE)
}

export async function setOAuthStateCookie(state: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })
}

export async function getOAuthStateCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(OAUTH_STATE_COOKIE)?.value
}

export async function clearOAuthStateCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(OAUTH_STATE_COOKIE)
}

// Ashley backend tokens (sidecar to the local Discord session).
// Cookie expiry is intentionally longer than the JWT lifetime — JWT freshness
// is enforced by Ashley returning 401, which the BFF turns into a refresh.
// If the cookie expired with the JWT, the browser would stop sending it and
// refresh would be impossible.
export const ASHLEY_ACCESS_COOKIE = 'rga_ashley_access'
export const ASHLEY_REFRESH_COOKIE = 'rga_ashley_refresh'

const ASHLEY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function setAshleyTokens(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies()
  const opts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: ASHLEY_COOKIE_MAX_AGE,
    path: '/',
  }
  cookieStore.set(ASHLEY_ACCESS_COOKIE, accessToken, opts)
  cookieStore.set(ASHLEY_REFRESH_COOKIE, refreshToken, opts)
}

export async function getAshleyAccessCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ASHLEY_ACCESS_COOKIE)?.value
}

export async function getAshleyRefreshCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ASHLEY_REFRESH_COOKIE)?.value
}

export async function clearAshleyCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ASHLEY_ACCESS_COOKIE)
  cookieStore.delete(ASHLEY_REFRESH_COOKIE)
}

// Return URL cookie for post-login redirect
export const RETURN_TO_COOKIE = 'rga_return_to'

export async function setReturnToCookie(returnTo: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })
}

export async function getReturnToCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(RETURN_TO_COOKIE)?.value
}

export async function clearReturnToCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(RETURN_TO_COOKIE)
}
