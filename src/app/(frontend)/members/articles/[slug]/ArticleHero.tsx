'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Clock, Calendar, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeroGlitch } from '@/components/effects'
import { CyberTag } from '@/components/ui/CyberCorners'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type ArticleTopic,
  type ArticleContentType,
  type ArticleGame,
  type ArticleImage,
  type ArticleSeries,
  type TintColor,
  formatArticleDate,
} from '@/lib/articles'
import { BookmarkButton } from '@/components/members/BookmarkButton'
import { ShareButton } from '@/components/members/ShareButton'

// Map article tint to CyberTag color
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

interface ArticleHeroProps {
  articleId: string
  slug: string
  title: string
  heroImage: ArticleImage
  topic: ArticleTopic
  tint: {
    border: string
    hoverBorder: string
    bg: string
    text: string
    textMuted: string
    glow: string
  }
  publishedAt: Date
  readingTime: number
  contentType: ArticleContentType
  games?: ArticleGame[]
  series?: ArticleSeries
}

export function ArticleHero({
  articleId,
  slug,
  title,
  heroImage,
  topic,
  tint,
  publishedAt,
  readingTime,
  contentType,
  games = [],
  series,
}: ArticleHeroProps) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          className="object-cover"
          priority
          unoptimized={heroImage.url.endsWith('.svg')}
        />

        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/50 via-transparent to-void/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent h-40" />

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.015)_2px,rgba(0,255,65,0.015)_4px)] pointer-events-none" />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(3,3,3,0.4) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-20 md:pb-32">
        <div className="max-w-7xl">
          {/* Topic and Games badges - animated in */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <CyberTag color={tintToColor(topic.tint)} className={cn('text-sm', tint.text)}>
              {topic.name}
            </CyberTag>
            {games.map((game) => (
              <CyberTag key={game.id} color="gray" className="text-sm text-rga-gray">
                {game.name}
              </CyberTag>
            ))}
          </motion.div>

          {/* Title with HeroGlitch - matching homepage style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="font-display text-[10vw] md:text-[8vw] lg:text-[5vw] leading-[0.85] tracking-tight">
              <HeroGlitch
                minInterval={4}
                maxInterval={10}
                intensity={8}
                dataCorruption
                scanlines
              >
                <span className="text-white">{title}</span>
              </HeroGlitch>
            </h1>
          </motion.div>

          {/* Meta info row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 md:gap-6"
          >
            {/* Date & Reading time */}
            <div className="flex items-center gap-4 text-sm text-rga-gray/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatArticleDate(publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* Separator */}
            <span className="hidden sm:block w-px h-4 bg-rga-gray/30" />

            {/* Share Button */}
            <ShareButton articleSlug={slug} size="md" />

            {/* Separator */}
            <span className="hidden sm:block w-px h-4 bg-rga-gray/30" />

            {/* Bookmark Button */}
            <BookmarkButton articleId={articleId} size="md" />

            {/* Series indicator */}
            {series && (
              <>
                <span className="hidden sm:block w-px h-4 bg-rga-gray/30" />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/members/series/${series.slug}`}
                        className="text-rga-gray/60 hover:text-rga-gray transition-colors inline-flex items-center gap-1.5 text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        {series.name}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View series</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 right-8 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-rga-gray/40"
          >
            <span className="text-xs uppercase tracking-widest font-mono rotate-90 origin-center translate-x-4">
              Scroll
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-rga-green/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom edge glow line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-px',
          'bg-gradient-to-r from-transparent via-current to-transparent opacity-30',
          tint.text
        )}
      />
    </section>
  )
}
