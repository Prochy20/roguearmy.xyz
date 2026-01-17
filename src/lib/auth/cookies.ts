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
