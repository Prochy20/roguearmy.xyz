'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ReadingStatusProps {
  /** Total reading time in minutes */
  readingTime: number
}

/**
 * Terminal-style reading status bar
 * Appears at bottom of screen after scrolling
 * Shows progress percentage and estimated time remaining
 */
export function ReadingStatus({ readingTime }: ReadingStatusProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(readingTime)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const calculate = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      setProgress(Math.min(scrollProgress, 100))
      setTimeRemaining(Math.max(0, Math.ceil(readingTime * (1 - scrollProgress / 100))))

      // Show after scrolling past 15% of viewport
      const threshold = window.innerHeight * 0.15
      setIsVisible(scrollTop > threshold)
    }

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(calculate)
    }

    calculate()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [readingTime])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div
        className={cn(
          'group relative flex items-center gap-4 px-4 py-2',
          'bg-void/80 backdrop-blur-md',
          'font-mono text-[11px] tracking-wider',
          'transition-all duration-300'
        )}
      >
        {/* Border */}
        <span className="absolute inset-0 border border-rga-green/10 group-hover:border-rga-green/20 transition-colors duration-300" />

        {/* Corner accents - all four corners */}
        <span className="absolute top-0 left-0 w-2 h-px bg-rga-green/50" />
        <span className="absolute top-0 left-0 w-px h-2 bg-rga-green/50" />
        <span className="absolute top-0 right-0 w-2 h-px bg-rga-green/50" />
        <span className="absolute top-0 right-0 w-px h-2 bg-rga-green/50" />
        <span className="absolute bottom-0 left-0 w-2 h-px bg-rga-green/50" />
        <span className="absolute bottom-0 left-0 w-px h-2 bg-rga-green/50" />
        <span className="absolute bottom-0 right-0 w-2 h-px bg-rga-green/50" />
        <span className="absolute bottom-0 right-0 w-px h-2 bg-rga-green/50" />

        {/* Status indicator dot */}
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute w-1.5 h-1.5 rounded-full bg-rga-green/80 animate-pulse" />
          <span className="absolute w-2 h-2 rounded-full bg-rga-green/20" />
        </span>

        {/* Progress section */}
        <div className="flex items-center gap-2">
          <span className="text-rga-gray/40 uppercase">Progress</span>
          <span className="text-rga-green tabular-nums w-[3ch] text-right">
            {Math.round(progress)}
          </span>
          <span className="text-rga-green/60">%</span>
        </div>

        {/* Separator */}
        <span className="w-px h-3 bg-rga-green/20" />

        {/* Mini progress bar */}
        <div className="relative w-16 h-1 bg-rga-green/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-rga-green/60"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          {/* Scanline effect on bar */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
            }}
          />
        </div>

        {/* Separator */}
        <span className="w-px h-3 bg-rga-green/20" />

        {/* Time remaining */}
        <div className="flex items-center gap-2">
          <span className="text-rga-gray/40 uppercase">Eta</span>
          <span className="text-rga-green tabular-nums">
            {timeRemaining > 0 ? `${timeRemaining}m` : '--'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
