'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { BookmarkX, ArrowRight } from 'lucide-react'
import { useBookmarks } from '@/contexts/BookmarksContext'
import { ArticleCard } from '@/components/members/ArticleCard'
import { HeroGlitch } from '@/components/effects'
import { transformBookmarkToArticle } from '@/lib/bookmarks'
import { useBookmarkProgress } from '@/hooks/useBookmarkProgress'

export default function BookmarksPage() {
  const { bookmarks, isLoading: bookmarksLoading } = useBookmarks()

  // Extract article IDs for progress fetching
  const articleIds = useMemo(
    () => bookmarks.map((b) => b.article.id),
    [bookmarks]
  )

  // Fetch progress for all bookmarked articles
  const { progressMap, isLoading: progressLoading } = useBookmarkProgress(articleIds)

  // Transform bookmarks to Article format
  const articles = useMemo(
    () =>
      bookmarks
        .map((bookmark) => transformBookmarkToArticle(bookmark))
        .filter((article): article is NonNullable<typeof article> => article !== null),
    [bookmarks]
  )

  const isLoading = bookmarksLoading || progressLoading

  return (
    <div className="min-h-screen bg-void">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3">
            <HeroGlitch
              minInterval={4}
              maxInterval={10}
              intensity={8}
              dataCorruption
              scanlines
            >
              YOUR BOOKMARKS
            </HeroGlitch>
          </h1>
          <p className="text-rga-gray max-w-2xl">
            Your saved articles for later reading. Bookmark guides and content you want to
            come back to, and access them anytime from here.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-bg-elevated border border-rga-cyan/10 rounded">
                  <div className="aspect-[5/2] bg-bg-surface" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-bg-surface rounded w-3/4" />
                    <div className="h-4 bg-bg-surface rounded w-full" />
                    <div className="h-3 bg-bg-surface rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                progress={progressMap[article.id] || null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <BookmarkX className="w-16 h-16 text-rga-gray/20" />
        <div className="absolute inset-0 bg-rga-cyan/5 blur-xl rounded-full" />
      </div>
      <h2 className="text-xl font-display text-white mb-2">No bookmarks yet</h2>
      <p className="text-rga-gray/60 max-w-md mb-6">
        Save articles you want to read later by clicking the bookmark icon on any article card
        or article page.
      </p>
      <Link
        href="/members"
        className="inline-flex items-center gap-2 px-4 py-2 bg-rga-cyan/10 text-rga-cyan border border-rga-cyan/30 rounded-lg hover:bg-rga-cyan/20 transition-colors"
      >
        Browse articles
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}
