import { NextResponse } from 'next/server'
import {
  clearSessionCookie,
  clearAshleyCookies,
  getAshleyAccessCookie,
} from '@/lib/auth'
import { createAshleyUserClient } from '@/lib/api/client'

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

export async function POST() {
  await revokeAshleySession()
  await clearSessionCookie()

  return NextResponse.json({ success: true })
}

export async function GET() {
  await revokeAshleySession()
  await clearSessionCookie()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return NextResponse.redirect(`${appUrl}/blog`)
}
