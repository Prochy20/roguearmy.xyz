import type { DiscordUser, DiscordGuildMember } from './types'

const DISCORD_API_BASE = 'https://discord.com/api/v10'
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!

export function getDiscordOAuthUrl(state: string): string {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord-callback`
  const scopes = ['identify', 'email', 'guilds.members.read']

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
  })

  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord-callback`

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return response.json()
}

export async function getGuildMember(accessToken: string): Promise<DiscordGuildMember | null> {
  const response = await fetch(
    `${DISCORD_API_BASE}/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 404) {
    return null // Not a member of the guild
  }

  if (!response.ok) {
    throw new Error('Failed to fetch guild member')
  }

  return response.json()
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string | null): string {
  if (!avatarHash) {
    // Default Discord avatar
    const defaultAvatarIndex = Number(BigInt(userId) >> BigInt(22)) % 6
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
  }
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}`
}
