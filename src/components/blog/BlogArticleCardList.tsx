'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Clock, Lock } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

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

interface BlogArticleCardListProps {
  article: Article
  index?: number
  progress?: CardProgressData | null
  isAuthenticated?: boolean
}

/**
 * List-style article card for dense browsing with visibility badge
 * Horizontal layout with thumbnail, title, perex, and metadata
 */
export function BlogArticleCardList({ article, index = 0, progress, isAuthenticated = false }: BlogArticleCardListProps) {
  const tint = getTintClasses(article.topic.tint)
  const cornerColor = tintToColor(article.topic.tint)
  const articleUrl = getArticleUrl(article)
  const isMembersOnly = article.visibility === 'members_only'

  return (
    <motion.article
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.3,
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={articleUrl} className="block group">
        <CyberCorners color={cornerColor} size="sm" glow={false}>
          <div
            className={cn(
              'relative flex gap-3 sm:gap-4 p-3 sm:p-4 border bg-bg-elevated transition-all duration-300',
              tint.border,
              tint.hoverBorder
            )}
          >
            {/* Mobile-only lock icon - fixed position top right */}
            {isMembersOnly && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 sm:hidden flex items-center justify-center w-6 h-6 bg-bg-elevated/80 backdrop-blur-sm rounded border border-rga-cyan/30 cursor-help">
                      <Lock className="w-3 h-3 text-rga-cyan" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent accent="cyan">Members only</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Thumbnail - hidden on mobile */}
            <div className="hidden sm:block flex-shrink-0 relative w-20 h-20 overflow-hidden rounded-sm">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-bg-elevated/50 to-transparent" />

              {/* Members-only lock icon overlay */}
              {isMembersOnly && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/60 cursor-help">
                        <Lock className="w-4 h-4 text-rga-cyan" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent accent="cyan">Members only</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {/* Title */}
              <HoverGlitch
                intensity={2}
                className="block font-display text-base sm:text-lg text-white leading-tight mb-1 line-clamp-1 pr-8 sm:pr-0"
              >
                {article.title}
              </HoverGlitch>

              {/* Perex - single line */}
              <p className="text-rga-gray text-sm line-clamp-1 mb-2">
                {article.perex}
              </p>

              {/* Meta row - organized layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-rga-gray/60">
                {/* Row 1 on mobile / Left group on desktop: Topic + Game */}
                <div className="flex items-center gap-1.5">
                  <CyberTag color={cornerColor} className={cn(tint.text, 'text-[10px] py-0.5')}>
                    {article.topic.name}
                  </CyberTag>
                  {article.games.length > 0 && (
                    <CyberTag color="gray" className="text-rga-gray/80 text-[10px] py-0.5">
                      {article.games[0].name}
                    </CyberTag>
                  )}
                </div>

                {/* Row 2 on mobile / Right group on desktop: Type + Time */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-rga-gray/50 uppercase tracking-wider text-[10px]">
                    {article.contentType.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readingTime} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side actions - only for authenticated users */}
            {isAuthenticated && (
              <div className="flex-shrink-0 flex items-center gap-2 self-center">
                <BookmarkButton articleId={article.id} size="sm" />
                <ReadStatusIndicator
                  status={getReadStatus(progress?.progress, progress?.completed)}
                  progress={progress?.progress}
                  size="sm"
                />
              </div>
            )}
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
