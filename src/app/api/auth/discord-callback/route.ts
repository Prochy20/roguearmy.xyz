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
  setAshleyTokens,
} from '@/lib/auth'
import { getAshleyServiceClient, createAshleyUserClient } from '@/lib/api/ashley-factories'
import {
  hasBoosterDecoration,
  isQuarantined,
  normalizeSymbolicRoles,
  pickPrimaryBadge,
  type SymbolicRole,
} from '@/lib/auth/badges'

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

    // Get Discord user info — needed before parallelism (existing-members
    // lookup depends on discordUser.id).
    const discordUser = await getDiscordUser(accessToken)

    // Fan out three independent network/DB calls. All three depend only on
    // accessToken or discordUser.id, both already resolved. This collapses
    // ~3 sequential round-trips (~600ms typical) into one (~200ms typical).
    //   - guildMember:  Discord guild membership check (gating decision)
    //   - ashleyLogin:  best-effort Ashley session exchange (soft-fail)
    //   - existingMembers: existing-row lookup (used by both guild branches)
    const payload = await getPayload({ config })
    const guildMemberPromise = getGuildMember(accessToken)
    const ashleyLoginPromise: Promise<{ accessToken: string; refreshToken: string } | null> =
      (async () => {
        try {
          const ashley = getAshleyServiceClient()
          const { data } = await ashley.POST('/api/auth/login', {
            body: { discordAccessToken: accessToken },
          })
          return data ?? null
        } catch (err) {
          console.warn('Ashley login failed during Discord callback:', err)
          return null
        }
      })()
    const existingMembersPromise = payload.find({
      collection: 'members',
      where: { discordId: { equals: discordUser.id } },
      limit: 1,
    })

    // Resolve guild membership first — it's the gating decision.
    const guildMember = await guildMemberPromise

    if (!guildMember) {
      // User is not in the guild - update their status if they exist
      const existingMembers = await existingMembersPromise

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

    // Resolve Ashley login. Soft-fail by design — local login already succeeded,
    // and failing here would block the entire site over an Ashley outage. Users
    // who land here with no Ashley cookies must re-login once Ashley is up
    // (we don't have a Discord refresh token to retry later).
    const ashleyTokens = await ashleyLoginPromise
    let ashleyAccessToken: string | null = null
    if (ashleyTokens) {
      await setAshleyTokens(ashleyTokens.accessToken, ashleyTokens.refreshToken)
      ashleyAccessToken = ashleyTokens.accessToken
    } else {
      console.warn('Ashley login returned no tokens — continuing without Ashley session')
    }

    // Pull symbolic roles up-front so first-login users get correct badges
    // and quarantine takes effect immediately. Soft-fail: if Ashley is down,
    // we leave symbolic roles empty — the TTL refresh inside getMemberAuth
    // will backfill on the next page load.
    let symbolicRoles: SymbolicRole[] = []
    let symbolicRolesSyncedAt: string | null = null
    if (ashleyAccessToken) {
      try {
        const userClient = createAshleyUserClient(ashleyAccessToken)
        const { data: ashleyMe } = await userClient.GET('/api/auth/me')
        if (ashleyMe?.user?.roles) {
          symbolicRoles = normalizeSymbolicRoles(ashleyMe.user.roles)
          symbolicRolesSyncedAt = new Date().toISOString()
        }
      } catch (ashleyMeError) {
        console.warn('Ashley /api/auth/me failed during callback:', ashleyMeError)
      }
    }

    // Resolve the existing-member lookup that's been in flight since the start.
    const existingMembers = await existingMembersPromise

    const now = new Date().toISOString()
    let member

    // Compute the status the member should have *after* this login. QUARANTINE
    // wins; otherwise we restore to 'active' (covers a previously-quarantined
    // user who's had the role removed in Discord).
    const quarantined = isQuarantined(symbolicRoles)
    const desiredStatus: 'active' | 'banned' = quarantined ? 'banned' : 'active'

    const guildMemberData = {
      nickname: guildMember.nick,
      roles: guildMember.roles,
      joinedDiscordAt: guildMember.joined_at,
      // Only persist the symbolic snapshot if we actually got one — we never
      // want to overwrite a previously-good snapshot with [] just because
      // Ashley happened to be down at this moment.
      ...(symbolicRolesSyncedAt
        ? {
            symbolicRoles,
            rolesSyncedAt: symbolicRolesSyncedAt,
            rolesSyncFailedAt: null,
          }
        : {}),
    }

    if (existingMembers.docs.length > 0) {
      member = await payload.update({
        collection: 'members',
        id: existingMembers.docs[0].id,
        data: {
          username: discordUser.username,
          globalName: discordUser.global_name,
          avatar: discordUser.avatar,
          email: discordUser.email,
          guildMember: guildMemberData,
          lastLogin: now,
          status: desiredStatus,
        },
      })
    } else {
      member = await payload.create({
        collection: 'members',
        data: {
          discordId: discordUser.id,
          username: discordUser.username,
          globalName: discordUser.global_name,
          avatar: discordUser.avatar,
          email: discordUser.email,
          guildMember: guildMemberData,
          joinedAt: now,
          lastLogin: now,
          status: desiredStatus,
        },
      })
    }

    // Check if member is banned (covers QUARANTINE detected above)
    if (member.status === 'banned') {
      await clearReturnToCookie()
      return NextResponse.redirect(`${appUrl}/auth/error/banned`)
    }

    // Create JWT session — badge ride-along for cheap chrome rendering.
    const primaryBadge = pickPrimaryBadge(symbolicRoles)
    const isBooster = hasBoosterDecoration(symbolicRoles)
    const token = await signMemberToken({
      memberId: String(member.id),
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
      primaryBadge,
      isBooster,
    })

    // Set session cookie
    await setSessionCookie(token)

    // Get returnTo URL and clear cookie
    const returnTo = await getReturnToCookie()
    await clearReturnToCookie()

    // Redirect to returnTo URL or default to the operative file
    const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : '/me'
    return NextResponse.redirect(`${appUrl}${redirectUrl}`)
  } catch (error) {
    console.error('Discord OAuth error:', error)
    await clearReturnToCookie()
    return NextResponse.redirect(`${appUrl}/auth/error/auth_failed`)
  }
}
