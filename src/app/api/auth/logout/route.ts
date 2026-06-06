import { NextResponse } from 'next/server'
import { performLogout } from '@/lib/auth/logout'

// POST-only. The previous GET handler was a CSRF surface: any cross-site
// <img src="/api/auth/logout">, <link rel="prefetch">, or top-level
// navigation (SameSite=Lax still sends cookies) would log the visitor out.
// Removing GET closes that. See docs/refactor/phase-3-auth-bug-fixes.md.
export async function POST() {
  await performLogout()
  return NextResponse.json({ success: true })
}
