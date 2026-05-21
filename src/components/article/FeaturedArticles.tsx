'use client'

import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { type Article } from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { ArticleCardMini } from './ArticleCardMini'

/** Serialized progress object (Map converted to plain object for server->client) */
type FeaturedProgressRecord = Record<string, ArticleProgress>

interface FeaturedArticlesProps {
  articles: Article[]
  progress?: FeaturedProgressRecord
}

/**
 * Featured articles section displaying "You might also like" recommendations.
 * Uses compact ArticleCardMini components in a 3-column grid.
 */
export function FeaturedArticles({ articles, progress }: FeaturedArticlesProps) {
  // Don't render if no articles
  if (articles.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-16 pt-8 border-t border-rga-green/10"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        {/* Accent line */}
        <div className="w-1 h-8 bg-linear-to-b from-rga-magenta via-rga-cyan to-rga-green rounded-full" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rga-cyan" />
          <h3 className="text-base font-medium text-white">
            You might also like
          </h3>
        </div>
      </div>

      {/* Mini cards - 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <ArticleCardMini
            key={article.id}
            article={article}
            index={index}
            progress={
              progress?.[article.id]
                ? {
                    progress: progress[article.id].progress,
                    completed: progress[article.id].completed,
                  }
                : null
            }
          />
        ))}
      </div>
    </motion.section>
  )
}
