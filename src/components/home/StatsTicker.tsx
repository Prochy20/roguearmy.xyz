"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"

const STATS = [
  { label: "MEMBERS", value: 200, suffix: "+" },
  { label: "YEARS ACTIVE", value: 5, suffix: "" },
  { label: "RAIDS COMPLETED", value: 1000, suffix: "+" },
  { label: "GAMES SUPPORTED", value: 8, suffix: "" },
  { label: "COUNTRIES", value: 15, suffix: "+" },
]

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number
  suffix: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
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
  }, [isVisible, value])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

/**
 * Stats Ticker Section
 * Corrupted data stream aesthetic with scrolling numbers
 */
export function StatsTicker() {
  return (
    <section className="relative py-12 overflow-hidden bg-bg-elevated border-y border-border">
      {/* Corrupted data background effect */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.1) 2px,
            rgba(0, 255, 65, 0.1) 4px
          )`,
        }}
      />

      {/* Ticker content */}
      <div className="relative">
        <motion.div
          className="flex gap-16 md:gap-24"
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Duplicate stats for seamless loop */}
          {[...STATS, ...STATS].map((stat, index) => (
            <div
              key={`${stat.label}-${index}`}
              className="flex flex-col items-center min-w-max px-8"
            >
              <span className="font-display text-4xl md:text-6xl text-rga-green text-glow-green">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-text-muted text-xs md:text-sm font-mono uppercase tracking-widest mt-2">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Glitch lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-rga-cyan/20" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-rga-magenta/20" />
      </div>
    </section>
  )
}
