"use client"

import { useRef, useMemo } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

type BleedVariant =
  | "data-corruption"    // Binary/hex fragments, digital noise - SUBTLE
  | "signal-decay"       // VHS tracking lines, horizontal tear - MEDIUM
  | "chromatic-shatter"  // RGB split with glass shard fragments - DRAMATIC
  | "void-breach"        // Dark void opening with edge glow - DRAMATIC

type BleedScale = "subtle" | "medium" | "dramatic"

interface SectionBleedProps {
  className?: string
  variant?: BleedVariant
  /** How much the effect bleeds into adjacent sections */
  scale?: BleedScale
  /** Color theme from the section above */
  colorFrom?: "green" | "cyan" | "magenta" | "white"
  /** Color theme bleeding into section below */
  colorTo?: "green" | "cyan" | "magenta" | "white"
}

// Generate random hex - memoized outside component
function randomHex(len: number): string {
  return Array.from({ length: len }, () =>
    "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
  ).join("")
}

const colorMap = {
  green: { main: "var(--color-rga-green)", glow: "var(--color-glow-green)", rgb: "0, 255, 65" },
  cyan: { main: "var(--color-rga-cyan)", glow: "var(--color-glow-cyan)", rgb: "0, 255, 255" },
  magenta: { main: "var(--color-rga-magenta)", glow: "var(--color-glow-magenta)", rgb: "255, 0, 255" },
  white: { main: "#ffffff", glow: "rgba(255,255,255,0.5)", rgb: "255, 255, 255" },
}

// Scale determines how much the effect extends
const scaleConfig = {
  subtle: { height: "h-20", bleed: "60px", parallaxMultiplier: 0.3 },
  medium: { height: "h-32", bleed: "100px", parallaxMultiplier: 0.6 },
  dramatic: { height: "h-48", bleed: "180px", parallaxMultiplier: 1 },
}

/**
 * OPTIMIZED section transition effect.
 * Fades out as user scrolls into the next section for readability.
 * Uses GPU-accelerated transforms and minimal DOM nodes.
 */
export function SectionBleed({
  className,
  variant = "data-corruption",
  scale = "medium",
  colorFrom = "green",
  colorTo = "cyan",
}: SectionBleedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = scaleConfig[scale]

  // Parallax scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Smooth spring for natural feel
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Parallax transforms - reduced count for performance
  const parallaxBack = useTransform(smoothProgress, [0, 1], [100 * config.parallaxMultiplier, -100 * config.parallaxMultiplier])
  const parallaxFront = useTransform(smoothProgress, [0, 1], [40 * config.parallaxMultiplier, -40 * config.parallaxMultiplier])

  // FADE OUT as user scrolls INTO the next section
  // Full opacity until 35%, then fade to 0 by 70%
  const fadeOutOpacity = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [1, 1, 0, 0])

  // Pre-generate static data once
  const glitchData = useMemo(() => ({
    hexFragments: Array.from({ length: scale === "dramatic" ? 6 : 4 }, (_, i) => ({
      value: `0x${randomHex(4)}`,
      x: 10 + (i * 20) + Math.random() * 10,
      y: 20 + Math.random() * 60,
    })),
    lines: [20, 45, 70], // Fixed positions for performance
  }), [scale])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-visible select-none will-change-transform",
        config.height,
        className
      )}
      style={{
        marginTop: `-${config.bleed}`,
        marginBottom: `-${config.bleed}`,
        paddingTop: config.bleed,
        paddingBottom: config.bleed,
        opacity: fadeOutOpacity,
      }}
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 0: Background glow - Static, no animation
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: parallaxBack }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 50%, rgba(${colorMap[colorFrom].rgb}, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 60% 50% at 70% 50%, rgba(${colorMap[colorTo].rgb}, 0.08) 0%, transparent 50%)
            `,
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1: Horizontal glitch lines - Simple CSS, minimal DOM
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: parallaxFront }}
      >
        {glitchData.lines.map((top, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-0 right-0"
            style={{ top: `${top}%` }}
          >
            {/* Single gradient line - no multiple layers */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg,
                  transparent 0%,
                  ${colorMap[i === 1 ? colorFrom : colorTo].main} 20%,
                  white 50%,
                  ${colorMap[i === 1 ? colorTo : colorFrom].main} 80%,
                  transparent 100%
                )`,
                boxShadow: `0 0 20px ${colorMap[colorFrom].glow}`,
              }}
            />
          </div>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2: Data fragments - Static positioned, no animation
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {glitchData.hexFragments.map((frag, i) => (
          <div
            key={`hex-${i}`}
            className="absolute font-mono text-[10px] tracking-widest opacity-60"
            style={{
              left: `${frag.x}%`,
              top: `${frag.y}%`,
              color: i % 2 === 0 ? colorMap[colorFrom].main : colorMap[colorTo].main,
              textShadow: `0 0 8px ${i % 2 === 0 ? colorMap[colorFrom].glow : colorMap[colorTo].glow}`,
            }}
          >
            {frag.value}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3: Variant-specific elements - Simplified
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* VOID BREACH - Simple dark bar with glow edges */}
      {variant === "void-breach" && (
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 md:h-20">
          <div className="absolute inset-0 bg-black/80 rounded-sm" />
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${colorMap[colorFrom].main}, white, ${colorMap[colorTo].main}, transparent)`,
              boxShadow: `0 0 20px ${colorMap[colorFrom].glow}`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${colorMap[colorTo].main}, white, ${colorMap[colorFrom].main}, transparent)`,
              boxShadow: `0 0 20px ${colorMap[colorTo].glow}`,
            }}
          />
        </div>
      )}

      {/* CHROMATIC SHATTER - Reduced to 3 simple shapes */}
      {variant === "chromatic-shatter" && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { x: 15, y: 25, rotate: -15, color: colorFrom },
            { x: 50, y: 40, rotate: 8, color: colorTo },
            { x: 75, y: 60, rotate: -8, color: "magenta" as const },
          ].map((shard, i) => (
            <div
              key={`shard-${i}`}
              className="absolute w-24 h-8 opacity-40"
              style={{
                left: `${shard.x}%`,
                top: `${shard.y}%`,
                transform: `rotate(${shard.rotate}deg)`,
                background: `linear-gradient(135deg, rgba(${colorMap[shard.color].rgb}, 0.4) 0%, transparent 70%)`,
                clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
              }}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 4: Edge accents - Static
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${colorMap[colorFrom].main}80, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${colorMap[colorTo].main}80, transparent)`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 5: Subtle CRT scanlines - Pure CSS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
        }}
      />
    </motion.div>
  )
}
