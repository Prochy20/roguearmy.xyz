"use client"

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface HeroGlitchProps {
  children: React.ReactNode
  className?: string
  /** Minimum seconds between glitches */
  minInterval?: number
  /** Maximum seconds between glitches */
  maxInterval?: number
  /** Glitch intensity 1-10 */
  intensity?: number
  /** Enable data corruption effect (character scrambling) */
  dataCorruption?: boolean
  /** Enable scanline overlay */
  scanlines?: boolean
  /** Custom glitch colors [color1, color2] */
  colors?: [string, string]
}

// Characters used for data corruption effect
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________"

/**
 * Intense periodic glitch effect for hero sections.
 * Features: RGB split, text slicing, data corruption, scanlines, flicker
 */
export function HeroGlitch({
  children,
  className,
  minInterval = 3,
  maxInterval = 8,
  intensity = 7,
  dataCorruption = true,
  scanlines = true,
  colors = ["#00ffff", "#ff00ff"],
}: HeroGlitchProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchPhase, setGlitchPhase] = useState(0)
  const [corruptedText, setCorruptedText] = useState<string | null>(null)
  const [sliceOffsets, setSliceOffsets] = useState<number[]>([0, 0, 0, 0, 0])

  // Extract text content for corruption effect
  const textContent = useMemo(() => {
    if (typeof children === "string") return children
    // For React elements, try to extract text
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node
      if (typeof node === "number") return String(node)
      if (Array.isArray(node)) return node.map(extractText).join("")
      if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return extractText(node.props.children)
      }
      return ""
    }
    return extractText(children)
  }, [children])

  // Generate corrupted text
  const corruptText = useCallback((text: string, corruption: number): string => {
    return text
      .split("")
      .map((char) => {
        if (char === " ") return char
        if (Math.random() < corruption * 0.1) {
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }
        return char
      })
      .join("")
  }, [])

  // Generate random slice offsets
  const generateSlices = useCallback((power: number): number[] => {
    return Array(5)
      .fill(0)
      .map(() => (Math.random() - 0.5) * power * 4)
  }, [])

  // Trigger a glitch sequence
  const triggerGlitch = useCallback(() => {
    setIsGlitching(true)

    // Phase 1: Initial spike (0-80ms)
    setGlitchPhase(1)
    setSliceOffsets(generateSlices(intensity))
    if (dataCorruption) {
      setCorruptedText(corruptText(textContent, intensity * 0.5))
    }

    // Phase 2: Intense (80-200ms)
    setTimeout(() => {
      setGlitchPhase(2)
      setSliceOffsets(generateSlices(intensity * 1.5))
      if (dataCorruption) {
        setCorruptedText(corruptText(textContent, intensity * 0.8))
      }
    }, 80)

    // Phase 3: Decay (200-300ms)
    setTimeout(() => {
      setGlitchPhase(3)
      setSliceOffsets(generateSlices(intensity * 0.5))
      if (dataCorruption) {
        setCorruptedText(corruptText(textContent, intensity * 0.3))
      }
    }, 200)

    // Phase 4: Aftershock (300-400ms)
    setTimeout(() => {
      setGlitchPhase(4)
      setSliceOffsets(generateSlices(intensity * 0.2))
      setCorruptedText(null)
    }, 300)

    // End glitch
    setTimeout(() => {
      setIsGlitching(false)
      setGlitchPhase(0)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, 400)
  }, [intensity, dataCorruption, textContent, corruptText, generateSlices])

  // Set up periodic glitch triggers
  useEffect(() => {
    const scheduleNextGlitch = () => {
      const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000
      return setTimeout(() => {
        triggerGlitch()
        timeoutRef.current = scheduleNextGlitch()
      }, delay)
    }

    const timeoutRef = { current: scheduleNextGlitch() }

    // Initial glitch after a short delay
    const initialTimeout = setTimeout(() => {
      triggerGlitch()
    }, 1500)

    return () => {
      clearTimeout(timeoutRef.current)
      clearTimeout(initialTimeout)
    }
  }, [minInterval, maxInterval, triggerGlitch])

  // Calculate intensity-based values
  const rgbOffset = intensity * 0.8
  const flickerOpacity = glitchPhase === 2 ? 0.15 : glitchPhase === 1 ? 0.08 : 0

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      style={{ perspective: "1000px" }}
    >
      {/* Scanline overlay */}
      {scanlines && isGlitching && (
        <div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.15) 2px,
              rgba(0,0,0,0.15) 4px
            )`,
            animation: "scanlines 0.1s linear infinite",
          }}
        />
      )}

      {/* Flicker overlay */}
      <AnimatePresence>
        {isGlitching && flickerOpacity > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: flickerOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
            className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* RGB Split - Cyan layer */}
      <AnimatePresence>
        {isGlitching && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0.4, 0],
              x: [-rgbOffset * 2, rgbOffset, -rgbOffset * 0.5, rgbOffset * 0.3, 0],
            }}
            transition={{ duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1] }}
            className="absolute inset-0"
            style={{
              color: colors[0],
              mixBlendMode: "screen",
              clipPath: `polygon(
                0% ${20 + sliceOffsets[0]}%,
                100% ${20 + sliceOffsets[0]}%,
                100% ${60 + sliceOffsets[2]}%,
                0% ${60 + sliceOffsets[2]}%
              )`,
            }}
          >
            {corruptedText || children}
          </motion.span>
        )}
      </AnimatePresence>

      {/* RGB Split - Magenta layer */}
      <AnimatePresence>
        {isGlitching && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0.4, 0],
              x: [rgbOffset * 2, -rgbOffset, rgbOffset * 0.5, -rgbOffset * 0.3, 0],
            }}
            transition={{ duration: 0.4, times: [0, 0.15, 0.45, 0.75, 1] }}
            className="absolute inset-0"
            style={{
              color: colors[1],
              mixBlendMode: "screen",
              clipPath: `polygon(
                0% ${40 + sliceOffsets[1]}%,
                100% ${40 + sliceOffsets[1]}%,
                100% ${80 + sliceOffsets[3]}%,
                0% ${80 + sliceOffsets[3]}%
              )`,
            }}
          >
            {corruptedText || children}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Slice layers - horizontal displacement */}
      <AnimatePresence>
        {isGlitching && sliceOffsets.map((offset, i) => (
          <motion.span
            key={`slice-${i}`}
            aria-hidden="true"
            initial={{ x: 0, opacity: 0 }}
            animate={{
              x: offset * (i % 2 === 0 ? 1 : -1),
              opacity: Math.abs(offset) > 2 ? 0.9 : 0,
            }}
            exit={{ x: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{
              clipPath: `polygon(
                0% ${i * 20}%,
                100% ${i * 20}%,
                100% ${(i + 1) * 20}%,
                0% ${(i + 1) * 20}%
              )`,
              filter: Math.abs(offset) > 3 ? "brightness(1.2)" : "none",
            }}
          >
            {children}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main text layer */}
      <motion.span
        animate={isGlitching ? {
          x: [0, -2, 3, -1, 2, -1, 0],
          y: [0, 1, -1, 0.5, -0.5, 0],
          skewX: [0, 0.5, -0.8, 0.3, -0.2, 0],
          scale: [1, 1.002, 0.998, 1.001, 0.999, 1],
        } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 inline-block"
        style={{
          textShadow: isGlitching
            ? `${rgbOffset}px 0 ${colors[0]}, ${-rgbOffset}px 0 ${colors[1]}`
            : "none",
        }}
      >
        {dataCorruption && corruptedText && glitchPhase <= 2 ? (
          <span className="glitch-corrupt">{corruptedText}</span>
        ) : (
          children
        )}
      </motion.span>

      {/* Noise grain overlay during glitch */}
      {isGlitching && (
        <div
          className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            animation: "noise 0.1s steps(2) infinite",
          }}
        />
      )}

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }

        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(5%, 5%); }
          30% { transform: translate(-5%, 5%); }
          40% { transform: translate(5%, -5%); }
          50% { transform: translate(-5%, 0); }
          60% { transform: translate(5%, 0); }
          70% { transform: translate(0, 5%); }
          80% { transform: translate(0, -5%); }
          90% { transform: translate(5%, 5%); }
        }

        .glitch-corrupt {
          font-feature-settings: "liga" 0;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  )
}
