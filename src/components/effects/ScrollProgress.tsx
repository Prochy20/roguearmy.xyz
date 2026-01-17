'use client'

import { motion, useScroll, useTransform } from 'motion/react'

/**
 * Minimal scroll progress indicator
 * Ultra-thin line at the top with subtle glow at leading edge
 * Uses Framer Motion's useScroll for buttery smooth performance
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  // Transform scroll progress (0-1) to percentage width
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Fade in after 2% scroll
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.03], [0, 0, 1])

  return (
    <motion.div
      style={{ opacity }}
      className="fixed top-0 left-0 right-0 z-[100] h-px pointer-events-none"
    >
      {/* Progress line */}
      <motion.div
        className="h-full origin-left"
        style={{
          width,
          background: `linear-gradient(90deg,
            rgba(0,255,65,0.1) 0%,
            rgba(0,255,65,0.5) 50%,
            #00FF41 100%
          )`,
          boxShadow: '0 0 8px rgba(0,255,65,0.4)',
        }}
      />

      {/* Leading edge glow */}
      <motion.div
        className="absolute top-0 h-3 w-12 -translate-y-1/2"
        style={{
          left: width,
          x: -48,
          opacity,
          background: `radial-gradient(ellipse at right, rgba(0,255,65,0.3) 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}
