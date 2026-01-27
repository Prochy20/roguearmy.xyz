import { NextRequest, NextResponse } from 'next/server'
import { getDiscordOAuthUrl, setOAuthStateCookie, setReturnToCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Get returnTo parameter for post-login redirect
  const returnTo = request.nextUrl.searchParams.get('returnTo')

  // Store returnTo URL in cookie if provided
  if (returnTo) {
    // Validate that returnTo is a relative path (security)
    if (returnTo.startsWith('/')) {
      await setReturnToCookie(returnTo)
    }
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID()

  // Store state in HTTP-only cookie
  await setOAuthStateCookie(state)

  // Redirect to Discord OAuth
  const authUrl = getDiscordOAuthUrl(state)
  return NextResponse.redirect(authUrl)
}
