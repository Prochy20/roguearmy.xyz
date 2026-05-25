import type {
  ContentArticle,
  ContentSource,
} from '@/lib/division2/content.server'
import type {
  EscalationMission,
  EscalationLootItem,
  EscalationLootTypeRef,
  EscalationPrototypeCache,
  EscalationWeekList,
  EscalationDailySummary,
} from '@/lib/division2/escalation.server'
import type {
  Briefing,
  BriefingArticle,
  BriefingDetail,
  BriefingSection,
} from '@/lib/division2/briefing.server'
import type { AshleyResult } from '@/lib/api/server'

const NOW_ISO = '2026-05-21T10:00:00.000Z'

function mkArticle(source: ContentSource, id: string, title: string, perex: string): ContentArticle {
  return {
    id,
    source,
    sourceId: id,
    topic: 'division-2',
    publishedAt: '2026-05-20T18:00:00.000Z',
    fetchedAt: NOW_ISO,
    title,
    perex,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=60',
    url: 'https://example.com/article',
    authors: ['agent_nova'],
    tags: ['raid', 'meta'],
    contentType: 'video',
    relevance: 8,
    aiSummary: null,
    metadata: null,
  }
}

export const MOCK_CONTENT_ARTICLES: ContentArticle[] = [
  mkArticle('YOUTUBE', 'art_001', 'RAID META BREAKDOWN · WEEK 21', 'Targeting the new chest piece — full route + skill build.'),
  mkArticle('REDDIT', 'art_002', 'DAILY RAID DISCUSSION THREAD', 'Operatives report what dropped today and what stalled.'),
  mkArticle('UBISOFT', 'art_003', 'PATCH 23.5 PATCH NOTES', 'New escalation tier, brand set tuning, and bug-fix list.'),
]

export const NOW_MS = new Date(NOW_ISO).getTime()

// ── Escalation ────────────────────────────────────────────────────────────

export const MOCK_MISSIONS: EscalationMission[] = [
  { position: 0, slug: 'the-art-museum', name: 'The Art Museum' },
  { position: 1, slug: 'capitol-building', name: 'Capitol Building' },
  { position: 2, slug: 'jefferson-trade-center', name: 'Jefferson Trade Center' },
  { position: 3, slug: 'district-union-arena', name: 'District Union Arena' },
  { position: 4, slug: 'tidal-basin', name: 'Tidal Basin' },
]

const LOOT: EscalationLootItem[] = [
  { position: 0, slug: 'shotgun', name: 'Shotgun' },
  { position: 1, slug: 'assault-rifle', name: 'Assault Rifle' },
  { position: 2, slug: 'holster', name: 'Holster' },
  { position: 3, slug: 'mask', name: 'Mask' },
  { position: 4, slug: 'kneepads', name: 'Kneepads' },
]

export const MOCK_DAY_LOOT_BY_POSITION = new Map<number, EscalationLootItem>(
  LOOT.map((l) => [l.position, l]),
)

export const MOCK_PROTOTYPE_CACHES: EscalationPrototypeCache = {
  gear: { slug: 'holster', name: 'Holster' } as EscalationLootTypeRef,
  weapon: { slug: 'rifle', name: 'Rifle' } as EscalationLootTypeRef,
}

export const MOCK_DAILIES: EscalationDailySummary[] = [
  { day: '2026-05-19', fetchedAt: NOW_ISO, items: LOOT, prototypeCaches: MOCK_PROTOTYPE_CACHES },
  {
    day: '2026-05-20',
    fetchedAt: NOW_ISO,
    items: LOOT.map((l, i) => ({ ...l, name: `${l.name} v${i}` })),
    prototypeCaches: MOCK_PROTOTYPE_CACHES,
  },
  { day: '2026-05-21', fetchedAt: NOW_ISO, items: LOOT, prototypeCaches: MOCK_PROTOTYPE_CACHES },
]

export const MOCK_WEEKS_LIST_OK: AshleyResult<EscalationWeekList> = {
  ok: true,
  data: {
    items: [
      {
        weekStart: '2026-05-12',
        fetchedAt: NOW_ISO,
        missions: MOCK_MISSIONS,
        dailyCount: 7,
      },
      {
        weekStart: '2026-05-05',
        fetchedAt: NOW_ISO,
        missions: MOCK_MISSIONS,
        dailyCount: 7,
      },
    ],
    total: 2,
    limit: 10,
    offset: 0,
  },
}

export const MOCK_WEEKS_LIST_FAIL: AshleyResult<EscalationWeekList> = {
  ok: false,
  error: { code: 'unavailable', status: 503 },
}

// ── Briefing ──────────────────────────────────────────────────────────────

export const MOCK_BRIEFING_WEEKLY: Briefing = {
  id: 'brf_weekly_20260519',
  topic: 'division-2',
  frequency: 'weekly',
  periodStart: '2026-05-19',
  periodEnd: '2026-05-25',
  title: 'WEEK 21 · ESCALATION ROLL-UP',
  perex:
    'Five missions, new vendor prototype caches, and the meta shift to AR-friendly builds. Ashley collated 14 sources this week.',
  highlights: [
    'Tidal Basin remains the top XP-per-hour run for the third week in a row.',
    'Vendor cache rotated to Holster + Rifle — Friday slot is the best window.',
    'Patch 23.5 dropped — brand set tuning favors backline marksman roles.',
    'Operatives reported a 12% completion bump on Capitol after the route fix.',
  ],
  thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70',
  articleCount: 14,
  articleIds: ['art_001', 'art_002', 'art_003'],
  createdAt: '2026-05-26T08:00:00.000Z',
  updatedAt: '2026-05-26T09:00:00.000Z',
}

export const MOCK_BRIEFING_DAILY: Briefing = {
  ...MOCK_BRIEFING_WEEKLY,
  id: 'brf_daily_20260521',
  frequency: 'daily',
  periodStart: '2026-05-21',
  periodEnd: '2026-05-21',
  title: 'DAILY · BRIEFING 05-21',
  perex: 'Mid-week status: Capitol pacing well, Tidal Basin still farms hardest.',
  highlights: [
    'Capitol still the most efficient farm before resets.',
    'Two new YouTube guides on the Holster cache showed up overnight.',
  ],
  articleCount: 5,
}

export const MOCK_BRIEFING_ARTICLES: BriefingArticle[] = [
  {
    id: 'art_001',
    title: 'Raid Meta Breakdown · Week 21',
    source: 'YOUTUBE',
    url: 'https://example.com/yt',
    publishedAt: '2026-05-23T14:00:00.000Z',
    thumbnailUrl: null,
    authors: ['agent_nova'],
    aiSummary: 'AR builds beat SMG builds on Tidal Basin this week.',
    contentType: 'video',
  },
  {
    id: 'art_002',
    title: 'Daily raid discussion thread',
    source: 'REDDIT',
    url: 'https://reddit.com/r/division2/abc',
    publishedAt: '2026-05-22T08:00:00.000Z',
    thumbnailUrl: null,
    authors: ['r/thedivision2'],
    aiSummary: null,
    contentType: 'discussion',
  },
  {
    id: 'art_003',
    title: 'Patch 23.5 notes',
    source: 'UBISOFT',
    url: 'https://ubisoft.com/notes',
    publishedAt: '2026-05-20T16:00:00.000Z',
    thumbnailUrl: null,
    authors: ['Massive Entertainment'],
    aiSummary: null,
    contentType: 'patch-notes',
  },
]

export const MOCK_BRIEFING_DETAIL: BriefingDetail = {
  ...MOCK_BRIEFING_WEEKLY,
  content: `## Highlights\n\nThis week was about consolidation.\n\n## Vendor Rotation\n\nProtocol vendor swapped to Holster + Rifle slots.\n`,
  articles: MOCK_BRIEFING_ARTICLES,
}

export const MOCK_BRIEFING_SECTIONS: BriefingSection[] = [
  { num: 1, numLabel: '01', text: 'Highlights', id: 'sec-01' },
  { num: 2, numLabel: '02', text: 'Vendor Rotation', id: 'sec-02' },
  { num: 3, numLabel: '03', text: 'Mission Pacing', id: 'sec-03' },
]
