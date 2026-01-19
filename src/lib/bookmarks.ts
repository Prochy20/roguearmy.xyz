/**
 * Bookmark types for the members section.
 * This file is client-safe - no Payload runtime imports.
 */

import {
  type Article,
  type TintColor,
  mapPayloadColorToTint,
} from './articles'

/** Payload CMS color type (matches Topic/Game color field) */
export type PayloadColor = 'orange' | 'blue' | 'yellow' | 'teal' | 'green' | 'purple' | 'red' | 'pink'

export interface BookmarkArticle {
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
}

export interface BookmarkWithArticle {
  id: string
  article: BookmarkArticle
  createdAt: string
}

export interface BookmarksState {
  bookmarks: BookmarkWithArticle[]
  bookmarkedIds: Set<string>
  isLoading: boolean
}

/**
 * Transform a BookmarkArticle to the Article type used by ArticleCard
 */
export function transformBookmarkToArticle(bookmark: BookmarkWithArticle): Article | null {
  const { article } = bookmark

  // Skip if article data is incomplete
  if (!article.id || !article.slug || !article.title) {
    return null
  }

  // Map topic color to tint
  const topicTint: TintColor = article.topic?.color
    ? mapPayloadColorToTint(article.topic.color)
    : 'green'

  // Map games with tint colors
  const games = article.games.map((game) => ({
    id: game.id,
    name: game.name,
    tint: mapPayloadColorToTint(game.color),
  }))

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    perex: article.perex || '',
    heroImage: article.heroImage || { url: '/placeholder-article.svg', alt: article.title },
    topic: {
      id: article.topic?.id || '',
      slug: article.topic?.slug || '',
      name: article.topic?.name || 'Uncategorized',
      tint: topicTint,
    },
    games,
    contentType: {
      id: article.contentType?.id || '',
      slug: article.contentType?.slug || '',
      name: article.contentType?.name || 'Article',
    },
    publishedAt: new Date(article.publishedAt),
    readingTime: article.readingTime,
    contentSource: { type: 'payload' }, // Not used for cards
  }
}
