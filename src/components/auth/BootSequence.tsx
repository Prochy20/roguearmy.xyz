'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface BootSequenceProps {
  className?: string
  onComplete?: () => void
  baseDelay?: number
}

interface BootLine {
  text: string
  status: string
  statusColor: 'green' | 'cyan' | 'yellow'
}

const BOOT_LINES: BootLine[] = [
  { text: 'Initializing secure connection...', status: 'OK', statusColor: 'green' },
  { text: 'Loading authentication module...', status: 'OK', statusColor: 'green' },
  { text: 'Verifying encryption protocols...', status: 'OK', statusColor: 'cyan' },
  { text: 'Awaiting credentials...', status: 'READY', statusColor: 'yellow' },
]

const LINE_DELAY = 400 // ms between each line
const TYPE_SPEED = 20 // ms per character

function BootLine({
  line,
  index,
  baseDelay,
  onComplete,
}: {
  line: BootLine
  index: number
  baseDelay: number
  onComplete?: () => void
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [showStatus, setShowStatus] = useState(false)
  const [started, setStarted] = useState(false)

  const lineDelay = baseDelay + index * LINE_DELAY

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, lineDelay)

    return () => clearTimeout(startTimer)
  }, [lineDelay])

  useEffect(() => {
    if (!started) return

    if (displayedText.length < line.text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(line.text.slice(0, displayedText.length + 1))
      }, TYPE_SPEED)
      return () => clearTimeout(timer)
    } else {
      // Show status after typing completes
      const statusTimer = setTimeout(() => {
        setShowStatus(true)
        if (index === BOOT_LINES.length - 1) {
          onComplete?.()
        }
      }, 150)
      return () => clearTimeout(statusTimer)
    }
  }, [displayedText, line.text, started, index, onComplete])

  const statusColorClass = {
    green: 'text-rga-green',
    cyan: 'text-rga-cyan',
    yellow: 'text-yellow-400',
  }[line.statusColor]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      className="flex items-center justify-between gap-4 font-mono text-xs sm:text-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-rga-cyan shrink-0">[SYSTEM]</span>
        <span className="text-text-secondary truncate">
          {displayedText}
          {started && displayedText.length < line.text.length && (
            <span className="inline-block w-0.5 h-[1em] bg-rga-green ml-0.5 align-middle animate-blink" />
          )}
        </span>
      </div>
      {showStatus && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className={cn('shrink-0 font-bold', statusColorClass)}
        >
          [{line.status}]
        </motion.span>
      )}
    </motion.div>
  )
}

/**
 * Animated boot sequence with staggered typewriter lines.
 * Displays system initialization messages with status indicators.
 */
export function BootSequence({
  className,
  onComplete,
  baseDelay = 600,
}: BootSequenceProps) {
  const handleLineComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  return (
    <div className={cn('space-y-2', className)}>
      {BOOT_LINES.map((line, index) => (
        <BootLine
          key={index}
          line={line}
          index={index}
          baseDelay={baseDelay}
          onComplete={index === BOOT_LINES.length - 1 ? handleLineComplete : undefined}
        />
      ))}
    </div>
  )
}
