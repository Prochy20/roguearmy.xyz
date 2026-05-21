'use client'

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

interface ArticleCardMiniProps {
  article: Article
  index?: number
  progress?: CardProgressData | null
}

/**
 * Mini article card for compact grids (featured sections, recommendations)
 * Square thumbnail with title, topic, and reading time
 */
export function ArticleCardMini({ article, index = 0, progress }: ArticleCardMiniProps) {
  const tint = getTintClasses(article.topic.tint)
  const cornerColor = tintToColor(article.topic.tint)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
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
            {/* Square thumbnail */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-bg-elevated via-bg-elevated/30 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Topic badge - bottom left */}
              <div className="absolute bottom-2 left-2">
                <CyberTag color={cornerColor} className={cn(tint.text, 'text-[10px]')}>
                  {article.topic.name}
                </CyberTag>
              </div>

              {/* Read status - top right */}
              {progress !== undefined && (
                <div className="absolute top-2 right-2">
                  <ReadStatusIndicator
                    status={getReadStatus(progress?.progress, progress?.completed)}
                    progress={progress?.progress}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col">
              {/* Title */}
              <HoverGlitch
                intensity={3}
                className="block font-display text-sm text-white leading-tight line-clamp-2 flex-1 min-h-[2.5rem]"
              >
                {article.title}
              </HoverGlitch>

              {/* Meta row - pushed to bottom */}
              <div className="flex items-center gap-2 text-[11px] text-rga-gray/60 mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime} min</span>
                </div>
                {article.games.length > 0 && (
                  <>
                    <span className="text-rga-gray/30">·</span>
                    <span className="truncate">{article.games[0].name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
