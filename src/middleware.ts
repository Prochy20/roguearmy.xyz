import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ASHLEY_ACCESS_COOKIE,
  ASHLEY_REFRESH_COOKIE,
  ASHLEY_COOKIE_MAX_AGE,
} from '@/lib/auth/constants'

const INTERNAL_PATHS = ['/brand', '/twitch']

// Refresh the Ashley access token if it expires within this many seconds.
// A generous buffer means in-flight requests on slow networks don't race
// against expiry — the token is always meaningfully fresh by the time the
// route handler runs.
const REFRESH_BUFFER_SECONDS = 60

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Existing: noindex internal routes
  const { pathname } = request.nextUrl
  if (INTERNAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // Ashley: proactively refresh near-expiry access tokens. Server components
  // cannot write cookies, so without this every request that arrives after
  // the access token's lifetime would 401 against Ashley until the user
  // re-logged-in. With this, the JWT is silently rotated whenever it's near
  // expiry; the route handler reads the fresh token from request cookies and
  // the browser receives the new pair via response cookies.
  await maybeRefreshAshley(request, response)

  return response
}

async function maybeRefreshAshley(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  const accessToken = request.cookies.get(ASHLEY_ACCESS_COOKIE)?.value
  if (!accessToken) return // user has no Ashley session — nothing to refresh

  const exp = readJwtExp(accessToken)
  if (exp === null) return // unparseable JWT, leave alone

  const nowSec = Math.floor(Date.now() / 1000)
  if (exp - nowSec > REFRESH_BUFFER_SECONDS) return // still fresh

  const refreshToken = request.cookies.get(ASHLEY_REFRESH_COOKIE)?.value
  if (!refreshToken) return // can't refresh without a refresh cookie

  const baseUrl = process.env.ASHLEY_API_BASE_URL
  const apiKey = process.env.ASHLEY_API_KEY
  if (!baseUrl || !apiKey) return

  try {
    // baseUrl already includes the deployment-specific API mount prefix
    // (".../api" in dev, ".../api-ashley" in prod). Don't re-add "/api/".
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!refreshRes.ok) {
      // 401/403 from refresh endpoint = refresh token is genuinely invalid
      // (rotated, revoked, expired). Clear cookies so subsequent requests
      // don't loop attempting refresh. 5xx / network = transient — keep
      // cookies, the existing access token may still work once Ashley recovers.
      if (refreshRes.status === 401 || refreshRes.status === 403) {
        response.cookies.delete(ASHLEY_ACCESS_COOKIE)
        response.cookies.delete(ASHLEY_REFRESH_COOKIE)
      }
      return
    }

    const body = (await refreshRes.json()) as {
      accessToken?: unknown
      refreshToken?: unknown
    }
    if (typeof body.accessToken !== 'string' || typeof body.refreshToken !== 'string') {
      return
    }

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ASHLEY_COOKIE_MAX_AGE,
      path: '/',
    }
    response.cookies.set(ASHLEY_ACCESS_COOKIE, body.accessToken, cookieOpts)
    response.cookies.set(ASHLEY_REFRESH_COOKIE, body.refreshToken, cookieOpts)

    // Mutate the *request* cookies as well — server components read cookies
    // via next/headers, which sources from the request. Without this the
    // current request would still see the old (expired) token.
    request.cookies.set(ASHLEY_ACCESS_COOKIE, body.accessToken)
  } catch {
    // Network blip — leave cookies alone. The downstream call will surface
    // its own 401 if the existing token is truly dead.
  }
}

// Decode the JWT payload without verifying — we only need `exp` for staleness
// detection. Ashley validates signatures authoritatively when a request hits it.
function readJwtExp(jwt: string): number | null {
  const parts = jwt.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const obj = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof obj.exp === 'number' ? obj.exp : null
  } catch {
    return null
  }
}

export const config = {
  // Run on every route except Next internals, static assets, and Payload's
  // own admin/API surfaces. The Ashley logic short-circuits when there's no
  // access cookie, so anonymous/static traffic costs only one cookie read.
  matcher: ['/((?!_next/static|_next/image|favicon|fonts|images|admin|api/payload).*)'],
}
