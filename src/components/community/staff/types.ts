import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export interface StaffProfile {
  discordId: string
  roleTitle: string
  /** Lexical richText document, or null when the editor left it empty. */
  bio: SerializedEditorState | null
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

export type StaffAccent =
  | 'green'
  | 'cyan'
  | 'magenta'
  | 'dev'
  | 'admin'
  | 'mod'
