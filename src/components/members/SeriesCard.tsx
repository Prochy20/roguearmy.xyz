'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { HoverGlitch } from '@/components/effects/HoverGlitch'
import { SeriesProgressBar } from './SeriesProgressBar'
import { type ArticleImage, getSeriesUrl } from '@/lib/articles'

interface SeriesCardProps {
  id: string
  name: string
  slug: string
  description: string | null
  heroImage: ArticleImage | null
  articleCount: number
  completedCount?: number
  inProgressCount?: number
  index?: number
}

/**
 * Card component for series listing page
 * Shows series thumbnail, title, description, and progress
 */
export function SeriesCard({
  name,
  slug,
  description,
  heroImage,
  articleCount,
  completedCount = 0,
  inProgressCount = 0,
  index = 0,
}: SeriesCardProps) {
  const isComplete = completedCount >= articleCount && articleCount > 0
  const hasProgress = completedCount > 0 || inProgressCount > 0

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
      <Link href={getSeriesUrl({ slug })} className="block group">
        <CyberCorners color={isComplete ? 'green' : 'cyan'} size="md" glow>
          <div
            className={cn(
              'relative overflow-hidden border bg-bg-elevated transition-all duration-300',
              isComplete
                ? 'border-rga-green/30 hover:border-rga-green/60 hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                : 'border-rga-cyan/30 hover:border-rga-cyan/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]'
            )}
          >
            {/* Hero Image */}
            <div className="relative aspect-16/9 overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-surface flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-rga-gray/20" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-bg-elevated via-bg-elevated/50 to-transparent" />

              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Article count badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-void/80 backdrop-blur-sm border border-rga-cyan/30 text-rga-cyan">
                  {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                </span>
              </div>

              {/* Completion badge */}
              {isComplete && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-rga-green/20 backdrop-blur-sm border border-rga-green/50 text-rga-green text-xs font-mono">
                    COMPLETE
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <HoverGlitch
                intensity={3}
                dataCorruption
                className="block font-display text-xl md:text-2xl text-white leading-tight mb-2"
              >
                {name}
              </HoverGlitch>

              {/* Description */}
              {description && (
                <p className="text-rga-gray text-sm line-clamp-2 mb-4">
                  {description}
                </p>
              )}

              {/* Progress bar */}
              {hasProgress ? (
                <SeriesProgressBar
                  completedCount={completedCount}
                  totalCount={articleCount}
                />
              ) : (
                <div className="text-xs text-rga-gray/40 uppercase tracking-wider">
                  Not started
                </div>
              )}
            </div>
          </div>
        </CyberCorners>
      </Link>
    </motion.article>
  )
}
