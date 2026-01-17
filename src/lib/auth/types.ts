export interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
  email?: string
}

export interface DiscordGuildMember {
  nick: string | null
  roles: string[]
  joined_at: string
}

export interface MemberSession {
  memberId: string
  discordId: string
  username: string
  globalName: string | null
  avatar: string | null
  exp: number
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  member: MemberSession | null
}
