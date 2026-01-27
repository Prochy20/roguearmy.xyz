'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { HoverGlitch } from '@/components/effects/HoverGlitch'
import { ReadStatusIndicator, getReadStatus, type ReadStatus } from './ReadStatusIndicator'
import { type Article, getArticleUrl } from '@/lib/articles'
import type { ArticleProgress } from '@/lib/progress.server'

interface SeriesArticleCardProps {
  article: Article
  order: number
  progress?: ArticleProgress | null
  index?: number
}

/**
 * Article card for series detail page with read status indicator
 * Shows order number, title, perex, and reading status
 */
export function SeriesArticleCard({
  article,
  order,
  progress,
  index = 0,
}: SeriesArticleCardProps) {
  const readStatus: ReadStatus = getReadStatus(progress?.progress, progress?.completed)

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={getArticleUrl(article)} className="block group">
        <CyberCorners
          color={readStatus === 'completed' ? 'green' : readStatus === 'in_progress' ? 'cyan' : 'gray'}
          size="sm"
          glow={readStatus !== 'unread'}
        >
          <div
            className={cn(
              'relative flex gap-4 p-4 border bg-bg-elevated transition-all duration-300',
              readStatus === 'completed'
                ? 'border-rga-green/20 hover:border-rga-green/40'
                : readStatus === 'in_progress'
                  ? 'border-rga-cyan/20 hover:border-rga-cyan/40'
                  : 'border-rga-gray/20 hover:border-rga-gray/40'
            )}
          >
            {/* Order number */}
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 flex items-center justify-center border rounded-sm',
                'font-mono text-lg',
                readStatus === 'completed'
                  ? 'border-rga-green/30 text-rga-green bg-rga-green/5'
                  : readStatus === 'in_progress'
                    ? 'border-rga-cyan/30 text-rga-cyan bg-rga-cyan/5'
                    : 'border-rga-gray/20 text-rga-gray/60'
              )}
            >
              {order}
            </div>

            {/* Thumbnail - hidden on mobile */}
            <div className="hidden sm:block flex-shrink-0 relative w-24 aspect-video overflow-hidden rounded-sm">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <HoverGlitch
                intensity={2}
                className="block font-display text-lg text-white leading-tight mb-1 truncate"
              >
                {article.title}
              </HoverGlitch>

              {/* Perex */}
              <p className="text-rga-gray text-sm line-clamp-1 mb-2">
                {article.perex}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-rga-gray/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime} min</span>
                </div>
                <CyberTag color="gray" className="text-rga-gray/70">
                  {article.topic.name}
                </CyberTag>
              </div>
            </div>

            {/* Read status indicator */}
            <div className="flex-shrink-0 self-center">
              <ReadStatusIndicator
                status={readStatus}
                progress={progress?.progress}
                size="md"
              />
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
