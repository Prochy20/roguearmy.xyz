import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchAshleyService, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

/**
 * Content firehose read helpers.
 *
 * Service-identity Ashley calls (X-API-Key only — no member context needed,
 * the role gate lives at the layout). Each helper wraps `fetchAshleyService`
 * in `unstable_cache` with a tiered TTL:
 *
 *   - offset === 0 ("what's new")        → 5 min
 *   - offset > 0  ("older slices")        → 60 min
 *
 * The cache key version-suffix (`-r3-d2`) bakes the minRelevance floor and
 * topic into the key, so future tuning automatically invalidates entries.
 *
 * The data layer is also the boundary where we *normalize* Ashley's article
 * shape. The generated OpenAPI declares `url`, `thumbnailUrl`, `perex`, etc.
 * as `Record<string, never>` (almost certainly a generator bug — these are
 * nullable strings in live data). The normalizer defensively coerces every
 * unknown-shape field and drops articles where `url` is unrecoverable.
 *
 * Consumers receive the local `ContentArticle` / `ContentList` types, not
 * the raw DTOs — this keeps downstream code typed against the stable shape
 * even if Ashley's generator output changes.
 */

type RawArticle = components['schemas']['ContentArticleDto']
type RawList = components['schemas']['ContentListDto']

export type ContentSource = 'UBISOFT' | 'REDDIT' | 'YOUTUBE'

/** Normalized article shape — what the rest of the codebase consumes. */
export interface ContentArticle {
  id: string
  source: ContentSource
  sourceId: string
  topic: string
  publishedAt: string
  fetchedAt: string
  title: string
  perex: string | null
  thumbnailUrl: string | null
  /** Original URL — never null (articles with unrecoverable URLs are dropped). */
  url: string
  authors: string[]
  tags: string[]
  contentType: string | null
  relevance: number | null
  aiSummary: string | null
  metadata: Record<string, unknown> | null
}

export interface ContentList {
  items: ContentArticle[]
  total: number
  limit: number
  offset: number
}

const HOT_TTL = 5 * 60 // offset 0 — "what's new"
const WARM_TTL = 60 * 60 // offset > 0 — older slices
const MIN_RELEVANCE_FLOOR = 3
const TOPIC = 'division-2'
const DEFAULT_LIMIT = 24

const VALID_SOURCES = new Set<ContentSource>(['UBISOFT', 'REDDIT', 'YOUTUBE'])

/**
 * Coerce a value that *should* be a URL string but may have arrived as a
 * `{ value }` / `{ href }` wrapper, a string, or null. Returns null if no
 * usable URL can be extracted.
 */
function coerceUrl(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value || null
    if (typeof obj.href === 'string') return obj.href || null
    if (typeof obj.url === 'string') return obj.url || null
  }
  return null
}

/** Coerce a value that *should* be a plain string. */
function coerceString(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value || null
    if (typeof obj.text === 'string') return obj.text || null
  }
  return null
}

/** Coerce a value that *should* be a number (e.g., relevance score). */
function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Coerce authors — could be a string, an array of strings, or a `{ name }[]`. */
function coerceAuthors(value: unknown): string[] {
  if (typeof value === 'string' && value.length > 0) return [value]
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>
        if (typeof obj.name === 'string') return obj.name
        if (typeof obj.username === 'string') return obj.username
      }
      return null
    })
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
}

/**
 * Normalize one raw Ashley article into the local `ContentArticle` shape.
 * Returns `null` if the article is unusable (missing/unrecoverable `url`,
 * unknown source).
 */
function normalizeArticle(raw: RawArticle): ContentArticle | null {
  const url = coerceUrl(raw.url)
  if (!url) return null

  const sourceRaw = typeof raw.source === 'string' ? raw.source.toUpperCase() : ''
  if (!VALID_SOURCES.has(sourceRaw as ContentSource)) return null

  return {
    id: raw.id,
    source: sourceRaw as ContentSource,
    sourceId: raw.sourceId,
    topic: raw.topic,
    publishedAt: raw.publishedAt,
    fetchedAt: raw.fetchedAt,
    title: raw.title,
    perex: coerceString(raw.perex),
    thumbnailUrl: coerceUrl(raw.thumbnailUrl),
    url,
    authors: coerceAuthors(raw.authors),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : [],
    contentType: coerceString(raw.contentType),
    relevance: coerceNumber(raw.relevance),
    aiSummary: coerceString(raw.aiSummary),
    metadata: raw.metadata && typeof raw.metadata === 'object'
      ? (raw.metadata as Record<string, unknown>)
      : null,
  }
}

function normalizeList(raw: RawList): ContentList {
  const items = (raw.items ?? [])
    .map(normalizeArticle)
    .filter((a): a is ContentArticle => a !== null)
  return {
    items,
    total: raw.total ?? 0,
    limit: raw.limit ?? DEFAULT_LIMIT,
    offset: raw.offset ?? 0,
  }
}

export interface FetchContentArgs {
  source?: ContentSource
  offset: number
  limit?: number
}

/**
 * Fetch a single batch of content from Ashley, cached per `(source, offset,
 * limit)`. Topic and minRelevance are baked into the helper — neither is
 * user-controllable. Returns the *normalized* list (not the raw DTO).
 */
export function fetchContentList({
  source,
  offset,
  limit = DEFAULT_LIMIT,
}: FetchContentArgs): Promise<AshleyResult<ContentList>> {
  const ttl = offset === 0 ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<ContentList>> => {
      const result = await fetchAshleyService<RawList>((c) =>
        c.GET('/api/content', {
          params: {
            query: {
              topic: TOPIC,
              minRelevance: MIN_RELEVANCE_FLOOR,
              ...(source ? { source } : {}),
              offset,
              limit,
            },
          },
        }),
      )
      if (!result.ok) return result
      return { ok: true, data: normalizeList(result.data) }
    },
    ['division2-content-r3-d2', source ?? 'all', String(offset), String(limit)],
    { revalidate: ttl, tags: ['content', 'content-list'] },
  )
  return cached()
}

/** Type guard for query-string source values. */
export function isContentSource(value: unknown): value is ContentSource {
  return typeof value === 'string' && VALID_SOURCES.has(value as ContentSource)
}

export { DEFAULT_LIMIT }
