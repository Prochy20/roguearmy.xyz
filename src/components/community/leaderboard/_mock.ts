import type { components } from '@/lib/api/schema'

export type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

const NAMES = [
  'AXIS',
  'ORACLE',
  'CIPHER',
  'PHANTOM',
  'NIGHTFALL',
  'PROXY',
  'KESTREL',
  'NOMAD',
  'WRAITH',
  'VECTOR',
  'OBSIDIAN',
  'HALO',
] as const

function makeEntry(rank: number, name: string, xp: number, level: number): LeaderboardEntry {
  return {
    rank,
    discordId: `1000000000000000${String(rank).padStart(2, '0')}`,
    displayName: name,
    level,
    xp,
    avatar: null,
  }
}

export const MOCK_TOP_3: LeaderboardEntry[] = [
  makeEntry(1, NAMES[0], 142000, 36),
  makeEntry(2, NAMES[1], 128400, 33),
  makeEntry(3, NAMES[2], 112800, 30),
]

export const MOCK_REST: LeaderboardEntry[] = NAMES.slice(3, 12).map((name, i) =>
  makeEntry(i + 4, name, 98000 - i * 7000, 28 - i),
)

export const MOCK_ME: LeaderboardEntry = makeEntry(7, NAMES[6], 64200, 22)

export const MOCK_AROUND_ME: LeaderboardEntry[] = NAMES.slice(4, 9).map((name, i) =>
  makeEntry(i + 5, name, 82000 - i * 4500, 26 - i),
)
