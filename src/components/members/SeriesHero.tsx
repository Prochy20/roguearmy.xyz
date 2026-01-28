'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { CyberButton } from './CyberButton'
import { SeriesProgressBar } from './SeriesProgressBar'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { CyberTag } from '@/components/ui/CyberCorners'
import type { ArticleImage } from '@/lib/articles'

interface SeriesHeroProps {
  name: string
  description: string | null
  heroImage: ArticleImage | null
  articleCount: number
  completedCount?: number
}

/**
 * Full-width hero section for series detail page
 * Matches ArticleHero's dramatic visual design
 */
export function SeriesHero({
  name,
  description,
  heroImage,
  articleCount,
  completedCount,
}: SeriesHeroProps) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {heroImage ? (
          <Image
            src={heroImage.url}
            alt={heroImage.alt}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-bg-surface flex items-center justify-center">
            <BookOpen className="w-32 h-32 text-rga-gray/5" />
          </div>
        )}

        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-void/20" />
        <div className="absolute inset-0 bg-linear-to-r from-void/50 via-transparent to-void/30" />
        <div className="absolute inset-0 bg-linear-to-b from-void/60 via-transparent to-transparent h-40" />

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
        <div className="max-w-5xl">
          {/* Back button and series badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <CyberButton
              href="/blog/series"
              iconLeft={<ArrowLeft className="w-4 h-4" />}
              color="gray"
            >
              All series
            </CyberButton>
            <CyberTag color="cyan" className="text-sm text-rga-cyan">
              {articleCount} {articleCount === 1 ? 'article' : 'articles'}
            </CyberTag>
          </motion.div>

          {/* Title with HeroGlitch */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="font-display text-[10vw] md:text-[8vw] lg:text-[6vw] leading-[0.85] tracking-tight">
              <HeroGlitch
                minInterval={4}
                maxInterval={10}
                intensity={8}
                dataCorruption
                scanlines
              >
                <span className="text-white">{name}</span>
              </HeroGlitch>
            </h1>
          </motion.div>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-rga-gray text-lg md:text-xl max-w-2xl mb-8"
            >
              {description}
            </motion.p>
          )}

          {/* Progress bar */}
          {completedCount !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="max-w-sm"
            >
              <SeriesProgressBar
                completedCount={completedCount}
                totalCount={articleCount}
                size="md"
              />
            </motion.div>
          )}
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
            <div className="w-px h-12 bg-linear-to-b from-rga-cyan/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Articles section indicator */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-rga-gray/40">
          Articles in this series
        </span>
      </div>
    </section>
  )
}
