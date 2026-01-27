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
  getReturnToCookie,
  clearReturnToCookie,
} from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${appUrl}/auth/error/oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/auth/error/invalid_request`)
  }

  // Verify state for CSRF protection
  const storedState = await getOAuthStateCookie()
  await clearOAuthStateCookie()

  if (state !== storedState) {
    return NextResponse.redirect(`${appUrl}/auth/error/invalid_state`)
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get Discord user info
    const discordUser = await getDiscordUser(accessToken)

    // Get Payload instance (needed for both guild check failure and success)
    const payload = await getPayload({ config })

    // Check guild membership
    const guildMember = await getGuildMember(accessToken)

    if (!guildMember) {
      // User is not in the guild - update their status if they exist
      const existingMembers = await payload.find({
        collection: 'members',
        where: { discordId: { equals: discordUser.id } },
        limit: 1,
      })

      if (existingMembers.docs.length > 0) {
        const existingMember = existingMembers.docs[0]
        // Only update to left_server if not already banned
        if (existingMember.status !== 'banned') {
          await payload.update({
            collection: 'members',
            id: existingMember.id,
            data: { status: 'left_server' },
          })
        }
      }

      return NextResponse.redirect(`${appUrl}/auth/error/not_member`)
    }

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
          status: 'active', // Restore status if member rejoins
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
      await clearReturnToCookie()
      return NextResponse.redirect(`${appUrl}/auth/error/banned`)
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

    // Get returnTo URL and clear cookie
    const returnTo = await getReturnToCookie()
    await clearReturnToCookie()

    // Redirect to returnTo URL or default to blog
    const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : '/blog'
    return NextResponse.redirect(`${appUrl}${redirectUrl}`)
  } catch (error) {
    console.error('Discord OAuth error:', error)
    await clearReturnToCookie()
    return NextResponse.redirect(`${appUrl}/auth/error/auth_failed`)
  }
}
