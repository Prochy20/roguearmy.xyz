import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchAshleyService, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { coerceAuthors, coerceString, coerceUrl } from './_coerce'

/**
 * Content digest read helpers (service-identity Ashley calls, X-API-Key only).
 *
 * Two endpoints back this:
 *   - GET /api/content/digests           — list (no body / no articles)
 *   - GET /api/content/digests/{id}      — detail (full markdown + cited articles)
 *
 * "A week" is whatever Ashley declares via the weekly digest's `periodStart` /
 * `periodEnd` — we never compute ISO-week boundaries ourselves. The list
 * endpoint can't filter by date, so per-week daily fetches pull a recent
 * window and filter client-side.
 *
 * TTLs (cache hit-rate vs. freshness):
 *   - list current period       → 10 min
 *   - list older period         → 24 hr
 *   - detail                    → 24 hr (content is immutable post-publish)
 */

type RawDigest = components['schemas']['ContentDigestDto']
type RawDigestList = components['schemas']['ContentDigestListDto']
type RawDigestDetail = components['schemas']['ContentDigestDetailDto']
type RawDigestArticle = components['schemas']['ContentDigestArticleDto']

export type DigestFrequency = 'daily' | 'weekly'

export interface Digest {
  id: string
  topic: string
  frequency: DigestFrequency
  /** ISO date — first day this digest covers. */
  periodStart: string
  /** ISO date — last day this digest covers (inclusive). */
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

export interface DigestArticle {
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

export interface DigestDetail extends Digest {
  /** Markdown body, with `(ref:UUID)` citation markers. */
  content: string
  /** Hydrated cited articles, ordered by relevance desc. */
  articles: DigestArticle[]
}

export interface DigestList {
  items: Digest[]
  total: number
  limit: number
  offset: number
}

const HOT_TTL = 10 * 60
const WARM_TTL = 24 * 60 * 60
const DETAIL_TTL = 24 * 60 * 60
const TOPIC = 'division-2'

const VALID_FREQUENCIES = new Set<DigestFrequency>(['daily', 'weekly'])

function coerceFrequency(value: unknown): DigestFrequency | null {
  if (typeof value !== 'string') return null
  const lower = value.toLowerCase()
  return VALID_FREQUENCIES.has(lower as DigestFrequency)
    ? (lower as DigestFrequency)
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

/** Returns null when the digest is unusable (missing id, period, frequency). */
function normalizeDigest(raw: RawDigest): Digest | null {
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

function normalizeArticle(raw: RawDigestArticle): DigestArticle | null {
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

function normalizeDigestDetail(raw: RawDigestDetail): DigestDetail | null {
  // The detail DTO doesn't surface `articleIds` — synthesize from `articles[]`.
  const base = normalizeDigest({
    ...raw,
    articleIds: (raw.articles ?? []).map((a) => a.id),
  })
  if (!base) return null
  const articles = (raw.articles ?? [])
    .map(normalizeArticle)
    .filter((a): a is DigestArticle => a !== null)
  return {
    ...base,
    content: typeof raw.content === 'string' ? raw.content : '',
    articles,
  }
}

function normalizeList(raw: RawDigestList): DigestList {
  const seen = new Set<string>()
  const items: Digest[] = []
  for (const rawItem of raw.items ?? []) {
    const digest = normalizeDigest(rawItem)
    if (!digest) continue
    if (seen.has(digest.id)) continue
    seen.add(digest.id)
    items.push(digest)
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
 * Fetch the weekly digest archive for Division 2. Drives the week-stepper
 * on the list page plus the cross-frequency prev/next on detail.
 */
export function fetchWeeklyDigests({
  limit = 20,
  offset = 0,
}: FetchListArgs = {}): Promise<AshleyResult<DigestList>> {
  const ttl = offset === 0 ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<DigestList>> => {
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
    ['division2-digest-weekly', String(offset), String(limit)],
    { revalidate: ttl, tags: ['digest', 'digest-list'] },
  )
  return cached()
}

interface FetchDailyForWeekArgs {
  /** Weekly digest's periodStart (ISO date). Identifies the cache row + filter range. */
  periodStart: string
  /** Weekly digest's periodEnd (ISO date, inclusive). */
  periodEnd: string
}

/**
 * Fetch the most recent N daily digests (no date filter). Drives the
 * SEC_03 booster peek on the `/division-2` landing page where we just want
 * the latest few dailies regardless of which week they fall in.
 */
export function fetchRecentDailyDigests({
  limit = 3,
}: { limit?: number } = {}): Promise<AshleyResult<Digest[]>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Digest[]>> => {
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
    ['division2-digest-daily-recent', String(limit)],
    { revalidate: HOT_TTL, tags: ['digest', 'digest-list'] },
  )
  return cached()
}

/**
 * Fetch the daily digests covering a given week.
 *
 * Ashley's list endpoint can't filter by date, so we pull the most recent 30
 * dailies and filter client-side by periodStart ∈ [periodStart, periodEnd].
 * Adequate for the front-of-archive use cases — deep history will need an
 * offset hint later.
 */
export function fetchDailyDigestsForWeek({
  periodStart,
  periodEnd,
}: FetchDailyForWeekArgs): Promise<AshleyResult<Digest[]>> {
  const ttl = isCurrentOrFuture(periodEnd) ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Digest[]>> => {
      const result = await fetchAshleyService<RawDigestList>((c) =>
        c.GET('/api/content/digests', {
          params: {
            query: { topic: TOPIC, frequency: 'daily', limit: 30, offset: 0 },
          },
        }),
      )
      if (!result.ok) return result
      const all = normalizeList(result.data).items
      const filtered = all
        .filter((d) => d.periodStart >= periodStart && d.periodStart <= periodEnd)
        .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
      return { ok: true, data: filtered }
    },
    ['division2-digest-daily-week', periodStart],
    {
      revalidate: ttl,
      tags: ['digest', 'digest-list', `digest-week-${periodStart}`],
    },
  )
  return cached()
}

/**
 * Fetch a single digest by UUID with hydrated cited articles. Used by the
 * detail page.
 */
export function fetchDigestById(
  id: string,
): Promise<AshleyResult<DigestDetail | null>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<DigestDetail | null>> => {
      const result = await fetchAshleyService<RawDigestDetail>((c) =>
        c.GET('/api/content/digests/{id}', { params: { path: { id } } }),
      )
      if (!result.ok) return result
      return { ok: true, data: normalizeDigestDetail(result.data) }
    },
    ['division2-digest-detail', id],
    { revalidate: DETAIL_TTL, tags: ['digest', 'digest-detail', `digest-${id}`] },
  )
  return cached()
}

/**
 * Fetch a recent slice of both daily + weekly digests, merged + sorted by
 * periodStart desc. Used by the detail page to compute chronological
 * prev/next across frequencies without an extra round-trip per click.
 */
export async function fetchRecentDigests(
  limit = 30,
): Promise<AshleyResult<Digest[]>> {
  const cached = unstable_cache(
    async (): Promise<AshleyResult<Digest[]>> => {
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
    ['division2-digest-recent', String(limit)],
    { revalidate: HOT_TTL, tags: ['digest', 'digest-list'] },
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

export interface DigestSection {
  /** 1-based section number. */
  num: number
  /** Two-digit zero-padded display ("01", "02"). */
  numLabel: string
  /** Plain heading text from the H2 line. */
  text: string
  /** DOM id used by ToC anchors and the heading element. */
  id: string
}

/**
 * Build the short doc-designator that drives the breadcrumb tail and doc-strip
 * code. Weekly digests get an ISO-week tag (`WK17_2026`), daily get a date tag
 * (`D_2026-04-21`). Falls back to the digest id slice when the period is
 * malformed.
 */
export function buildDigestDesignator(digest: Digest): string {
  if (digest.frequency === 'weekly') {
    const week = isoWeekNumber(digest.periodStart)
    const year = digest.periodStart.slice(0, 4)
    if (week && year) return `WK${String(week).padStart(2, '0')}_${year}`
  } else if (digest.frequency === 'daily') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(digest.periodStart)) {
      return `D_${digest.periodStart}`
    }
  }
  return `DGST_${digest.id.slice(0, 8).toUpperCase()}`
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

/**
 * Promote every ATX `# Heading` in the digest body to `## Heading`.
 *
 * Rationale: the page chrome (DigestTitleBlock) already renders `digest.title`
 * as the document-level H1, so any `# Heading` Ashley emits inside the body
 * should read as a top-level section, not a competing document title. By
 * pre-promoting H1 → H2, the existing section enumeration / ToC pipeline
 * picks them up naturally and the body never renders two H1s.
 *
 * Fenced-code blocks are skipped so heading-looking lines inside code samples
 * don't get rewritten.
 */
export function promoteH1ToH2(markdown: string): string {
  if (!markdown) return markdown
  const lines = markdown.split('\n')
  let inFence = false
  return lines
    .map((line) => {
      if (line.startsWith('```')) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      // `/^#\s/` matches `# Title` but NOT `## Title` (after the first `#` is
      // another `#`, not whitespace). Prepending an extra `#` produces `## …`.
      return /^#\s/.test(line) ? '#' + line : line
    })
    .join('\n')
}

/**
 * Approximate word count from rendered markdown. Strips markdown syntax
 * (heading hashes, list bullets, fences, image/link wrappers) and HTML tags
 * before splitting on whitespace. Good enough to drive a "~N min read" label;
 * a real linguistic counter would be overkill here.
 */
export function countMarkdownWords(markdown: string): number {
  if (!markdown) return 0
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+>]\s+/gm, '')
    .replace(/[*_~]+/g, '')
  return stripped.split(/\s+/).filter(Boolean).length
}

/** Heading level used to drive section enumeration. */
export type SectionLevel = 2 | 3

export interface EnumeratedSections {
  /** The level that produced these sections (h2 if any present, else h3). */
  level: SectionLevel
  sections: DigestSection[]
}

/**
 * Walk the markdown body and emit a section manifest from headings.
 *
 * Tries H2s first — that's the canonical section level for digest bodies. If
 * none exist, falls back to H3s so digests authored with `#` for title and
 * `###` for sections still get a ToC. When neither level has any headings,
 * returns an empty manifest at the default H2 level.
 *
 * Numbering is positional within the chosen level (first matching heading
 * becomes 01). Fenced-code blocks are skipped so heading-looking lines inside
 * code samples don't get enumerated.
 */
export function enumerateSections(markdown: string): EnumeratedSections {
  const h2 = enumerateHeadingsAtLevel(markdown, 2)
  if (h2.length > 0) return { level: 2, sections: h2 }
  const h3 = enumerateHeadingsAtLevel(markdown, 3)
  return { level: 3, sections: h3 }
}

/**
 * Legacy alias retained for any external callers — defers to the new
 * `enumerateSections` and returns only the H2 set (no H3 fallback). Prefer
 * `enumerateSections` for new code.
 */
export function enumerateH2Sections(markdown: string): DigestSection[] {
  return enumerateHeadingsAtLevel(markdown, 2)
}

function enumerateHeadingsAtLevel(
  markdown: string,
  level: SectionLevel,
): DigestSection[] {
  if (!markdown) return []
  const pattern =
    level === 2 ? /^##\s+(.+?)\s*#*\s*$/ : /^###\s+(.+?)\s*#*\s*$/
  const sections: DigestSection[] = []
  const lines = markdown.split('\n')
  let inFence = false
  let counter = 0
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(pattern)
    if (!match) continue
    counter++
    const num = counter
    const numLabel = String(num).padStart(2, '0')
    sections.push({
      num,
      numLabel,
      text: match[1].trim(),
      id: `sec-${numLabel}`,
    })
  }
  return sections
}

/**
 * Rewrite each section-level heading into an inline raw HTML element carrying
 * the section id and `data-sec-num` attribute. The digest's markdown renderer
 * (which already routes raw HTML through rehype-raw) then renders the
 * matching h2/h3 component with the numbered prefix chrome.
 *
 * **Blank-line padding is critical.** CommonMark's "HTML block (type 6)"
 * rule says: a line starting with `<h2` (or other block tags) opens an HTML
 * block, and that block only terminates on a *blank line*. Without blank
 * lines around our injection, the body prose on the next line gets absorbed
 * INTO the HTML block and rendered as raw text instead of going through
 * the `p` / `li` / `strong` markdown components. That's why we surround
 * the rewritten heading with empty lines before and after — it isolates
 * the HTML block so following prose is parsed as proper markdown.
 *
 * Fenced-code blocks are skipped so heading-looking lines inside code
 * samples don't get rewritten.
 */
export function injectSectionAnchors(
  markdown: string,
  sections: readonly DigestSection[],
  level: SectionLevel,
): string {
  if (sections.length === 0) return markdown
  const queue = [...sections]
  const pattern =
    level === 2 ? /^##\s+(.+?)\s*#*\s*$/ : /^###\s+(.+?)\s*#*\s*$/
  const tag = level === 2 ? 'h2' : 'h3'
  const lines = markdown.split('\n')
  let inFence = false
  const out: string[] = []
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }
    const match = line.match(pattern)
    if (!match) {
      out.push(line)
      continue
    }
    const section = queue.shift()
    if (!section) {
      out.push(line)
      continue
    }
    const escaped = escapeHtml(section.text)
    // Pad with blank lines on both sides so CommonMark treats the raw HTML
    // as a self-contained block and resumes paragraph parsing afterward.
    // Adjacent existing blank lines collapse harmlessly.
    if (out.length > 0 && out[out.length - 1] !== '') {
      out.push('')
    }
    out.push(
      `<${tag} id="${section.id}" data-sec-num="${section.numLabel}">${escaped}</${tag}>`,
    )
    out.push('')
  }
  return out.join('\n')
}

/**
 * Legacy alias for the H2-only path. Prefer `injectSectionAnchors` for new
 * callers — it accepts a `level` argument.
 */
export function injectH2SectionAnchors(
  markdown: string,
  sections: readonly DigestSection[],
): string {
  return injectSectionAnchors(markdown, sections, 2)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
