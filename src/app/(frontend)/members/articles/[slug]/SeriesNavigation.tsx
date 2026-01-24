'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { type Article, type SeriesNavigation as SeriesNavType } from '@/lib/articles'
import { type ArticleProgress } from '@/lib/progress.server'
import { ReadStatusIndicator, getReadStatus } from '@/components/members/ReadStatusIndicator'

// ============================================================================
// SERIES NAV CARD - Mini article card for prev/next navigation
// ============================================================================

interface SeriesNavCardProps {
  article: Article
  direction: 'previous' | 'next'
  progress?: ArticleProgress
}

function SeriesNavCard({ article, direction, progress }: SeriesNavCardProps) {
  const isPrevious = direction === 'previous'
  const color = isPrevious ? 'cyan' : 'magenta'
  const Icon = isPrevious ? ChevronLeft : ChevronRight

  // Show only left corners for previous, right corners for next
  const corners: ('tl' | 'tr' | 'bl' | 'br')[] = isPrevious
    ? ['tl', 'bl']
    : ['tr', 'br']

  const colorStyles = {
    cyan: {
      border: 'border-rga-cyan/20',
      hoverBorder: 'hover:border-rga-cyan/40',
      text: 'text-rga-cyan',
      glow: 'group-hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]',
    },
    magenta: {
      border: 'border-rga-magenta/20',
      hoverBorder: 'hover:border-rga-magenta/40',
      text: 'text-rga-magenta',
      glow: 'group-hover:shadow-[0_0_20px_rgba(255,0,255,0.15)]',
    },
  }

  const styles = colorStyles[color]

  return (
    <Link
      href={`/members/articles/${article.slug}`}
      className={cn(
        'group block',
        isPrevious ? 'text-left' : 'text-right'
      )}
    >
      <CyberCorners color={color} size="sm" corners={corners} glow>
        <div
          className={cn(
            'relative overflow-hidden border bg-bg-elevated/50 backdrop-blur-sm transition-all duration-300',
            'p-4',
            styles.border,
            styles.hoverBorder,
            styles.glow
          )}
        >
          {/* Direction label */}
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs uppercase tracking-wider mb-3',
              styles.text,
              isPrevious ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{isPrevious ? 'Previous' : 'Next'}</span>
          </div>

          {/* Content row */}
          <div
            className={cn(
              'flex items-start gap-3',
              isPrevious ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-sm">
              <Image
                src={article.heroImage.url}
                alt={article.heroImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div
                className={cn(
                  'absolute inset-0 opacity-30 mix-blend-overlay',
                  isPrevious ? 'bg-rga-cyan' : 'bg-rga-magenta'
                )}
              />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-rga-gray transition-colors">
                {article.title}
              </h4>
              <div
                className={cn(
                  'flex items-center gap-2 mt-2 text-xs text-rga-gray/60',
                  isPrevious ? 'justify-start' : 'justify-end'
                )}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime} min</span>
                </div>
                {progress !== undefined && (
                  <ReadStatusIndicator
                    status={getReadStatus(progress?.progress, progress?.completed)}
                    progress={progress?.progress}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Scanline effect on hover */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.02)_2px,rgba(0,255,65,0.02)_4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </CyberCorners>
    </Link>
  )
}

// ============================================================================
// SERIES NAVIGATION - Main container with header, cards, and progress
// ============================================================================

/** Serialized progress object (Map converted to plain object for server->client) */
type SeriesProgressRecord = Record<string, ArticleProgress>

interface SeriesNavigationProps {
  navigation: SeriesNavType
  seriesProgress?: SeriesProgressRecord
}

export function SeriesNavigation({ navigation, seriesProgress }: SeriesNavigationProps) {
  const { seriesName, seriesSlug, currentOrder, totalParts, articleIds, previous, next } = navigation

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-16 pt-8 border-t border-rga-green/10"
    >
      {/* Series header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {/* Series indicator line */}
          <div className="w-1 h-8 bg-gradient-to-b from-rga-cyan via-rga-green to-rga-magenta rounded-full" />
          <div>
            <p className="text-xs uppercase tracking-wider text-rga-gray/50 mb-0.5">
              Part of a series
            </p>
            <Link
              href={`/members/series/${seriesSlug}`}
              className="group flex items-center gap-1.5 text-base font-medium text-white hover:text-rga-cyan transition-colors"
            >
              {seriesName}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-rga-cyan" />
            </Link>
          </div>
        </div>

        {/* Series position badge */}
        <CyberTag color="green" className="text-rga-green">
          Part {currentOrder} of {totalParts}
        </CyberTag>
      </div>

      {/* Navigation cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous card - only show if exists */}
        {previous ? (
          <SeriesNavCard
            article={previous}
            direction="previous"
            progress={seriesProgress?.[previous.id]}
          />
        ) : (
          <div /> // Empty placeholder to maintain grid
        )}

        {/* Next card - only show if exists */}
        {next ? (
          <SeriesNavCard
            article={next}
            direction="next"
            progress={seriesProgress?.[next.id]}
          />
        ) : (
          <div /> // Empty placeholder to maintain grid
        )}
      </div>

      {/* Progress dots - minimalist style */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {articleIds.map((articleId, index) => {
          const partNumber = index + 1
          const isCurrent = partNumber === currentOrder
          const progress = seriesProgress?.[articleId]
          const isCompleted = progress?.completed ?? false
          const isInProgress = progress && !progress.completed && progress.progress > 0

          // Determine visual state
          const showAsCompleted = seriesProgress ? isCompleted : partNumber < currentOrder
          const showAsInProgress = seriesProgress ? isInProgress : isCurrent

          return (
            <div
              key={articleId}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                showAsCompleted && 'bg-rga-green shadow-[0_0_6px_rgba(0,255,65,0.6)]',
                showAsInProgress && !showAsCompleted && 'bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.6)]',
                !showAsCompleted && !showAsInProgress && 'bg-rga-gray/30',
                isCurrent && 'scale-150'
              )}
            />
          )
        })}
      </div>
    </motion.section>
  )
}
