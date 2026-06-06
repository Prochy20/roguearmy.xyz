import type { ClanCardData } from './ClansPage'
import type { ClanLeader } from './ClanLeaderSlot'

// Placeholder banner asset — /public/division2/img/_placeholder.png is the
// canonical fallback used elsewhere in the D2 image directory. Lets stories
// render without depending on the live clan emblems editors upload.
const PLACEHOLDER_BANNER = '/division2/img/_placeholder.png'

export const MOCK_LEADER_GREEN: ClanLeader = {
  discordId: '200000000000000001',
  displayName: 'MAVERICK',
  avatarUrl: null,
}

export const MOCK_LEADER_AMBER: ClanLeader = {
  discordId: '200000000000000002',
  displayName: 'PHOENIX',
  avatarUrl: null,
}

export const MOCK_LEADER_AZURE: ClanLeader = {
  discordId: '200000000000000003',
  displayName: 'CIPHER',
  avatarUrl: null,
}

export const MOCK_CLAN_RGA: ClanCardData = {
  id: 'mock-rga',
  name: 'Rogue Army SDC',
  tag: 'RGA',
  bannerUrl: PLACEHOLDER_BANNER,
  bannerAlt: 'Rogue Army SDC clan banner',
  accent: 'green',
  leader: MOCK_LEADER_GREEN,
}

export const MOCK_CLAN_SDC: ClanCardData = {
  id: 'mock-sdc',
  name: 'ShadowCompanyUK',
  tag: 'SDC',
  bannerUrl: PLACEHOLDER_BANNER,
  bannerAlt: 'ShadowCompanyUK clan banner',
  accent: 'amber',
  leader: MOCK_LEADER_AMBER,
}

export const MOCK_CLAN_RGS: ClanCardData = {
  id: 'mock-rgs',
  name: 'RogueShadowsRGS',
  tag: 'RGS',
  bannerUrl: PLACEHOLDER_BANNER,
  bannerAlt: 'RogueShadowsRGS clan banner',
  accent: 'azure',
  leader: MOCK_LEADER_AZURE,
}

export const MOCK_CLAN_ROSTER: ClanCardData[] = [
  MOCK_CLAN_RGA,
  MOCK_CLAN_SDC,
  MOCK_CLAN_RGS,
]
