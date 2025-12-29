"use client"

import { cn } from "@/lib/utils"

interface ScanlineOverlayProps {
  className?: string
  intensity?: "low" | "medium" | "high"
  animated?: boolean
}

/**
 * CRT-style scanline overlay effect.
 * Adds horizontal lines that sweep across the content for a retro monitor feel.
 */
export function ScanlineOverlay({
  className,
  intensity = "medium",
  animated = true,
}: ScanlineOverlayProps) {
  const opacityClasses = {
    low: "opacity-[0.02]",
    medium: "opacity-[0.04]",
    high: "opacity-[0.08]",
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-50",
        opacityClasses[intensity],
        className
      )}
    >
      {/* Scanlines background */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`,
        }}
      />
      {/* Animated sweep line */}
      {animated && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-rga-green/20 animate-scanline"
          style={{
            boxShadow: "0 0 10px var(--color-rga-green), 0 0 20px var(--color-rga-green)",
          }}
        />
      )}
    </div>
  )
}
