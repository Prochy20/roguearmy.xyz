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

import type { PrimaryBadge } from './badges'

export interface MemberSession {
  memberId: string
  discordId: string
  username: string
  globalName: string | null
  avatar: string | null
  /**
   * Snapshot of the user's primary badge at JWT issue time. Refreshed on
   * login (max 7d staleness). Authoritative badge for the menu chrome only;
   * the profile page reads fresh values from the DB via getMemberAuth.
   */
  primaryBadge: PrimaryBadge
  /**
   * Whether to render the BOOSTER decoration *alongside* the primary badge.
   * Only true when the user has BOOSTER and a competing functional badge.
   */
  isBooster: boolean
  exp: number
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  member: MemberSession | null
}
