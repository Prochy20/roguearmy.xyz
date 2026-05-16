export interface StaffProfile {
  discordId: string
  roleTitle: string
  bio: string | null
  isPublic: boolean
  order: number
  cached_username: string | null
  cached_displayName: string
  cached_avatarUrl: string | null
  cached_at: string
}

export type StaffAccent = 'green' | 'cyan' | 'magenta'
