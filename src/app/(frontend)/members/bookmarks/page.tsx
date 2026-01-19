'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { BookmarkX, Bookmark, Clock, ArrowRight } from 'lucide-react'
import { useBookmarks } from '@/contexts/BookmarksContext'
import { BookmarkButton } from '@/components/members/BookmarkButton'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { HoverGlitch } from '@/components/effects/HoverGlitch'
import { HeroGlitch } from '@/components/effects'
import { cn } from '@/lib/utils'
import { mapPayloadColorToTint, getTintClasses } from '@/lib/articles'
import type { BookmarkWithArticle } from '@/lib/bookmarks'

export default function BookmarksPage() {
  const { bookmarks, isLoading } = useBookmarks()

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
        ) : bookmarks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((bookmark, index) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} index={index} />
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

interface BookmarkCardProps {
  bookmark: BookmarkWithArticle
  index: number
}

function BookmarkCard({ bookmark, index }: BookmarkCardProps) {
  const { article } = bookmark
  const tint = article.topic?.color
    ? getTintClasses(mapPayloadColorToTint(article.topic.color))
    : getTintClasses('cyan')
  const cornerColor = article.topic?.color
    ? (mapPayloadColorToTint(article.topic.color) as 'cyan' | 'green' | 'magenta' | 'orange' | 'red')
    : 'cyan'

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={`/members/articles/${article.slug}`} className="block group">
        <CyberCorners color={cornerColor} size="md" glow>
          <div
            className={cn(
              'relative overflow-hidden border bg-bg-elevated transition-all duration-300',
              tint.border,
              tint.hoverBorder,
              tint.glow
            )}
          >
            {/* Hero Image */}
            <div className="relative aspect-[5/2] overflow-hidden">
              {article.heroImage ? (
                <Image
                  src={article.heroImage.url}
                  alt={article.heroImage.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-surface flex items-center justify-center">
                  <Bookmark className="w-12 h-12 text-rga-gray/20" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/50 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Topic Badge */}
              {article.topic && (
                <div className="absolute bottom-4 left-4">
                  <CyberTag color={cornerColor} className={tint.text}>
                    {article.topic.name}
                  </CyberTag>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <HoverGlitch
                intensity={5}
                dataCorruption
                className="block font-display text-xl md:text-2xl text-white leading-tight mb-3"
              >
                {article.title}
              </HoverGlitch>

              {/* Perex */}
              {article.perex && (
                <p className="text-rga-gray text-sm md:text-base line-clamp-2 mb-4">
                  {article.perex}
                </p>
              )}

              {/* Metadata Row */}
              <div className="flex items-center justify-between text-xs text-rga-gray/60">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>

                {/* Bookmark button */}
                <BookmarkButton articleId={article.id} size="sm" />
              </div>
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
