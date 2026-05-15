import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

// Fake-but-valid Discord snowflake IDs (numeric strings) so the avatar
// fallback math in getDiscordAvatarUrl works without throwing.
function mk(
  id: string,
  displayName: string,
  rank: number,
  level: number,
  xp: number,
): LeaderboardEntry {
  // Schema types username/globalName/nickname/avatar as opaque Record types
  // (the live API returns strings, but the OpenAPI types disagree). We only
  // populate the required fields; downstream code only reads displayName.
  return {
    rank,
    discordId: id,
    displayName,
    level,
    xp,
  }
}

export const MOCK_TOP3: LeaderboardEntry[] = [
  mk('100000000000000001', 'AXIS', 1, 30, 47210),
  mk('100000000000000002', 'ORACLE', 2, 28, 42100),
  mk('100000000000000003', 'CIPHER', 3, 27, 39880),
]

export const MOCK_POINT = mk('100000000000000014', 'SHRIKE', 14, 22, 12570)
export const MOCK_RELIEVED_OP = mk('100000000000000050', 'GHOST', 50, 18, 10800)

export const MOCK_REAR_GUARD = mk('100000000000000002', 'ORACLE', 2, 28, 42100)

export const MOCK_SUGGESTIONS: LeaderboardEntry[] = [
  mk('100000000000000046', 'ECHO', 46, 12, 12385),
  mk('100000000000000045', 'GLITCH', 45, 13, 12520),
  mk('100000000000000044', 'STORM', 44, 13, 12660),
]

// Used by RelievedCard suggestions — "next closest above" after the
// overtake just happened.
export const MOCK_NEXT_SUGGESTIONS: LeaderboardEntry[] = [
  mk('100000000000000048', 'EMBER', 48, 12, 12290),
  mk('100000000000000047', 'KAIROS', 47, 12, 12350),
  mk('100000000000000045', 'GLITCH', 45, 13, 12520),
]

// Full roster (top 46) for the modal demo. Generated as a believable
// distribution — top is well ahead, the bulk clusters around the caller.
function buildRoster(): LeaderboardEntry[] {
  const names = [
    'AXIS', 'ORACLE', 'CIPHER', 'NOMAD', 'PYRE', 'RAVEN', 'HUSK', 'SABLE',
    'KAIROS', 'EMBER', 'TALON', 'WRAITH', 'FROST', 'SHRIKE', 'OBSIDIAN',
    'PROTON', 'VORTEX', 'BLITZ', 'COBALT', 'MERIDIAN', 'STORM', 'GLITCH',
    'ECHO', 'NOVA', 'PULSE', 'ZEPHYR', 'CASCADE', 'KEEN', 'DRIFT', 'SIGNAL',
    'BEACON', 'HOLLOW', 'AXIOM', 'RIFT', 'GRYPHON', 'KESTREL', 'TANGENT',
    'VECTOR', 'PRISM', 'SPECTER', 'HALCYON', 'INDIGO', 'PALADIN', 'STRYKER',
    'WARDEN', 'IRONCLAD',
  ]
  // XP curve: very steep at top, flattening through the pack.
  const xpFor = (rank: number) => {
    if (rank === 1) return 47210
    if (rank === 2) return 42100
    if (rank === 3) return 39880
    if (rank <= 10) return Math.round(38000 - (rank - 3) * 2700)
    if (rank <= 20) return Math.round(19000 - (rank - 10) * 600)
    return Math.round(13000 - (rank - 20) * 30)
  }
  const levelFor = (rank: number) => {
    if (rank <= 3) return 27 + (4 - rank)
    if (rank <= 10) return 24 - (rank - 4)
    if (rank <= 25) return 18 - Math.floor((rank - 10) / 4)
    return Math.max(8, 14 - Math.floor((rank - 25) / 6))
  }
  return names.map((n, i) =>
    mk(`1000000000000${String(10000 + i).padStart(5, '0')}`, n, i + 1, levelFor(i + 1), xpFor(i + 1)),
  )
}

export const MOCK_ROSTER: LeaderboardEntry[] = buildRoster()

export const MOCK_ME = {
  rank: 47,
  level: 12,
  levelLabel: 'VETERAN',
  xp: 12340,
  xpToNextLevel: 4800,
  progress: 0.64,
  nextLevel: 13,
  nextLevelLabel: 'ELITE',
}
