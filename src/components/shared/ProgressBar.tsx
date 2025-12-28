"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  label: string
  value: number
  max?: number
  className?: string
  color?: "green" | "cyan" | "magenta"
  animated?: boolean
  showValue?: boolean
}

/**
 * Terminal-style progress bar with fill animation.
 * Uses ASCII-style brackets and animates the fill on scroll into view.
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  className,
  color = "green",
  animated = true,
  showValue = true,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const percentage = Math.min((displayValue / max) * 100, 100)

  const colorClasses = {
    green: "bg-rga-green shadow-[0_0_10px_rgba(0,255,65,0.5)]",
    cyan: "bg-rga-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]",
    magenta: "bg-rga-magenta shadow-[0_0_10px_rgba(255,0,255,0.5)]",
  }

  const textColorClasses = {
    green: "text-rga-green",
    cyan: "text-rga-cyan",
    magenta: "text-rga-magenta",
  }

  useEffect(() => {
    if (!animated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [animated])

  useEffect(() => {
    if (!animated || !isVisible) return

    const duration = 1500 // ms
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [animated, isVisible, value])

  return (
    <div ref={ref} className={cn("font-mono text-sm", className)}>
      <div className="flex justify-between mb-1">
        <span className="text-text-secondary">{label}</span>
        {showValue && (
          <span className={cn(textColorClasses[color])}>
            {displayValue}/{max}
          </span>
        )}
      </div>
      <div className="relative h-4 bg-bg-elevated border border-border rounded-sm overflow-hidden">
        {/* Track pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              rgba(255,255,255,0.1) 4px,
              rgba(255,255,255,0.1) 5px
            )`,
          }}
        />
        {/* Fill */}
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
