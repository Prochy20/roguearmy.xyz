import 'server-only'

import {
  clearSessionCookie,
  clearAshleyCookies,
  getAshleyAccessCookie,
} from '@/lib/auth'
import { createAshleyUserClient } from '@/lib/api/ashley-factories'

// Best-effort revoke the Ashley session, then clear local Ashley cookies.
// Always succeeds — if Ashley is unreachable, the lingering server-side
// session expires on its own TTL. We never block local logout on Ashley.
async function revokeAshleySession(): Promise<void> {
  const accessToken = await getAshleyAccessCookie()
  if (accessToken) {
    try {
      const ashley = createAshleyUserClient(accessToken)
      await ashley.POST('/api/auth/logout')
    } catch (error) {
      console.warn('Ashley logout failed (continuing):', error)
    }
  }
  await clearAshleyCookies()
}

// Shared by /api/auth/logout (POST) and the /auth/logout page server render.
// Extracted so the page doesn't HTTP-self-call its own API route.
export async function performLogout(): Promise<void> {
  await revokeAshleySession()
  await clearSessionCookie()
}
