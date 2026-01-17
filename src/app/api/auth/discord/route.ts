import { NextResponse } from 'next/server'
import { getDiscordOAuthUrl, setOAuthStateCookie } from '@/lib/auth'

export async function GET() {
  // Generate a random state for CSRF protection
  const state = crypto.randomUUID()

  // Store state in HTTP-only cookie
  await setOAuthStateCookie(state)

  // Redirect to Discord OAuth
  const authUrl = getDiscordOAuthUrl(state)
  return NextResponse.redirect(authUrl)
}
