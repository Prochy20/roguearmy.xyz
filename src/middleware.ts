import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const INTERNAL_PATHS = ['/brand', '/twitch']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (INTERNAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }
}

export const config = {
  matcher: ['/brand/:path*', '/twitch/:path*'],
}
