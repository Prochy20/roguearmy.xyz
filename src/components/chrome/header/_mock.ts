import type { MemberSession } from '@/lib/auth/types'
import type { RoleGateMap } from '@/lib/auth/roleGate.types'

/** Fake-but-valid Discord snowflake — getDiscordAvatarUrl math depends on numeric strings. */
export const MOCK_MEMBER: MemberSession = {
  memberId: 'mbr_axis',
  discordId: '100000000000000001',
  username: 'axis',
  globalName: 'AXIS',
  avatar: null,
  primaryBadge: 'STAFF',
  isBooster: false,
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
}

export const MOCK_MEMBER_BOOSTER: MemberSession = {
  ...MOCK_MEMBER,
  memberId: 'mbr_oracle',
  discordId: '100000000000000002',
  username: 'oracle',
  globalName: 'ORACLE',
  primaryBadge: 'BOOSTER',
  isBooster: true,
}

export const MOCK_MEMBER_DEV: MemberSession = {
  ...MOCK_MEMBER,
  memberId: 'mbr_cipher',
  discordId: '100000000000000003',
  username: 'cipher',
  globalName: 'CIPHER',
  primaryBadge: 'DEVELOPER',
}

export const MOCK_ROLE_GATES: RoleGateMap = {
  division2Role: 'allowed',
}

export const MOCK_ROLE_GATES_DENIED: RoleGateMap = {
  division2Role: 'denied',
}
