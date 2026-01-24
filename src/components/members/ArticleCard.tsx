'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HoverGlitch } from '@/components/effects/HoverGlitch'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import {
  type Article,
  type TintColor,
  getTintClasses,
  formatArticleDate,
} from '@/lib/articles'
import { ReadStatusIndicator, getReadStatus } from './ReadStatusIndicator'
import { BookmarkButton } from './BookmarkButton'

/** Minimal progress data needed for article card display */
interface CardProgressData {
  progress: number
  completed: boolean
}

// Map article tint to CyberCorners color
const tintToColor = (tint: TintColor) => {
  switch (tint) {
    case 'green': return 'green' as const
    case 'cyan': return 'cyan' as const
    case 'magenta': return 'magenta' as const
    case 'orange': return 'orange' as const
    case 'red': return 'red' as const
    default: return 'green' as const
  }
}

interface ArticleCardProps {
  article: Article
  index?: number
  progress?: CardProgressData | null
}

export function ArticleCard({ article, index = 0, progress }: ArticleCardProps) {
  const tint = getTintClasses(article.topic.tint)
  const cornerColor = tintToColor(article.topic.tint)

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
      className="h-full"
    >
      <Link href={`/members/articles/${article.slug}`} className="block group h-full">
        <CyberCorners color={cornerColor} size="md" glow className="h-full">
          <div
            className={cn(
              'relative overflow-hidden border bg-bg-elevated transition-all duration-300 h-full flex flex-col',
              tint.border,
              tint.hoverBorder,
              tint.glow
            )}
          >
            {/* Hero Image */}
            <div className="relative aspect-[5/2] overflow-hidden">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/50 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Topic Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <CyberTag color={cornerColor} className={tint.text}>
                  {article.topic.name}
                </CyberTag>
                {/* Show first game if available */}
                {article.games.length > 0 && (
                  <CyberTag color="gray" className="text-rga-gray/80">
                    {article.games[0].name}
                  </CyberTag>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Title with intense Glitch Effect on hover */}
              <HoverGlitch
                intensity={5}
                dataCorruption
                className="block font-display text-xl md:text-2xl text-white leading-tight mb-3"
              >
                {article.title}
              </HoverGlitch>

              {/* Perex */}
              <p className="text-rga-gray text-sm md:text-base line-clamp-2 mb-4">
                {article.perex}
              </p>

              {/* Metadata Row */}
              <div className="flex items-center gap-x-4 gap-y-2 text-xs text-rga-gray/60 mt-auto">
                {/* Left side: Content Type, Date, Reading Time */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 flex-1">
                  {/* Content Type - subtle pill */}
                  <span className="px-2 py-0.5 rounded bg-white/5 text-rga-gray/50 uppercase tracking-wider text-[10px]">
                    {article.contentType.name}
                  </span>

                  {/* Date */}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatArticleDate(article.publishedAt)}</span>
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  <BookmarkButton articleId={article.id} size="sm" />
                  {progress !== undefined && (
                    <ReadStatusIndicator
                      status={getReadStatus(progress?.progress, progress?.completed)}
                      progress={progress?.progress}
                      size="md"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
