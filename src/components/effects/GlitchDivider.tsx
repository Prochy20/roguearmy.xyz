"use client"

import { useRef, useMemo } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

interface GlitchDividerProps {
  className?: string
}

// Pre-generate hex data
function generateHexData(length: number): string {
  const chars = "0123456789ABCDEF"
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

/**
 * OPTIMIZED cyberpunk section divider.
 * Fades out as user scrolls past for content readability.
 * Minimal DOM nodes, GPU-accelerated transforms.
 */
export function GlitchDivider({ className }: GlitchDividerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Track scroll progress through this element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Fade out as user scrolls past - invisible by 75%
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [1, 1, 0, 0])

  // Parallax for depth
  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30])

  // Static data fragments - generated once
  const dataFragments = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      hex: `0x${generateHexData(4)}`,
      x: 8 + i * 16,
      y: 20 + (i % 3) * 25,
    })), [])

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative w-full h-24 overflow-hidden select-none will-change-transform",
        className
      )}
      style={{ opacity: fadeOpacity }}
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1: Background Grid Pattern - Static
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-rga-green) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-rga-green) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2: Main Horizontal Glitch Lines - Parallax
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: parallaxY }}
      >
        {/* Central bright line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
          style={{
            background: "linear-gradient(90deg, transparent 0%, var(--color-rga-green) 20%, var(--color-rga-cyan) 50%, var(--color-rga-magenta) 80%, transparent 100%)",
            boxShadow: "0 0 20px var(--color-rga-green), 0 0 40px var(--color-rga-cyan)",
          }}
        />

        {/* Secondary lines */}
        <div
          className="absolute top-[30%] left-[5%] right-[20%] h-px bg-rga-cyan/50"
          style={{ boxShadow: "0 0 10px var(--color-rga-cyan)" }}
        />
        <div
          className="absolute top-[70%] left-[15%] right-[10%] h-px bg-rga-magenta/50"
          style={{ boxShadow: "0 0 10px var(--color-rga-magenta)" }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3: Data Fragments - Static positioned
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden">
        {dataFragments.map((fragment, i) => (
          <div
            key={`fragment-${i}`}
            className="absolute font-mono text-[9px] tracking-widest opacity-50"
            style={{
              left: `${fragment.x}%`,
              top: `${fragment.y}%`,
            }}
          >
            <span className="text-rga-green/80 drop-shadow-[0_0_4px_var(--color-rga-green)]">
              {fragment.hex}
            </span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 4: Glitch Blocks - Simplified to 3 blocks
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0">
        {[
          { top: 15, left: 10, width: 25, color: "green" },
          { top: 50, left: 55, width: 30, color: "cyan" },
          { top: 75, left: 25, width: 20, color: "magenta" },
        ].map((block, i) => (
          <div
            key={`block-${i}`}
            className="absolute h-2 opacity-30"
            style={{
              top: `${block.top}%`,
              left: `${block.left}%`,
              width: `${block.width}%`,
              background: block.color === "green"
                ? "var(--color-rga-green)"
                : block.color === "cyan"
                ? "var(--color-rga-cyan)"
                : "var(--color-rga-magenta)",
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 2px)`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 5: Corner Decorations - Static
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left */}
        <div className="absolute top-2 left-4">
          <div className="w-6 h-px bg-rga-green" style={{ boxShadow: "0 0 6px var(--color-rga-green)" }} />
          <div className="w-px h-6 bg-rga-green" style={{ boxShadow: "0 0 6px var(--color-rga-green)" }} />
        </div>
        {/* Top-right */}
        <div className="absolute top-2 right-4">
          <div className="w-6 h-px bg-rga-cyan ml-auto" style={{ boxShadow: "0 0 6px var(--color-rga-cyan)" }} />
          <div className="w-px h-6 bg-rga-cyan ml-auto" style={{ boxShadow: "0 0 6px var(--color-rga-cyan)" }} />
        </div>
        {/* Bottom-left */}
        <div className="absolute bottom-2 left-4">
          <div className="w-px h-6 bg-rga-magenta" style={{ boxShadow: "0 0 6px var(--color-rga-magenta)" }} />
          <div className="w-6 h-px bg-rga-magenta" style={{ boxShadow: "0 0 6px var(--color-rga-magenta)" }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 6: Edge Glow - Static
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-rga-green)80, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-rga-cyan)80, transparent)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 7: Subtle CRT Scanlines
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)`,
        }}
      />
    </motion.div>
  )
}
