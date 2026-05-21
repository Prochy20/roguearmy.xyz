import type { StaffProfile } from './types'

export const MOCK_STAFF_CYAN: StaffProfile = {
  discordId: '100000000000000010',
  roleTitle: 'OPS · MOD',
  bio: null,
  isPublic: true,
  order: 1,
  accent: 'cyan',
  cached_username: 'oracle',
  cached_displayName: 'ORACLE',
  cached_avatarUrl: null,
  cached_joinedAt: '2021-04-12T10:00:00.000Z',
  cached_accountCreatedAt: '2017-09-01T00:00:00.000Z',
  cached_at: '2026-05-21T08:00:00.000Z',
}

export const MOCK_STAFF_GREEN: StaffProfile = {
  ...MOCK_STAFF_CYAN,
  discordId: '100000000000000011',
  roleTitle: 'DEV · CORE',
  accent: 'green',
  cached_username: 'cipher',
  cached_displayName: 'CIPHER',
}

export const MOCK_STAFF_MAGENTA: StaffProfile = {
  ...MOCK_STAFF_CYAN,
  discordId: '100000000000000012',
  roleTitle: 'COMMS · MOD',
  accent: 'magenta',
  cached_username: 'axis',
  cached_displayName: 'AXIS',
}

export const MOCK_STAFF_ADMIN: StaffProfile = {
  ...MOCK_STAFF_CYAN,
  discordId: '100000000000000013',
  roleTitle: 'ADMIN',
  accent: 'admin',
  cached_username: 'phantom',
  cached_displayName: 'PHANTOM',
}

export const MOCK_STAFF_MOD: StaffProfile = {
  ...MOCK_STAFF_CYAN,
  discordId: '100000000000000014',
  roleTitle: 'MOD',
  accent: 'mod',
  cached_username: 'wraith',
  cached_displayName: 'WRAITH',
}

export const MOCK_STAFF_DEV: StaffProfile = {
  ...MOCK_STAFF_CYAN,
  discordId: '100000000000000015',
  roleTitle: 'DEV',
  accent: 'dev',
  cached_username: 'vector',
  cached_displayName: 'VECTOR',
}

export const MOCK_STAFF_ROSTER: StaffProfile[] = [
  MOCK_STAFF_CYAN,
  MOCK_STAFF_GREEN,
  MOCK_STAFF_MAGENTA,
  MOCK_STAFF_ADMIN,
  MOCK_STAFF_MOD,
  MOCK_STAFF_DEV,
]

export const MOCK_RADAR_CONTACTS = [
  { name: 'ORACLE', color: '0,255,255' },
  { name: 'CIPHER', color: '0,255,65' },
  { name: 'AXIS', color: '255,0,255' },
  { name: 'PHANTOM', color: '255,0,102' },
]

export const MOCK_LAST_SYNC = '2026-05-21T08:42:00.000Z'
