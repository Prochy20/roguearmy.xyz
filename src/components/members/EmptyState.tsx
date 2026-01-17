'use client'

import { motion } from 'motion/react'
import { GlowButton } from '@/components/shared/GlowButton'

interface EmptyStateProps {
  onClearFilters: () => void
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Glitchy NO SIGNAL container */}
      <div className="relative mb-8">
        {/* Scanlines background */}
        <div className="absolute inset-0 -m-8 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.05)_2px,rgba(0,255,65,0.05)_4px)] pointer-events-none" />

        {/* Main text with glitch effect */}
        <motion.div
          animate={{
            x: [0, -2, 2, -1, 1, 0],
            skewX: [0, 0.5, -0.5, 0.3, -0.3, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          {/* Cyan offset layer */}
          <motion.span
            animate={{
              x: [-3, 3, -2, 2, 0],
              opacity: [0.7, 0, 0.5, 0, 0.7],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute inset-0 text-rga-cyan font-display text-4xl md:text-5xl tracking-wider"
            style={{ clipPath: 'inset(0 0 50% 0)' }}
            aria-hidden="true"
          >
            NO SIGNAL
          </motion.span>

          {/* Magenta offset layer */}
          <motion.span
            animate={{
              x: [3, -3, 2, -2, 0],
              opacity: [0.7, 0, 0.5, 0, 0.7],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 0.05,
            }}
            className="absolute inset-0 text-rga-magenta font-display text-4xl md:text-5xl tracking-wider"
            style={{ clipPath: 'inset(50% 0 0 0)' }}
            aria-hidden="true"
          >
            NO SIGNAL
          </motion.span>

          {/* Main text */}
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider text-chromatic">
            NO SIGNAL
          </h2>
        </motion.div>

        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            times: [0, 0.5, 1],
          }}
          className="inline-block ml-2 w-3 h-8 md:h-10 bg-rga-green align-middle"
        />
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-rga-gray text-center max-w-md mb-6"
      >
        No articles match your current filters. Try adjusting your search or
        clear all filters to see everything.
      </motion.p>

      {/* Static noise animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 0.1, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Clear Filters Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlowButton onClick={onClearFilters} glowColor="green" pulse={false}>
          Clear All Filters
        </GlowButton>
      </motion.div>
    </div>
  )
}
