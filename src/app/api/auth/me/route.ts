import { NextResponse } from 'next/server'
import { getMemberAuth } from '@/lib/auth/session.server'

export async function GET() {
  const auth = await getMemberAuth()

  if (!auth.authenticated || !auth.member) {
    return NextResponse.json({ authenticated: false, member: null })
  }

  return NextResponse.json({
    authenticated: true,
    member: {
      id: auth.memberId,
      discordId: auth.member.discordId,
      username: auth.member.username,
      globalName: auth.member.globalName,
      avatar: auth.member.avatar,
      primaryBadge: auth.primaryBadge,
      isBooster: auth.isBooster,
    },
  })
}
