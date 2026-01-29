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
import { ReadStatusIndicator, getReadStatus } from '@/components/members/ReadStatusIndicator'
import { BookmarkButton } from '@/components/members/BookmarkButton'
import { MembersOnlyOverlay } from './MembersOnlyOverlay'

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

interface BlogArticleCardCompactProps {
  article: Article
  index?: number
  progress?: CardProgressData | null
  isAuthenticated?: boolean
}

/**
 * Compact article card for Archive grid view
 * Vertical layout with image, title, perex, and metadata
 */
export function BlogArticleCardCompact({ article, index = 0, progress, isAuthenticated = false }: BlogArticleCardCompactProps) {
  const tint = getTintClasses(article.topic.tint)
  const cornerColor = tintToColor(article.topic.tint)
  const articleUrl = getArticleUrl(article)
  const isMembersOnly = article.visibility === 'members_only'

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="h-full"
    >
      <Link href={articleUrl} className="block group h-full">
        <CyberCorners color={cornerColor} size="sm" glow={false} className="h-full">
          <div
            className={cn(
              'relative overflow-hidden border bg-bg-elevated transition-all duration-300 h-full flex flex-col',
              tint.border,
              tint.hoverBorder
            )}
          >
            {/* Image Header - 16:9 aspect */}
            <div className="relative aspect-video overflow-hidden flex-shrink-0">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient fade to content */}
              <div className="absolute inset-0 bg-linear-to-t from-bg-elevated via-bg-elevated/40 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Topic badge - anchored bottom left */}
              <div className="absolute bottom-2 left-2">
                <CyberTag color={cornerColor} className={cn(tint.text, 'text-[10px] py-0.5 px-2')}>
                  {article.topic.name}
                </CyberTag>
              </div>

              {/* Members-only overlay */}
              {isMembersOnly && !isAuthenticated && (
                <MembersOnlyOverlay size="sm" />
              )}
            </div>

            {/* Content Zone - structured spacing */}
            <div className="flex-1 flex flex-col p-3 pt-2">
              {/* Title - 2 lines max, fixed height */}
              <div className="min-h-[2.25rem] mb-1.5">
                <HoverGlitch
                  intensity={2}
                  className="block font-display text-[13px] text-white leading-snug line-clamp-2"
                >
                  {article.title}
                </HoverGlitch>
              </div>

              {/* Perex - 2 lines, muted */}
              <p className="text-rga-gray/60 text-[11px] leading-relaxed line-clamp-2 mb-auto">
                {article.perex}
              </p>

              {/* Footer - metadata & actions */}
              <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-white/5">
                {/* Reading time */}
                <div className="flex items-center gap-1.5 text-[10px] text-rga-gray/50 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{article.readingTime}m</span>
                </div>

                {/* Actions - authenticated only */}
                {isAuthenticated && (
                  <div className="flex items-center gap-1.5">
                    <BookmarkButton articleId={article.id} size="sm" />
                    <ReadStatusIndicator
                      status={getReadStatus(progress?.progress, progress?.completed)}
                      progress={progress?.progress}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
