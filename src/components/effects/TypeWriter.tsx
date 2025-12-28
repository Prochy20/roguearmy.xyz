"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TypeWriterProps {
  text: string
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
  onComplete?: () => void
}

/**
 * Typewriter effect component.
 * Reveals text character by character with an optional blinking cursor.
 */
export function TypeWriter({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
      onComplete?.()
    }
  }, [displayedText, text, speed, started, onComplete])

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {cursor && (
        <span
          className={cn(
            "inline-block w-[2px] h-[1em] bg-rga-green ml-0.5 align-middle",
            isComplete ? "animate-blink" : ""
          )}
        />
      )}
    </span>
  )
}
