"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"

const INTENSITY = 14
const COLORS: [string, string] = ["#00ffff", "#ff00ff"]

type MorphPhase =
  | "idle"
  | "glitch-out"
  | "flash"
  | "text-in"
  | "text-hold"
  | "glitch-back"
  | "flash-back"
  | "logo-in"

interface OverlayLogoProps {
  /** Minimum seconds between glitch bursts */
  minInterval?: number
  /** Maximum seconds between glitch bursts */
  maxInterval?: number
  /** Minimum seconds between morph sequences */
  minMorphInterval?: number
  /** Maximum seconds between morph sequences */
  maxMorphInterval?: number
}

/**
 * Streaming overlay logo with the same glitch effect as the homepage H1.
 * Adapted from HeroGlitch for images. Designed for OBS browser sources.
 *
 * Features:
 * - Periodic RGB chromatic aberration glitch bursts
 * - Skull → "ROGUE ARMY" text morph with CRT flash transitions
 */
export function OverlayLogo({
  minInterval = 4,
  maxInterval = 10,
  minMorphInterval = 15,
  maxMorphInterval = 25,
}: OverlayLogoProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [sliceOffsets, setSliceOffsets] = useState<number[]>([0, 0, 0, 0, 0])
  const [showText, setShowText] = useState(false)
  const [isMorphing, setIsMorphing] = useState(false)
  const [morphPhase, setMorphPhase] = useState<MorphPhase>("idle")

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const initialRef = useRef<ReturnType<typeof setTimeout>>(null)
  const morphTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const morphCleanupRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const generateSlices = useCallback((power: number): number[] => {
    return Array(5)
      .fill(0)
      .map(() => (Math.random() - 0.5) * power * 4)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (isMorphing) return

    setIsGlitching(true)

    // Phase 1: Initial spike (0-80ms)
    setSliceOffsets(generateSlices(INTENSITY))

    // Phase 2: Intense (80-200ms)
    setTimeout(() => {
      setSliceOffsets(generateSlices(INTENSITY * 1.5))
    }, 80)

    // Phase 3: Decay (200-300ms)
    setTimeout(() => {
      setSliceOffsets(generateSlices(INTENSITY * 0.5))
    }, 200)

    // Phase 4: Aftershock (300-400ms)
    setTimeout(() => {
      setSliceOffsets(generateSlices(INTENSITY * 0.2))
    }, 300)

    // End
    setTimeout(() => {
      setIsGlitching(false)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, 400)
  }, [generateSlices, isMorphing])

  // --- Morph sequence ---
  const triggerMorph = useCallback(() => {
    const isSubliminal = Math.random() < 0.4
    const holdDuration = isSubliminal
      ? 150 + Math.random() * 350 // 150-500ms
      : 2000 + Math.random() * 1000 // 2000-3000ms

    setIsMorphing(true)
    morphCleanupRef.current = []

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay)
      morphCleanupRef.current.push(id)
      return id
    }

    // Phase 1: glitch-out (0-300ms) — intensify skull glitch
    setMorphPhase("glitch-out")
    setIsGlitching(true)
    setSliceOffsets(generateSlices(INTENSITY * 2.5))

    schedule(() => setSliceOffsets(generateSlices(INTENSITY * 3)), 80)
    schedule(() => setSliceOffsets(generateSlices(INTENSITY * 2.8)), 160)
    schedule(() => setSliceOffsets(generateSlices(INTENSITY * 2)), 240)

    // Phase 2: flash (300-400ms) — CRT flash, swap content
    schedule(() => {
      setMorphPhase("flash")
      setShowText(true)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, 300)

    // Phase 3: text-in (400-650ms) — text entrance glitch
    schedule(() => {
      setMorphPhase("text-in")
      setSliceOffsets(generateSlices(INTENSITY * 1.5))
    }, 400)

    schedule(() => {
      setSliceOffsets(generateSlices(INTENSITY * 0.8))
    }, 500)

    // Phase 4: text-hold (650ms - 650+hold)
    schedule(() => {
      setMorphPhase("text-hold")
      setIsGlitching(false)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, 650)

    const holdEnd = 650 + holdDuration

    // Phase 5: glitch-back (holdEnd - holdEnd+250ms)
    schedule(() => {
      setMorphPhase("glitch-back")
      setIsGlitching(true)
      setSliceOffsets(generateSlices(INTENSITY * 2.5))
    }, holdEnd)

    schedule(() => setSliceOffsets(generateSlices(INTENSITY * 3)), holdEnd + 80)
    schedule(() => setSliceOffsets(generateSlices(INTENSITY * 2)), holdEnd + 160)

    // Phase 6: flash-back (holdEnd+250 - holdEnd+350)
    schedule(() => {
      setMorphPhase("flash-back")
      setShowText(false)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, holdEnd + 250)

    // Phase 7: logo-in (holdEnd+350 - holdEnd+700)
    schedule(() => {
      setMorphPhase("logo-in")
      setSliceOffsets(generateSlices(INTENSITY * 1))
    }, holdEnd + 350)

    schedule(() => {
      setSliceOffsets(generateSlices(INTENSITY * 0.4))
    }, holdEnd + 500)

    // Settle
    schedule(() => {
      setMorphPhase("idle")
      setIsGlitching(false)
      setIsMorphing(false)
      setSliceOffsets([0, 0, 0, 0, 0])
    }, holdEnd + 700)
  }, [generateSlices])

  // --- Normal glitch timer ---
  useEffect(() => {
    const scheduleNext = () => {
      const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000
      return setTimeout(() => {
        triggerGlitch()
        timeoutRef.current = scheduleNext()
      }, delay)
    }

    timeoutRef.current = scheduleNext()
    initialRef.current = setTimeout(triggerGlitch, 1500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (initialRef.current) clearTimeout(initialRef.current)
    }
  }, [minInterval, maxInterval, triggerGlitch])

  // --- Morph timer ---
  useEffect(() => {
    const scheduleMorph = () => {
      const delay =
        (minMorphInterval + Math.random() * (maxMorphInterval - minMorphInterval)) * 1000
      return setTimeout(() => {
        triggerMorph()
        morphTimeoutRef.current = scheduleMorph()
      }, delay)
    }

    // First morph after ~8s so logo settles first
    morphTimeoutRef.current = setTimeout(() => {
      triggerMorph()
      morphTimeoutRef.current = scheduleMorph()
    }, 8000)

    return () => {
      if (morphTimeoutRef.current) clearTimeout(morphTimeoutRef.current)
      morphCleanupRef.current.forEach(clearTimeout)
      morphCleanupRef.current = []
    }
  }, [minMorphInterval, maxMorphInterval, triggerMorph])

  const rgbOffset = INTENSITY * 0.8

  const isFlashing = morphPhase === "flash" || morphPhase === "flash-back"

  const logoImage = (
    <Image
      src="/logo.png"
      alt=""
      fill
      className="object-contain"
      aria-hidden="true"
    />
  )

  const textClasses = "font-display text-[18vw] leading-[0.85] text-center select-none whitespace-nowrap"

  // Lightweight text for RGB split / slice layers (no shadows — those layers
  // already apply their own color treatment via drop-shadow + mixBlendMode)
  const textSimple = (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className={`${textClasses} text-white`}>
        ROGUE<br />ARMY
      </span>
    </div>
  )

  const currentContent = showText ? textSimple : logoImage

  return (
    <div className="relative h-screen w-screen" style={{ perspective: "1000px" }}>
      {/* RGB Split — Cyan layer */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0.4, 0],
              x: [-rgbOffset * 2, rgbOffset, -rgbOffset * 0.5, rgbOffset * 0.3, 0],
            }}
            transition={{ duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1] }}
            className="absolute inset-0"
            style={{
              mixBlendMode: "screen",
              filter: `drop-shadow(0 0 4px ${COLORS[0]})`,
              clipPath: `polygon(
                0% ${20 + sliceOffsets[0]}%,
                100% ${20 + sliceOffsets[0]}%,
                100% ${60 + sliceOffsets[2]}%,
                0% ${60 + sliceOffsets[2]}%
              )`,
            }}
          >
            {currentContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RGB Split — Magenta layer */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0.4, 0],
              x: [rgbOffset * 2, -rgbOffset, rgbOffset * 0.5, -rgbOffset * 0.3, 0],
            }}
            transition={{ duration: 0.4, times: [0, 0.15, 0.45, 0.75, 1] }}
            className="absolute inset-0"
            style={{
              mixBlendMode: "screen",
              filter: `drop-shadow(0 0 4px ${COLORS[1]})`,
              clipPath: `polygon(
                0% ${40 + sliceOffsets[1]}%,
                100% ${40 + sliceOffsets[1]}%,
                100% ${80 + sliceOffsets[3]}%,
                0% ${80 + sliceOffsets[3]}%
              )`,
            }}
          >
            {currentContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slice layers — horizontal displacement */}
      <AnimatePresence>
        {isGlitching && sliceOffsets.map((offset, i) => (
          <motion.div
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
            {currentContent}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CRT Flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className="absolute inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.4, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              background: `
                rgba(255,255,255,0.15)
              `,
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.08) 2px,
                rgba(255,255,255,0.08) 4px
              )`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Scanline overlay during text hold */}
      <AnimatePresence>
        {morphPhase === "text-hold" && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundImage: `repeating-linear-gradient(
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
      </AnimatePresence>

      {/* Main content — logo or text */}
      <motion.div
        animate={isGlitching ? {
          x: [0, -6, 10, -4, 7, -3, 0],
          y: [0, 4, -6, 3, -3, 1, 0],
          skewX: [0, 2, -3, 1.5, -1, 0],
          scale: [1, 1.02, 0.97, 1.01, 0.99, 1],
          opacity: [1, 0.4, 1, 0.6, 1, 0.8, 1],
        } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 h-full w-full"
      >
        <AnimatePresence mode="wait">
          {showText ? (
            <motion.div
              key="text"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* Cyan chromatic offset — GPU-composited via transform */}
              <motion.span
                aria-hidden="true"
                className={`absolute ${textClasses} pointer-events-none`}
                style={{ color: COLORS[0], mixBlendMode: "screen", opacity: 0.7, willChange: "transform" }}
                animate={
                  morphPhase === "text-hold"
                    ? { x: [-4, 4, -3, -4], y: [0, 1, -1, 0] }
                    : { x: -4, y: 0 }
                }
                transition={
                  morphPhase === "text-hold"
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.1 }
                }
              >
                ROGUE<br />ARMY
              </motion.span>

              {/* Magenta chromatic offset — GPU-composited via transform */}
              <motion.span
                aria-hidden="true"
                className={`absolute ${textClasses} pointer-events-none`}
                style={{ color: COLORS[1], mixBlendMode: "screen", opacity: 0.7, willChange: "transform" }}
                animate={
                  morphPhase === "text-hold"
                    ? { x: [4, -4, 3, 4], y: [0, -1, 1, 0] }
                    : { x: 4, y: 0 }
                }
                transition={
                  morphPhase === "text-hold"
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.1 }
                }
              >
                ROGUE<br />ARMY
              </motion.span>

              {/* Main white text — static glow, painted once */}
              <span
                className={`${textClasses} text-white`}
                style={{ textShadow: "0 0 40px rgba(255,255,255,0.8)" }}
              >
                ROGUE<br />ARMY
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Image
                src="/logo.png"
                alt="Rogue Army Logo"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Global styles for scanlines animation */}
      <style jsx global>{`
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
      `}</style>
    </div>
  )
}
