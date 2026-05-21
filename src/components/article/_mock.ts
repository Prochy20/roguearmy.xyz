import type { Article } from '@/lib/articles'

const HERO = {
  url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70',
  alt: 'Neon-lit cyberpunk city skyline',
}

const HERO_ALT = {
  url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=70',
  alt: 'Arcade machines glowing in the dark',
}

export const MOCK_ARTICLE: Article = {
  id: 'art_001',
  slug: 'agent-bootstrap-handbook',
  title: 'AGENT BOOTSTRAP HANDBOOK',
  perex:
    'A field guide to onboarding into the Rogue Army stack — covers handshakes, telemetry channels, and the dossier protocol used by every operator.',
  heroImage: HERO,
  topic: { id: 'top_ops', slug: 'ops', name: 'OPS', tint: 'green' },
  games: [{ id: 'g_div2', name: 'The Division 2', tint: 'orange' }],
  contentType: { id: 'ct_guide', slug: 'guide', name: 'Guide' },
  publishedAt: new Date('2026-03-12T10:00:00Z'),
  readingTime: 7,
  contentSource: { type: 'payload' },
  visibility: 'public',
}

export const MOCK_ARTICLE_CYAN: Article = {
  ...MOCK_ARTICLE,
  id: 'art_002',
  slug: 'shadow-protocol',
  title: 'SHADOW PROTOCOL // CIPHER',
  perex: 'Decoding the cipher pattern Ashley uses to authenticate inbound dossier requests.',
  heroImage: HERO_ALT,
  topic: { id: 'top_sec', slug: 'security', name: 'SECURITY', tint: 'cyan' },
  contentType: { id: 'ct_brief', slug: 'briefing', name: 'Briefing' },
  publishedAt: new Date('2026-04-01T09:30:00Z'),
  readingTime: 14,
}

export const MOCK_ARTICLE_MAGENTA: Article = {
  ...MOCK_ARTICLE,
  id: 'art_003',
  slug: 'pulse-check',
  title: 'PULSE CHECK 2026 Q2',
  perex: 'Quarterly state of the lobby — uptime, raid completion, and where staffing is leaning.',
  topic: { id: 'top_meta', slug: 'meta', name: 'META', tint: 'magenta' },
  games: [],
  contentType: { id: 'ct_report', slug: 'report', name: 'Report' },
  publishedAt: new Date('2026-04-22T16:00:00Z'),
  readingTime: 3,
  visibility: 'members_only',
}

export const MOCK_ARTICLES: Article[] = [MOCK_ARTICLE, MOCK_ARTICLE_CYAN, MOCK_ARTICLE_MAGENTA]

export const MOCK_PROGRESS_IN_PROGRESS = { progress: 42, completed: false }
export const MOCK_PROGRESS_COMPLETED = { progress: 100, completed: true }
export const MOCK_PROGRESS_UNREAD = { progress: 0, completed: false }
