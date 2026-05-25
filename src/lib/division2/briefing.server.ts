import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchAshleyService, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { coerceAuthors, coerceString, coerceUrl } from './_coerce'

/**
 * Content briefing read helpers (service-identity Ashley calls, X-API-Key only).
 *
 * Two endpoints back this:
 *   - GET /api/content/digests           — list (no body / no articles)
 *   - GET /api/content/digests/{id}      — detail (full markdown + cited articles)
 *
 * "A week" is whatever Ashley declares via the weekly briefing's `periodStart` /
 * `periodEnd` — we never compute ISO-week boundaries ourselves. The list
 * endpoint can't filter by date, so per-week daily fetches pull a recent
 * window and filter client-side.
 *
 * TTLs (cache hit-rate vs. freshness):
 *   - list current period       → 10 min
 *   - list older period         → 24 hr
 *   - detail                    → 24 hr (content is immutable post-publish)
 */

// "Briefing" is our domain word; "Digest" is Ashley's OpenAPI DTO name.
// Coerce Raw* (Ashley) → Briefing* (ours) at this boundary.
type RawDigest = components['schemas']['ContentDigestDto']
type RawDigestList = components['schemas']['ContentDigestListDto']
type RawDigestDetail = components['schemas']['ContentDigestDetailDto']
type RawDigestArticle = components['schemas']['ContentDigestArticleDto']

export type BriefingFrequency = 'daily' | 'weekly'

export interface Briefing {
  id: string
  topic: string
  frequency: BriefingFrequency
  /** ISO date — first day this briefing covers. */
  periodStart: string
  /** ISO date — last day this briefing covers (inclusive). */
  periodEnd: string
  title: string
  perex: string
  highlights: string[]
  thumbnailUrl: string | null
  articleCount: number
  articleIds: string[]
  createdAt: string
  updatedAt: string
}

export interface BriefingArticle {
  id: string
  title: string
  source: string
  url: string | null
  publishedAt: string
  thumbnailUrl: string | null
  authors: string[]
  aiSummary: string | null
  contentType: string | null
}

export interface BriefingDetail extends Briefing {
  /** Markdown body, with `(ref:UUID)` citation markers. */
  content: string
  /** Hydrated cited articles, ordered by relevance desc. */
  articles: BriefingArticle[]
}

export interface BriefingList {
  items: Briefing[]
  total: number
  limit: number
  offset: number
}

const HOT_TTL = 10 * 60
const WARM_TTL = 24 * 60 * 60
const DETAIL_TTL = 24 * 60 * 60
const TOPIC = 'division-2'

const VALID_FREQUENCIES = new Set<BriefingFrequency>(['daily', 'weekly'])

function coerceFrequency(value: unknown): BriefingFrequency | null {
  if (typeof value !== 'string') return null
  const lower = value.toLowerCase()
  return VALID_FREQUENCIES.has(lower as BriefingFrequency)
    ? (lower as BriefingFrequency)
    : null
}

/** Ashley sometimes returns periods as full ISO datetimes — collapse to a
 *  pure `YYYY-MM-DD` so all downstream date helpers (week number, weekday,
 *  age, formatted labels) work off the same shape. */
function toDateKey(value: string): string {
  if (typeof value !== 'string') return ''
  // Already in YYYY-MM-DD shape? Keep as-is.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  // Slice the date portion of any ISO datetime.
  const sliced = value.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) return sliced
  // Last resort — let Date parse and re-serialize.
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

/** Returns null when the briefing is unusable (missing id, period, frequency). */
function normalizeBriefing(raw: RawDigest): Briefing | null {
  if (!raw.id || !raw.periodStart || !raw.periodEnd) return null
  const frequency = coerceFrequency(raw.frequency)
  if (!frequency) return null

  return {
    id: raw.id,
    topic: raw.topic,
    frequency,
    periodStart: toDateKey(raw.periodStart),
    periodEnd: toDateKey(raw.periodEnd),
    title: raw.title,
    perex: raw.perex,
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights.filter((h): h is string => typeof h === 'string')
      : [],
    thumbnailUrl: coerceUrl(raw.thumbnailUrl),
    articleCount: typeof raw.articleCount === 'number' ? raw.articleCount : 0,
    articleIds: Array.isArray(raw.articleIds)
      ? raw.articleIds.filter((a): a is string => typeof a === 'string')
      : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function normalizeArticle(raw: RawDigestArticle): BriefingArticle | null {
  if (!raw.id || !raw.title) return null
  return {
    id: raw.id,
    title: raw.title,
    source: typeof raw.source === 'string' ? raw.source.toUpperCase() : '',
    url: coerceUrl(raw.url),
    publishedAt: raw.publishedAt,
    thumbnailUrl: coerceUrl(raw.thumbnailUrl),
    authors: coerceAuthors(raw.authors),
    aiSummary: coerceString(raw.aiSummary),
    contentType: coerceString(raw.contentType),
  }
}

function normalizeBriefingDetail(raw: RawDigestDetail): BriefingDetail | null {
  // The detail DTO doesn't surface `articleIds` — synthesize from `articles[]`.
  const base = normalizeBriefing({
    ...raw,
    articleIds: (raw.articles ?? []).map((a) => a.id),
  })
  if (!base) return null
  const articles = (raw.articles ?? [])
    .map(normalizeArticle)
    .filter((a): a is BriefingArticle => a !== null)
  return {
    ...base,
    content: typeof raw.content === 'string' ? raw.content : '',
    articles,
  }
}

function normalizeList(raw: RawDigestList): BriefingList {
  const seen = new Set<string>()
  const items: Briefing[] = []
  for (const rawItem of raw.items ?? []) {
    const briefing = normalizeBriefing(rawItem)
    if (!briefing) continue
    if (seen.has(briefing.id)) continue
    seen.add(briefing.id)
    items.push(briefing)
  }
  return {
    items,
    total: raw.total ?? 0,
    limit: raw.limit ?? items.length,
    offset: raw.offset ?? 0,
  }
}

interface FetchListArgs {
  limit?: number
  offset?: number
}

/**
 * Fetch the weekly briefing archive for Division 2. Drives the week-stepper
 * on the list page plus the cross-frequency prev/next on detail.
 */
export function fetchWeeklyBriefings({
  limit = 20,
  offset = 0,
}: FetchListArgs = {}): Promise<AshleyResult<BriefingList>> {
  const ttl = offset === 0 ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<BriefingList>> => {
      const result = await fetchAshleyService<RawDigestList>((c) =>
        c.GET('/api/content/digests', {
          params: {
            query: { topic: TOPIC, frequency: 'weekly', limit, offset },
          },
        }),
      )
      if (!result.ok) return result
      return { ok: true, data: normalizeList(result.data) }
    },
    ['division2-briefing-weekly', String(offset), String(limit)],
    { revalidate: ttl, tags: ['briefing', 'briefing-list'] },
  )
  return cached()
}

interface FetchDailyForWeekArgs {
  /** Week's periodStart (ISO date). Identifies the cache row + filter range. */
  periodStart: string
  /** Week's periodEnd (ISO date, exclusive — first day of the next week). */
  periodEnd: string
}

/**
 * Fetch the most recent N daily briefings (no date filter). Drives the
 * SEC_03 booster peek on the `/division-2` landing page where we just want
 * the latest few dailies regardless of which week they fall in.
 */
export function fetchRecentDailyBriefings({
  limit = 3,
}: { limit?: number } = {}): Promise<AshleyResult<Briefing[]>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Briefing[]>> => {
      const result = await fetchAshleyService<RawDigestList>((c) =>
        c.GET('/api/content/digests', {
          params: {
            query: { topic: TOPIC, frequency: 'daily', limit, offset: 0 },
          },
        }),
      )
      if (!result.ok) return result
      return { ok: true, data: normalizeList(result.data).items }
    },
    ['division2-briefing-daily-recent', String(limit)],
    { revalidate: HOT_TTL, tags: ['briefing', 'briefing-list'] },
  )
  return cached()
}

/**
 * Fetch the daily briefings covering a given week.
 *
 * Ashley's list endpoint can't filter by date, so we pull the most recent 30
 * dailies and filter client-side by periodStart ∈ [periodStart, periodEnd].
 * Adequate for the front-of-archive use cases — deep history will need an
 * offset hint later.
 */
export function fetchDailyBriefingsForWeek({
  periodStart,
  periodEnd,
}: FetchDailyForWeekArgs): Promise<AshleyResult<Briefing[]>> {
  const ttl = isCurrentOrFuture(periodEnd) ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Briefing[]>> => {
      const result = await fetchAshleyService<RawDigestList>((c) =>
        c.GET('/api/content/digests', {
          params: {
            query: { topic: TOPIC, frequency: 'daily', limit: 30, offset: 0 },
          },
        }),
      )
      if (!result.ok) return result
      const all = normalizeList(result.data).items
      // Half-open `[start, end)` — Ashley stores periodEnd as the *start*
      // of the next week (e.g. May 11→18 covers Mon May 11–Sun May 17).
      // Inclusive on both ends would double-count the boundary daily.
      const filtered = all
        .filter((d) => d.periodStart >= periodStart && d.periodStart < periodEnd)
        .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
      return { ok: true, data: filtered }
    },
    ['division2-briefing-daily-week', periodStart],
    {
      revalidate: ttl,
      tags: ['briefing', 'briefing-list', `briefing-week-${periodStart}`],
    },
  )
  return cached()
}

/**
 * Fetch a single briefing by UUID with hydrated cited articles. Used by the
 * detail page.
 */
export function fetchBriefingById(
  id: string,
): Promise<AshleyResult<BriefingDetail | null>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<BriefingDetail | null>> => {
      const result = await fetchAshleyService<RawDigestDetail>((c) =>
        c.GET('/api/content/digests/{id}', { params: { path: { id } } }),
      )
      if (!result.ok) return result
      return { ok: true, data: normalizeBriefingDetail(result.data) }
    },
    ['division2-briefing-detail', id],
    { revalidate: DETAIL_TTL, tags: ['briefing', 'briefing-detail', `briefing-${id}`] },
  )
  return cached()
}

/**
 * Fetch a recent slice of both daily + weekly briefings, merged + sorted by
 * periodStart desc. Used by the detail page to compute chronological
 * prev/next across frequencies without an extra round-trip per click.
 */
export async function fetchRecentBriefings(
  limit = 30,
): Promise<AshleyResult<Briefing[]>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Briefing[]>> => {
      const [weekly, daily] = await Promise.all([
        fetchAshleyService<RawDigestList>((c) =>
          c.GET('/api/content/digests', {
            params: {
              query: { topic: TOPIC, frequency: 'weekly', limit, offset: 0 },
            },
          }),
        ),
        fetchAshleyService<RawDigestList>((c) =>
          c.GET('/api/content/digests', {
            params: {
              query: { topic: TOPIC, frequency: 'daily', limit, offset: 0 },
            },
          }),
        ),
      ])
      if (!weekly.ok) return weekly
      if (!daily.ok) return daily
      const merged = [
        ...normalizeList(weekly.data).items,
        ...normalizeList(daily.data).items,
      ].sort((a, b) => b.periodStart.localeCompare(a.periodStart))
      return { ok: true, data: merged }
    },
    ['division2-briefing-recent', String(limit)],
    { revalidate: HOT_TTL, tags: ['briefing', 'briefing-list'] },
  )
  return cached()
}

/** Validate `?week=YYYY-MM-DD` query parameter — returns the value or null. */
export function parseWeekParam(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  return value
}

/** True when an ISO date is today or later (UTC). Drives TTL selection. */
function isCurrentOrFuture(isoDate: string): boolean {
  if (!isoDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return isoDate >= today
}

/* ── Detail-page derived helpers ─────────────────────────────────────────── */

import type { ReaderSection } from '@/lib/content/markdown-sections'

/**
 * Back-compat alias — section shape moved to `@/lib/content/markdown-sections`
 * so blog articles can share the same ToC/anchor pipeline. New code should
 * import `ReaderSection` directly.
 */
export type BriefingSection = ReaderSection

/**
 * Build the short doc-designator that drives the breadcrumb tail and doc-strip
 * code. Weekly briefings get an ISO-week tag (`WK17_2026`), daily get a date tag
 * (`D_2026-04-21`). Falls back to the briefing id slice when the period is
 * malformed.
 */
export function buildBriefingDesignator(briefing: Briefing): string {
  if (briefing.frequency === 'weekly') {
    const week = isoWeekNumber(briefing.periodStart)
    const year = briefing.periodStart.slice(0, 4)
    if (week && year) return `WK${String(week).padStart(2, '0')}_${year}`
  } else if (briefing.frequency === 'daily') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(briefing.periodStart)) {
      return `D_${briefing.periodStart}`
    }
  }
  return `BRF_${briefing.id.slice(0, 8).toUpperCase()}`
}

/**
 * ISO 8601 week number for a `YYYY-MM-DD` date. Returns null on parse failure.
 * Week 1 is the week containing the first Thursday of the year (ISO rule).
 */
function isoWeekNumber(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const d = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return null
  // Shift to the Thursday of the current week — ISO weeks are Thursday-anchored.
  const dayNum = (d.getUTCDay() + 6) % 7 // Mon=0 ... Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3)
  const diffMs = d.getTime() - firstThursday.getTime()
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
}

// The promote/enumerate/inject/word-count helpers moved to
// @/lib/content/markdown-sections so blog articles can share the same
// pipeline. Re-exported below for back-compat — prefer importing from the
// new module in new code.
export {
  promoteH1ToH2,
  countMarkdownWords,
  enumerateSections,
  enumerateH2Sections,
  injectSectionAnchors,
  injectH2SectionAnchors,
} from '@/lib/content/markdown-sections'
export type {
  SectionLevel,
  EnumeratedSections,
} from '@/lib/content/markdown-sections'
