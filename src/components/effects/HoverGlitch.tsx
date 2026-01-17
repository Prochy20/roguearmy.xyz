'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface HoverGlitchProps {
  children: React.ReactNode
  className?: string
  /** Glitch intensity 1-10 */
  intensity?: number
  /** Enable data corruption effect (character scrambling) */
  dataCorruption?: boolean
  /** Custom glitch colors [color1, color2] */
  colors?: [string, string]
}

// Characters used for data corruption effect
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________'

/**
 * Hover-triggered intense glitch effect similar to HeroGlitch.
 * Features: RGB split, text slicing, data corruption
 */
export function HoverGlitch({
  children,
  className,
  intensity = 6,
  dataCorruption = true,
  colors = ['#00ffff', '#ff00ff'],
}: HoverGlitchProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchPhase, setGlitchPhase] = useState(0)
  const [corruptedText, setCorruptedText] = useState<string | null>(null)
  const [sliceOffsets, setSliceOffsets] = useState<number[]>([0, 0, 0, 0, 0])

  // Extract text content for corruption effect
  const textContent = useMemo(() => {
    if (typeof children === 'string') return children
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node
      if (typeof node === 'number') return String(node)
      if (Array.isArray(node)) return node.map(extractText).join('')
      if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return extractText(node.props.children)
      }
      return ''
    }
    return extractText(children)
  }, [children])

  // Generate corrupted text
  const corruptText = useCallback(
    (text: string, corruption: number): string => {
      return text
        .split('')
        .map((char) => {
          if (char === ' ') return char
          if (Math.random() < corruption * 0.1) {
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          }
          return char
        })
        .join('')
    },
    []
  )

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

  const handleMouseEnter = () => {
    if (!isGlitching) {
      triggerGlitch()
    }
  }

  // Calculate intensity-based values
  const rgbOffset = intensity * 0.8
  const flickerOpacity =
    glitchPhase === 2 ? 0.15 : glitchPhase === 1 ? 0.08 : 0

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: '1000px' }}
    >
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
              x: [
                -rgbOffset * 2,
                rgbOffset,
                -rgbOffset * 0.5,
                rgbOffset * 0.3,
                0,
              ],
            }}
            transition={{ duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1] }}
            className="absolute inset-0"
            style={{
              color: colors[0],
              mixBlendMode: 'screen',
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
              x: [
                rgbOffset * 2,
                -rgbOffset,
                rgbOffset * 0.5,
                -rgbOffset * 0.3,
                0,
              ],
            }}
            transition={{ duration: 0.4, times: [0, 0.15, 0.45, 0.75, 1] }}
            className="absolute inset-0"
            style={{
              color: colors[1],
              mixBlendMode: 'screen',
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
        {isGlitching &&
          sliceOffsets.map((offset, i) => (
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
                filter: Math.abs(offset) > 3 ? 'brightness(1.2)' : 'none',
              }}
            >
              {children}
            </motion.span>
          ))}
      </AnimatePresence>

      {/* Main text layer */}
      <motion.span
        animate={
          isGlitching
            ? {
                x: [0, -2, 3, -1, 2, -1, 0],
                y: [0, 1, -1, 0.5, -0.5, 0],
                skewX: [0, 0.5, -0.8, 0.3, -0.2, 0],
                scale: [1, 1.002, 0.998, 1.001, 0.999, 1],
              }
            : {}
        }
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="relative z-10 inline-block"
        style={{
          textShadow: isGlitching
            ? `${rgbOffset}px 0 ${colors[0]}, ${-rgbOffset}px 0 ${colors[1]}`
            : 'none',
        }}
      >
        {dataCorruption && corruptedText && glitchPhase <= 2 ? (
          <span style={{ fontFeatureSettings: '"liga" 0', letterSpacing: '0.05em' }}>
            {corruptedText}
          </span>
        ) : (
          children
        )}
      </motion.span>
    </div>
  )
}
