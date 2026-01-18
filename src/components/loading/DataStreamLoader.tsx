'use client'

import { useState, useEffect, useMemo } from 'react'

interface DataStreamLoaderProps {
  /** Number of scrambling data lines to display */
  lines?: number
  /** Status message shown at the top */
  statusMessage?: string
}

// Block characters + alphanumeric for variety
const CHARS = '░▒▓█ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Line lengths to create visual variety (mimics data packets)
const DEFAULT_LINE_LENGTHS = [45, 58, 38, 28, 42, 52, 36]

/**
 * Generate a random scrambled string of specified length
 */
function generateScrambledLine(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return result
}

/**
 * DataStreamLoader - A terminal-style loading animation with scrambling text.
 * Displays corrupted data stream effect while content loads.
 */
export function DataStreamLoader({
  lines = 7,
  statusMessage = 'RETRIEVING TRANSMISSION',
}: DataStreamLoaderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [dataLines, setDataLines] = useState<string[]>([])
  const [cyanFlashIndex, setCyanFlashIndex] = useState<{
    line: number
    char: number
  } | null>(null)

  // Calculate line lengths based on number of lines requested
  const lineLengths = useMemo(() => {
    const lengths: number[] = []
    for (let i = 0; i < lines; i++) {
      lengths.push(DEFAULT_LINE_LENGTHS[i % DEFAULT_LINE_LENGTHS.length])
    }
    return lengths
  }, [lines])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Initialize and update scrambled lines
  useEffect(() => {
    if (prefersReducedMotion) return

    // Initialize lines
    setDataLines(lineLengths.map((len) => generateScrambledLine(len)))

    // Update scrambling every 50-100ms
    const interval = setInterval(() => {
      setDataLines(lineLengths.map((len) => generateScrambledLine(len)))

      // Occasionally flash a cyan character (1 in 4 chance)
      if (Math.random() > 0.75) {
        const lineIdx = Math.floor(Math.random() * lines)
        const charIdx = Math.floor(Math.random() * lineLengths[lineIdx])
        setCyanFlashIndex({ line: lineIdx, char: charIdx })

        // Clear cyan flash after a short delay
        setTimeout(() => setCyanFlashIndex(null), 100)
      }
    }, 70)

    return () => clearInterval(interval)
  }, [prefersReducedMotion, lines, lineLengths])

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading article content"
        className="font-mono text-rga-green/80 py-8"
      >
        <p>Loading content...</p>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading article content"
      className="font-mono py-4 select-none"
    >
      {/* Status Line */}
      <div className="flex items-center gap-1 mb-6">
        <span
          className="animate-blink text-rga-green text-glow-green"
          aria-hidden="true"
        >
          ▌
        </span>
        <span className="text-rga-green text-glow-green tracking-wider">
          {statusMessage}...
        </span>
      </div>

      {/* Scrambling Data Lines */}
      <div className="space-y-1.5" aria-hidden="true">
        {dataLines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="text-rga-green/60 text-sm leading-relaxed tracking-wide overflow-hidden"
          >
            {line.split('').map((char, charIndex) => {
              const isCyanFlash =
                cyanFlashIndex?.line === lineIndex &&
                cyanFlashIndex?.char === charIndex

              return (
                <span
                  key={charIndex}
                  className={
                    isCyanFlash
                      ? 'text-rga-cyan text-glow-cyan transition-colors duration-100'
                      : ''
                  }
                >
                  {char}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading article content, please wait.</span>
    </div>
  )
}
