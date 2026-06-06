/**
 * Bookmark types — discriminated union over articles and briefings.
 * Client-safe (no Payload runtime imports). Server hydration lives in
 * src/lib/bookmarks.server.ts.
 */

import {
  mapPayloadColorToTint,
  type Article,
  type ArticleVisibility,
  type TintColor,
} from './articles'

/** Payload CMS color type (matches Topic/Game color field) */
export type PayloadColor =
  | 'orange'
  | 'blue'
  | 'yellow'
  | 'teal'
  | 'green'
  | 'purple'
  | 'red'
  | 'pink'

export type BookmarkTargetType = 'article' | 'briefing'

export interface BookmarkArticleTarget {
  id: string
  slug: string
  title: string
  perex: string
  heroImage: { url: string; alt: string } | null
  topic: { id: string; name: string; slug: string; color: PayloadColor } | null
  games: Array<{ id: string; name: string; color: PayloadColor }>
  contentType: { id: string; slug: string; name: string } | null
  readingTime: number
  publishedAt: string
  visibility?: ArticleVisibility
}

export interface BookmarkBriefingTarget {
  id: string
  slug: string
  canonicalPath: string
  frequency: 'daily' | 'weekly'
  periodStart: string
  periodEnd: string
  title: string
  perex: string
  thumbnailUrl: string | null
  // BriefingCard footer reads this — projection needs it so the rendered
  // "N SRC" stamp matches the real source count instead of always 0.
  articleCount: number
}

export type BookmarkWithTarget =
  | {
      id: string
      targetType: 'article'
      target: BookmarkArticleTarget
      createdAt: string
    }
  | {
      id: string
      targetType: 'briefing'
      target: BookmarkBriefingTarget
      // True when target is daily and the viewing member no longer has
      // booster access. Drives the locked card variant.
      locked: boolean
      createdAt: string
    }

export function bookmarkKey(targetType: BookmarkTargetType, targetId: string): string {
  return `${targetType}:${targetId}`
}

export function bookmarkTargetToArticle(target: BookmarkArticleTarget): Article | null {
  if (!target.id || !target.slug || !target.title) return null

  const topicTint: TintColor = target.topic?.color
    ? mapPayloadColorToTint(target.topic.color)
    : 'green'

  return {
    id: target.id,
    slug: target.slug,
    title: target.title,
    perex: target.perex || '',
    heroImage: target.heroImage || { url: '/placeholder-article.svg', alt: target.title },
    topic: {
      id: target.topic?.id || '',
      slug: target.topic?.slug || '',
      name: target.topic?.name || 'Uncategorized',
      tint: topicTint,
    },
    games: target.games.map((game) => ({
      id: game.id,
      name: game.name,
      tint: mapPayloadColorToTint(game.color),
    })),
    contentType: {
      id: target.contentType?.id || '',
      slug: target.contentType?.slug || '',
      name: target.contentType?.name || 'Article',
    },
    publishedAt: new Date(target.publishedAt),
    readingTime: target.readingTime,
    visibility: target.visibility || 'members_only',
    contentSource: { type: 'payload' },
  }
}
