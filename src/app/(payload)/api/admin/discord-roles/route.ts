import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchAshleyService } from '@/lib/api/server'

export async function GET() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return NextResponse.json({ ok: false, error: { code: 'unauthenticated' } }, { status: 401 })
  }

  const result = await fetchAshleyService((client) => client.GET('/api/community/roles'))

  if (!result.ok) {
    const status = result.error.code === 'unavailable' ? 503 : 502
    return NextResponse.json({ ok: false, error: result.error }, { status })
  }

  return NextResponse.json({ ok: true, data: result.data })
}
