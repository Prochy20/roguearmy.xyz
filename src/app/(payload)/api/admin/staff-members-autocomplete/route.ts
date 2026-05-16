import { NextResponse, type NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchAshleyService } from '@/lib/api/server'

/**
 * Server-side proxy that lets the StaffProfiles admin picker autocomplete
 * Discord members without ever exposing the Ashley service token to the
 * browser. Auth-gated to authenticated Payload admins.
 *
 *   GET /api/admin/staff-members-autocomplete?q=name        — search by name fragment
 *   GET /api/admin/staff-members-autocomplete?ids=id1,id2   — hydrate by discordId list
 */
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return NextResponse.json({ ok: false, error: { code: 'unauthenticated' } }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') ?? undefined
  const ids = searchParams.get('ids') ?? undefined
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : 20

  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/autocomplete', {
      params: {
        query: {
          ...(q ? { q } : {}),
          ...(ids ? { ids } : {}),
          limit,
        },
      },
    }),
  )

  if (!result.ok) {
    const status = result.error.code === 'unavailable' ? 503 : 502
    return NextResponse.json({ ok: false, error: result.error }, { status })
  }

  return NextResponse.json({ ok: true, data: result.data })
}
