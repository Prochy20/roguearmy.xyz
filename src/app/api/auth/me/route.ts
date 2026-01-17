import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSessionCookie, verifyMemberToken } from '@/lib/auth'

export async function GET() {
  const token = await getSessionCookie()

  if (!token) {
    return NextResponse.json({ authenticated: false, member: null })
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return NextResponse.json({ authenticated: false, member: null })
  }

  // Verify member is still active and still a valid user
  const payload = await getPayload({ config })

  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member || member.status === 'banned') {
      return NextResponse.json({ authenticated: false, member: null })
    }

    return NextResponse.json({
      authenticated: true,
      member: {
        id: member.id,
        discordId: member.discordId,
        username: member.username,
        globalName: member.globalName,
        avatar: member.avatar,
      },
    })
  } catch {
    return NextResponse.json({ authenticated: false, member: null })
  }
}
