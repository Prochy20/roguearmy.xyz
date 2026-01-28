'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HoverGlitch } from '@/components/effects/HoverGlitch'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import {
  type Article,
  type TintColor,
  getTintClasses,
  getArticleUrl,
} from '@/lib/articles'
import { ReadStatusIndicator, getReadStatus } from './ReadStatusIndicator'
import { BookmarkButton } from './BookmarkButton'

interface CardProgressData {
  progress: number
  completed: boolean
}

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

interface ArticleCardCompactProps {
  article: Article
  index?: number
  progress?: CardProgressData | null
}

/**
 * Compact article card for grid view
 * 16:9 hero, title, condensed metadata
 */
function ArticleCardCompactComponent({ article, index = 0, progress }: ArticleCardCompactProps) {
  const tint = getTintClasses(article.topic.tint)
  const cornerColor = tintToColor(article.topic.tint)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="h-full"
    >
      <Link href={getArticleUrl(article)} className="block group h-full">
        <CyberCorners color={cornerColor} size="sm" glow className="h-full">
          <div
            className={cn(
              'relative overflow-hidden border bg-bg-elevated transition-all duration-300 h-full flex flex-col',
              tint.border,
              tint.hoverBorder,
              tint.glow
            )}
          >
            {/* Hero Image - 16:9 aspect ratio */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-bg-elevated via-bg-elevated/30 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Topic + Game Badges */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <CyberTag color={cornerColor} className={cn(tint.text, 'text-[10px]')}>
                  {article.topic.name}
                </CyberTag>
                {article.games.length > 0 && (
                  <CyberTag color="gray" className="text-rga-gray/80 text-[10px]">
                    {article.games[0].name}
                  </CyberTag>
                )}
              </div>
            </div>

            {/* Content - flex column to ensure consistent height */}
            <div className="p-3 flex flex-col flex-1">
              {/* Title - fixed height for 2 lines to ensure consistent card heights */}
              <div className="flex-1 min-h-[2.75rem]">
                <HoverGlitch
                  intensity={3}
                  className="block font-display text-base text-white leading-tight line-clamp-2"
                >
                  {article.title}
                </HoverGlitch>
              </div>

              {/* Condensed Metadata Row - always at bottom */}
              <div className="flex items-center justify-between gap-2 text-xs text-rga-gray/60 mt-2">
                {/* Left: Content Type + Reading Time */}
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-rga-gray/50 uppercase tracking-wider text-[9px]">
                    {article.contentType.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readingTime}m</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <BookmarkButton articleId={article.id} size="sm" />
                  <ReadStatusIndicator
                    status={getReadStatus(progress?.progress, progress?.completed)}
                    progress={progress?.progress}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}

// Memoize to prevent re-renders when parent state changes
export const ArticleCardCompact = memo(ArticleCardCompactComponent, (prev, next) =>
  prev.article.id === next.article.id &&
  prev.index === next.index &&
  prev.progress?.progress === next.progress?.progress &&
  prev.progress?.completed === next.progress?.completed
)
