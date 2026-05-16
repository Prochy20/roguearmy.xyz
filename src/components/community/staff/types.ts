export interface StaffProfile {
  discordId: string
  roleTitle: string
  bio: string | null
  isPublic: boolean
  order: number
  /** Editorial accent. null = use the deterministic hash-based default. */
  accent: StaffAccent | null
  cached_username: string | null
  cached_displayName: string
  cached_avatarUrl: string | null
  cached_joinedAt: string | null
  cached_accountCreatedAt: string | null
  cached_at: string
}

export type StaffAccent = 'green' | 'cyan' | 'magenta'
