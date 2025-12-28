"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "motion/react"
import { cn } from "@/lib/utils"

interface GlitchTextProps {
  children: React.ReactNode
  className?: string
  trigger?: "scroll" | "hover" | "always"
  chromatic?: boolean
  duration?: number
}

/**
 * Glitched text with RGB chromatic aberration effect.
 * Can be triggered on scroll, hover, or run continuously.
 */
export function GlitchText({
  children,
  className,
  trigger = "scroll",
  chromatic = true,
  duration = 0.6,
}: GlitchTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchKey, setGlitchKey] = useState(0)

  // Scroll-triggered glitch
  useEffect(() => {
    if (trigger === "scroll" && isInView) {
      setIsGlitching(true)
      setGlitchKey((prev) => prev + 1)
      const timer = setTimeout(() => setIsGlitching(false), duration * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, trigger, duration])

  // Always glitching
  useEffect(() => {
    if (trigger === "always") {
      setIsGlitching(true)
    }
  }, [trigger])

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsGlitching(true)
      setGlitchKey((prev) => prev + 1)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setTimeout(() => setIsGlitching(false), duration * 1000)
    }
  }

  return (
    <div
      ref={ref}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main text */}
      <motion.span
        key={glitchKey}
        initial={false}
        animate={isGlitching ? {
          x: [0, -2, 3, -1, 2, 0],
          skewX: [0, 1, -1, 0.5, -0.5, 0],
        } : {}}
        transition={{
          duration: duration,
          ease: "easeInOut",
        }}
        className={cn(
          "relative inline-block",
          chromatic && isGlitching && "text-chromatic"
        )}
      >
        {children}
      </motion.span>

      {/* Glitch layers - only visible when glitching */}
      {isGlitching && (
        <>
          {/* Cyan offset layer */}
          <motion.span
            key={`cyan-${glitchKey}`}
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.7, 0, 0.5, 0],
              x: [-4, 4, -2, 3, 0],
              y: [0, 1, -1, 0],
            }}
            transition={{
              duration: duration,
              times: [0, 0.2, 0.4, 0.7, 1],
            }}
            className="absolute inset-0 text-rga-cyan"
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            {children}
          </motion.span>

          {/* Magenta offset layer */}
          <motion.span
            key={`magenta-${glitchKey}`}
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.7, 0, 0.5, 0],
              x: [4, -4, 2, -3, 0],
              y: [0, -1, 1, 0],
            }}
            transition={{
              duration: duration,
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            className="absolute inset-0 text-rga-magenta"
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            {children}
          </motion.span>

          {/* Flash overlay */}
          <motion.span
            key={`flash-${glitchKey}`}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0, 0.15, 0],
            }}
            transition={{
              duration: duration * 0.5,
            }}
            className="absolute inset-0 bg-white mix-blend-overlay"
          />
        </>
      )}
    </div>
  )
}
