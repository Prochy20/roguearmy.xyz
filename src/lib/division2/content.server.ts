import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchAshleyService, type AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type RawArticle = components['schemas']['ContentArticleDto']
type RawList = components['schemas']['ContentListDto']

export type ContentSource = 'UBISOFT' | 'REDDIT' | 'YOUTUBE'

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
  /** Never null — articles with unrecoverable URLs are dropped. */
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

const HOT_TTL = 5 * 60
const WARM_TTL = 60 * 60
/** Ashley calls below this never happen, regardless of URL params. */
const MIN_RELEVANCE_FLOOR = 3
const DEFAULT_MIN_RELEVANCE = 3
const TOPIC = 'division-2'
const DEFAULT_LIMIT = 24
const VALID_MIN_RELEVANCE = new Set<number>([3, 4, 5])

const VALID_SOURCES = new Set<ContentSource>(['UBISOFT', 'REDDIT', 'YOUTUBE'])

/** Accepts a string, `{ value }` / `{ href }` / `{ url }` wrapper, or null. */
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

function coerceString(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value || null
    if (typeof obj.text === 'string') return obj.text || null
  }
  return null
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Cards render the raw number, so anything outside 1-5 would look broken. */
function clampRelevance(value: number | null): number | null {
  if (value === null) return null
  return Math.max(1, Math.min(5, Math.round(value)))
}

/** Accepts a string, string[], or `{ name | username }[]`. */
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

/** Returns null when the article is unusable (no `url`, unknown source). */
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
    relevance: clampRelevance(coerceNumber(raw.relevance)),
    aiSummary: coerceString(raw.aiSummary),
    metadata:
      raw.metadata && typeof raw.metadata === 'object'
        ? (raw.metadata as Record<string, unknown>)
        : null,
  }
}

function normalizeList(raw: RawList): ContentList {
  // Ashley occasionally returns the same id twice in one response.
  const seen = new Set<string>()
  const items: ContentArticle[] = []
  for (const rawItem of raw.items ?? []) {
    const article = normalizeArticle(rawItem)
    if (!article) continue
    if (seen.has(article.id)) continue
    seen.add(article.id)
    items.push(article)
  }
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
  /** Clamped to MIN_RELEVANCE_FLOOR on the server. */
  minRelevance?: number
}

export function fetchContentList({
  source,
  offset,
  limit = DEFAULT_LIMIT,
  minRelevance = DEFAULT_MIN_RELEVANCE,
}: FetchContentArgs): Promise<AshleyResult<ContentList>> {
  const min = Math.max(MIN_RELEVANCE_FLOOR, minRelevance)
  const ttl = offset === 0 ? HOT_TTL : WARM_TTL
  const cached = unstable_cache(
    async (): Promise<AshleyResult<ContentList>> => {
      const result = await fetchAshleyService<RawList>((c) =>
        c.GET('/api/content', {
          params: {
            query: {
              topic: TOPIC,
              minRelevance: min,
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
    ['division2-content-d2', source ?? 'all', `r${min}`, String(offset), String(limit)],
    { revalidate: ttl, tags: ['content', 'content-list'] },
  )
  return cached()
}

export function isContentSource(value: unknown): value is ContentSource {
  return typeof value === 'string' && VALID_SOURCES.has(value as ContentSource)
}

export function parseMinRelevance(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const n = Number.parseInt(value, 10)
  return VALID_MIN_RELEVANCE.has(n) ? n : undefined
}

export { DEFAULT_LIMIT, DEFAULT_MIN_RELEVANCE }
