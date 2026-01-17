'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AsciiArtProps {
  className?: string
}

const ASCII_LOGO = `
 ██████╗  ██████╗  █████╗
 ██╔══██╗██╔════╝ ██╔══██╗
 ██████╔╝██║  ███╗███████║
 ██╔══██╗██║   ██║██╔══██║
 ██║  ██║╚██████╔╝██║  ██║
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
`.trim()

const SUBTITLE = '     MEMBERS PORTAL'

/**
 * ASCII art RGA logo with green glow effect.
 * Responsive sizing - smaller on mobile.
 */
export function AsciiArt({ className }: AsciiArtProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn('text-center', className)}
    >
      <pre
        className={cn(
          'font-mono text-rga-green text-glow-green select-none',
          'text-[8px] sm:text-[10px] md:text-xs lg:text-sm',
          'leading-tight'
        )}
        aria-label="RGA - Rogue Army"
      >
        {ASCII_LOGO}
      </pre>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className={cn(
          'font-mono text-rga-green/80 tracking-[0.3em] uppercase',
          'text-[8px] sm:text-[10px] md:text-xs',
          'mt-2'
        )}
      >
        {SUBTITLE}
      </motion.div>
    </motion.div>
  )
}
