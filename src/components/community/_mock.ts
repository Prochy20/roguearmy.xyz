import type { AshleyError, AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import type { CommunityPage } from '@/payload-types'

export type CommunityStats = components['schemas']['CommunityStatsDto']

export const MOCK_STATS: CommunityStats = {
  totalMembers: 12480,
  joinedLast14d: 142,
  totalVoiceMinutes: 4_812_300,
  totalMessages: 1_204_500,
  generatedAt: '2026-05-20T18:42:00.000Z',
}

export const STATS_OK: AshleyResult<CommunityStats> = {
  ok: true,
  data: MOCK_STATS,
}

export const STATS_FAIL_UNAVAILABLE: AshleyResult<CommunityStats> = {
  ok: false,
  error: { code: 'unavailable', status: 503, message: 'upstream down' },
}

export const STATS_FAIL_FORBIDDEN: AshleyResult<CommunityStats> = {
  ok: false,
  error: { code: 'forbidden', status: 403 },
}

export const ERR_UNAVAILABLE: AshleyError = { code: 'unavailable', status: 503 }
export const ERR_NOT_FOUND: AshleyError = { code: 'not_found', status: 404 }
export const ERR_FORBIDDEN: AshleyError = { code: 'forbidden', status: 403 }
export const ERR_INVALID: AshleyError = { code: 'invalid', status: 422 }
export const ERR_UNKNOWN: AshleyError = { code: 'unknown' }

// ─── CMS content mocks ──────────────────────────────────────────────────
// These mirror the defaultValues defined in src/globals/CommunityPage.ts
// so Storybook renders the same surface as a fresh, unedited CMS state.

export const MOCK_HERO: CommunityPage['hero'] = {
  kicker: '// CASUAL GAMING · ADULTS · SA · UK · EU',
  breadcrumbLabel: 'Community',
  ribbonLabelMembers: 'MEMBERS',
  ribbonLabelJoined14d: 'JOINED · 14D',
  ribbonLabelTaken: 'TAKEN',
  ribbonPillLive: 'LIVE',
  ribbonPillOffline: 'OFFLINE',
  preLine: 'WE ARE',
  postLine: 'OPERATIVES',
  subline:
    'A casual gaming community for adults across South Africa, the UK, and Europe — together since 2019. No drama, no skill gates, no engagement metrics. Life’s stressful enough — your gaming shouldn’t be.',
  primaryCta: { label: 'ENLIST · DISCORD', href: 'https://dc.roguearmy.xyz' },
  secondaryCta: { label: 'SEE THE NUMBERS', href: '#sec-01' },
}

export const MOCK_PULL_STRIP: CommunityPage['pullStrip'] = {
  enabled: true,
  quote: 'BEYOND RANDOM LOBBIES.',
  caption: '// QUALITY GAMING · QUALITY PEOPLE · SINCE 2019',
}

export const MOCK_STATS_CONTENT: CommunityPage['stats'] = {
  enabled: true,
  sectionNum: '01',
  sectionEyebrow: 'LIVE METRICS',
  sectionTitle: 'BY THE NUMBERS',
  kickerLive: '// SNAPSHOT {time}',
  kickerOffline: '// SNAPSHOT UNAVAILABLE',
  statLabelMembers: 'OPERATIVES',
  statLabelJoined14d: 'JOINED · LAST 14 DAYS',
  statLabelVoice: 'MINUTES IN VOICE',
  statLabelMessages: 'CHAT MESSAGES',
  commitmentsLabel: '// STANDING COMMITMENTS',
  commitments: [
    { tone: 'green', label: '$0 · FOREVER' },
    { tone: 'cyan', label: '0 ADS · 0 DATA SOLD' },
    { tone: 'magenta', label: 'VOLUNTEER-RUN' },
  ],
}

export const MOCK_LEADERBOARD_TEASER: CommunityPage['leaderboardTeaser'] = {
  enabled: true,
  kicker: '// MEMBERS-ONLY DOSSIER',
  heading: 'RISE THROUGH\nTHE RANKS',
  body:
    'Every message, every voice minute counts toward your XP. Sign in to see where you stand on the live leaderboard — top 20, your rank, your cohort.',
  bullets: [
    { tone: 'green', label: 'LIVE XP RANKING' },
    { tone: 'cyan', label: 'TOP 20 + YOUR COHORT' },
    { tone: 'magenta', label: 'MEMBERS ONLY' },
  ],
  cta: { label: 'VIEW LEADERBOARD', href: '/leaderboard' },
  footer: '// SIGN-IN REQUIRED',
}

export const MOCK_BEYOND_LOBBIES: CommunityPage['beyondLobbies'] = {
  enabled: true,
  sectionNum: '02',
  sectionEyebrow: 'DIFFERENTIATION',
  sectionTitle: 'NOT YOUR AVERAGE LOBBY',
  kicker: '// THE INVENTORY OF DIFFERENCES',
  intro:
    'Most Discord servers are chat rooms with a member count. We’ve all been in them. Here’s the short list of things we did on purpose differently.',
  columnHeaderLeft: 'ELSEWHERE',
  columnHeaderRight: 'ROGUE ARMY',
  rows: [
    { elsewhere: 'Skill gates and tryouts', here: 'Mixed skill — show up, jump in' },
    { elsewhere: 'Engagement-bait pings', here: 'Game roles · opt in to what you play' },
    { elsewhere: 'Toxic randos drowning the chat', here: 'Mature 25+ regulars · zero tolerance for hate' },
    { elsewhere: '"Active 24/7" promises', here: 'Working adults · evenings and weekends' },
    { elsewhere: 'Algorithmic feed · ad-supported', here: 'Volunteer-run · $0, forever' },
    { elsewhere: 'Single-title gatekeeping', here: 'Game-agnostic · Division 2 to Sea of Thieves' },
    { elsewhere: 'Member-count flexing', here: 'Quality over quantity · friendship first' },
  ],
}

export const MOCK_LORE: CommunityPage['lore'] = {
  enabled: true,
  sectionNum: '03',
  sectionEyebrow: 'DOCTRINE',
  sectionTitle: 'WHY THIS EXISTS',
  kicker: '// FOUNDED ON A SHORT LIST',
  leadParagraph:
    'Rogue Army is what happens when you take adult gamers seriously. We don’t recruit for headcount, we don’t farm engagement, and we don’t pretend the chat is family. It’s not. It’s a community of people who like games, run their own lives, and choose to show up here on the evenings and weekends they actually have free.',
  bodyParagraphs: [
    {
      text: 'Started in 2019 by a small group who couldn’t find a server that wasn’t either drama-soaked or recruiting like a corporate Slack — so they built one. The bar to enter is honest: be 25-ish or older, behave like an adult regardless of age, and be willing to log off when life calls.',
    },
    {
      text: 'No vote-to-kick. No engagement bait. No bots monetizing your time. Levels exist — Newcomer through Paragon — but they’re recognition, not gates. Mods are members on rotation. The only metric that matters is whether the place still feels like ours.',
    },
  ],
  values: [
    {
      iconKey: 'shield',
      title: 'DRAMA-FREE',
      description:
        'Harassment, gatekeeping, sweatlord energy: zero tolerance. Three warnings, then out. The mod log is public.',
      tone: 'green',
    },
    {
      iconKey: 'users',
      title: 'ADULTS WITH LIVES',
      description:
        'Recommended 25+. Working hours respected. No attendance quotas, no daily-streak guilt-trips.',
      tone: 'cyan',
    },
    {
      iconKey: 'heart',
      title: 'FRIENDSHIP FIRST',
      description:
        'Member count is not a metric. We measure success by whether the place still feels like ours.',
      tone: 'magenta',
    },
  ],
  pullQuoteText:
    'You don’t need an algorithm to tell you where you belong. You need a door, a handle, and a few good people who show up.',
  pullQuoteAttribution: '// FOUNDING DOCTRINE',
}

export const MOCK_JOIN_CTA: CommunityPage['joinCta'] = {
  enabled: true,
  sectionNum: '04',
  sectionEyebrow: 'JOIN',
  sectionTitle: 'STAND THE WATCH',
  kicker: '// RECRUITMENT ORDER · OPEN STANDING',
  body:
    'The door stays open. Drop your platform and timezone in #general once you’re in — that’s the whole onboarding.',
  eligibility: [
    { tone: 'green', label: '25+' },
    { tone: 'cyan', label: 'SA · UK · EU' },
    { tone: 'green', label: 'NO SKILL FLOOR' },
    { tone: 'cyan', label: 'OPTIONAL ATTENDANCE' },
    { tone: 'magenta', label: '$0 · FOREVER' },
  ],
  primaryButton: { label: 'ENLIST · DISCORD', href: 'https://dc.roguearmy.xyz' },
  secondaryButton: { label: 'READ THE MANIFESTO', href: '/manifesto' },
  footer: '// ACCEPTING · STATUS LIVE',
}
