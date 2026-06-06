import { NextResponse } from 'next/server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { createAshleyUserClient } from '@/lib/api/ashley-factories'
import { getMemberAuth } from '@/lib/auth/session.server'
import { isAfk } from '@/lib/auth/badges'
import { normalizeAfkRecord } from '@/components/afk/types'
import type { components } from '@/lib/api/schema'

type RawAfk = components['schemas']['AfkRecordResponseDto']

/**
 * Client-side BFF for the current member's AFK status. Wraps Ashley
 * `GET /api/afk/me` and normalizes the three response shapes the menu
 * BottomRail needs to render: active, AFK, and unresolved-but-symbolic.
 *
 * Ashley returns 200 + empty body when the user is active, 200 + record
 * when AFK. On Ashley outages we fall back to the symbolic-role snapshot
 * (mirrors `/me` page's `afkFallbackBoolean` logic).
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    return NextResponse.json(
      { afkRecord: null, fallback: false },
      { status: 401, headers: NO_STORE_HEADERS },
    )
  }

  const accessToken = await getAshleyAccessCookie()
  if (!accessToken) {
    return NextResponse.json(
      { afkRecord: null, fallback: isAfk(auth.symbolicRoles) },
      { status: 401, headers: NO_STORE_HEADERS },
    )
  }

  try {
    const client = createAshleyUserClient(accessToken)
    const { data, response } = await client.GET('/api/afk/me')
    const status = response?.status ?? 0

    if (status >= 200 && status < 300) {
      const afkRecord = data ? normalizeAfkRecord(data as RawAfk) : null
      return NextResponse.json(
        { afkRecord, fallback: false },
        { headers: NO_STORE_HEADERS },
      )
    }

    return NextResponse.json(
      { afkRecord: null, fallback: isAfk(auth.symbolicRoles) },
      { status: 503, headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      { afkRecord: null, fallback: isAfk(auth.symbolicRoles) },
      { status: 503, headers: NO_STORE_HEADERS },
    )
  }
}
