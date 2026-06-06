import 'server-only'

import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { hasBriefingsAccess, type SymbolicRole } from '@/lib/auth/badges'
import { fetchBriefingById, type BriefingDetail } from '@/lib/division2/briefing.server'
import type {
  BookmarkArticleTarget,
  BookmarkBriefingTarget,
  BookmarkTargetType,
  BookmarkWithTarget,
} from './bookmarks'
import type { Article, Topic, Media, Game, ContentType } from '@/payload-types'

// Shared bookmarks fetch + expansion. React.cache dedups across server
// callers in a single request (chrome layout, route handler, /me/bookmarks).
// Args are positional + primitive so cache(...) actually hits — passing an
// object literal would allocate a fresh reference at each call site and miss.
const fetchBookmarks = cache(
  async (
    memberId: string,
    rolesKey: string,
    targetTypeFilter: BookmarkTargetType | null,
  ): Promise<BookmarkWithTarget[]> => {
    const symbolicRoles = rolesKey ? (rolesKey.split(',') as SymbolicRole[]) : []
    const payload = await getPayload({ config })

    const where: Where = { member: { equals: memberId } }
    if (targetTypeFilter) where.targetType = { equals: targetTypeFilter }

    const result = await payload.find({
      collection: 'bookmarks',
      where,
      limit: 1000,
      depth: 0,
      sort: '-createdAt',
    })

    const articleIds: string[] = []
    const briefingIds: string[] = []
    for (const doc of result.docs) {
      if (doc.targetType === 'article') articleIds.push(doc.targetId)
      else briefingIds.push(doc.targetId)
    }

    const [articleMap, briefingMap] = await Promise.all([
      expandArticles(payload, articleIds),
      expandBriefings(briefingIds),
    ])

    const bookmarks: BookmarkWithTarget[] = []
    for (const doc of result.docs) {
      if (doc.targetType === 'article') {
        const article = articleMap.get(doc.targetId)
        if (!article) continue
        bookmarks.push({
          id: doc.id,
          targetType: 'article',
          target: projectArticle(article),
          createdAt: doc.createdAt,
        })
      } else {
        const briefing = briefingMap.get(doc.targetId)
        if (!briefing) continue
        bookmarks.push({
          id: doc.id,
          targetType: 'briefing',
          target: projectBriefing(briefing),
          locked:
            briefing.frequency === 'daily' && !hasBriefingsAccess(symbolicRoles),
          createdAt: doc.createdAt,
        })
      }
    }

    return bookmarks
  },
)

export interface HydrationParams {
  memberId: string
  symbolicRoles: readonly SymbolicRole[]
  targetTypeFilter?: BookmarkTargetType | null
}

// Sort the roles before joining so chrome layout and route handler hit the
// same cache key regardless of role array ordering.
export function getMemberBookmarks(
  params: HydrationParams,
): Promise<BookmarkWithTarget[]> {
  const rolesKey = [...params.symbolicRoles].sort().join(',')
  return fetchBookmarks(params.memberId, rolesKey, params.targetTypeFilter ?? null)
}

async function expandArticles(
  payload: Awaited<ReturnType<typeof getPayload>>,
  ids: string[],
): Promise<Map<string, Article>> {
  if (ids.length === 0) return new Map()
  const result = await payload.find({
    collection: 'articles',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 2,
  })
  return new Map(result.docs.map((a) => [a.id, a]))
}

async function expandBriefings(ids: string[]): Promise<Map<string, BriefingDetail>> {
  if (ids.length === 0) return new Map()
  const results = await Promise.all(ids.map((id) => fetchBriefingById(id)))
  const map = new Map<string, BriefingDetail>()
  for (let i = 0; i < ids.length; i++) {
    const r = results[i]
    if (r.ok && r.data) {
      map.set(ids[i], r.data)
      continue
    }
    // fetchBriefingById wraps unstable_cache around an AshleyResult — a 5xx
    // can get cached for 24h, silently dropping the bookmark from the list.
    // Log so the failure is observable in ops; the bookmark will simply
    // not render until cache evicts.
    console.warn(
      '[bookmarks] briefing hydration failed',
      ids[i],
      r.ok ? 'not_found' : r.error.code,
    )
  }
  return map
}

function projectArticle(article: Article): BookmarkArticleTarget {
  const topic = article.categorization?.topic as Topic | undefined
  const heroImage = article.heroImage as Media | undefined
  const contentType = article.categorization?.contentType as ContentType | undefined

  const games = (article.categorization?.games || [])
    .filter((g): g is Game => typeof g !== 'string' && g !== null)
    .map((game) => ({ id: game.id, name: game.name, color: game.color }))

  return {
    id: article.id,
    slug: article.slug || '',
    title: article.title,
    perex: article.perex || '',
    heroImage: heroImage
      ? { url: heroImage.url || '', alt: heroImage.alt || article.title }
      : null,
    topic: topic
      ? { id: topic.id, name: topic.name, slug: topic.slug, color: topic.color }
      : null,
    games,
    contentType: contentType
      ? { id: contentType.id, slug: contentType.slug, name: contentType.name }
      : null,
    readingTime: article.readingTime || 5,
    publishedAt: article.publishedAt || article.createdAt || '',
    visibility: article.visibility,
  }
}

function projectBriefing(briefing: BriefingDetail): BookmarkBriefingTarget {
  return {
    id: briefing.id,
    slug: briefing.slug,
    canonicalPath: briefing.canonicalPath,
    frequency: briefing.frequency,
    periodStart: briefing.periodStart,
    periodEnd: briefing.periodEnd,
    title: briefing.title,
    perex: briefing.perex,
    thumbnailUrl: briefing.thumbnailUrl,
    articleCount: briefing.articleCount,
  }
}
