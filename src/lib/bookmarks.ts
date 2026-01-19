/**
 * Bookmark types for the members section.
 * This file is client-safe - no Payload runtime imports.
 */

/** Payload CMS color type (matches Topic/Game color field) */
export type PayloadColor = 'orange' | 'blue' | 'yellow' | 'teal' | 'green' | 'purple' | 'red' | 'pink'

export interface BookmarkArticle {
  id: string
  slug: string
  title: string
  perex: string
  heroImage: { url: string; alt: string } | null
  topic: { id: string; name: string; slug: string; color: PayloadColor } | null
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
