import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  exchangeCodeForToken,
  getDiscordUser,
  getGuildMember,
  getOAuthStateCookie,
  clearOAuthStateCookie,
  setSessionCookie,
  signMemberToken,
} from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${appUrl}/members?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/members?error=invalid_request`)
  }

  // Verify state for CSRF protection
  const storedState = await getOAuthStateCookie()
  await clearOAuthStateCookie()

  if (state !== storedState) {
    return NextResponse.redirect(`${appUrl}/members?error=invalid_state`)
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get Discord user info
    const discordUser = await getDiscordUser(accessToken)

    // Check guild membership
    const guildMember = await getGuildMember(accessToken)

    if (!guildMember) {
      return NextResponse.redirect(`${appUrl}/members?error=not_member`)
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Find or create member
    const existingMembers = await payload.find({
      collection: 'members',
      where: {
        discordId: { equals: discordUser.id },
      },
      limit: 1,
    })

    const now = new Date().toISOString()
    let member

    if (existingMembers.docs.length > 0) {
      // Update existing member
      member = await payload.update({
        collection: 'members',
        id: existingMembers.docs[0].id,
        data: {
          username: discordUser.username,
          globalName: discordUser.global_name,
          avatar: discordUser.avatar,
          email: discordUser.email,
          guildMember: {
            nickname: guildMember.nick,
            roles: guildMember.roles,
            joinedDiscordAt: guildMember.joined_at,
          },
          lastLogin: now,
        },
      })
    } else {
      // Create new member
      member = await payload.create({
        collection: 'members',
        data: {
          discordId: discordUser.id,
          username: discordUser.username,
          globalName: discordUser.global_name,
          avatar: discordUser.avatar,
          email: discordUser.email,
          guildMember: {
            nickname: guildMember.nick,
            roles: guildMember.roles,
            joinedDiscordAt: guildMember.joined_at,
          },
          joinedAt: now,
          lastLogin: now,
          status: 'active',
        },
      })
    }

    // Check if member is banned
    if (member.status === 'banned') {
      return NextResponse.redirect(`${appUrl}/members?error=banned`)
    }

    // Create JWT session
    const token = await signMemberToken({
      memberId: String(member.id),
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
    })

    // Set session cookie
    await setSessionCookie(token)

    // Redirect to members area
    return NextResponse.redirect(`${appUrl}/members`)
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/members?error=auth_failed`)
  }
}
