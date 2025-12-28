"use client"

import { useRef, useMemo } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

interface SectionGlitchProps {
  className?: string
  /** Intensity level affects animation frequency and displacement */
  intensity?: "minimal" | "subtle" | "medium" | "intense"
  /** Primary glitch color */
  colorPrimary?: "green" | "cyan" | "magenta"
  /** Secondary glitch color for RGB split */
  colorSecondary?: "green" | "cyan" | "magenta"
}

const colorVars = {
  green: { main: "var(--color-rga-green)", glow: "var(--color-glow-green)", rgb: "0, 255, 65" },
  cyan: { main: "var(--color-rga-cyan)", glow: "var(--color-glow-cyan)", rgb: "0, 255, 255" },
  magenta: { main: "var(--color-rga-magenta)", glow: "var(--color-glow-magenta)", rgb: "255, 0, 255" },
}

const intensityConfig = {
  minimal: { height: "h-8", bleed: "0px", parallax: 0, animSpeed: "12s", displacement: 0 },
  subtle: { height: "h-24", bleed: "80px", parallax: 0.4, animSpeed: "8s", displacement: 12 },
  medium: { height: "h-36", bleed: "120px", parallax: 0.7, animSpeed: "5s", displacement: 20 },
  intense: { height: "h-48", bleed: "180px", parallax: 1, animSpeed: "3s", displacement: 30 },
}

function randomHex(len: number): string {
  return Array.from({ length: len }, () =>
    "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
  ).join("")
}

/**
 * Enhanced section glitch with scroll-driven parallax AND proper glitch effects.
 *
 * - "minimal": Simple gradient line blend (no overlap, no animations)
 * - "subtle/medium/intense": Full glitch effects with parallax
 */
export function SectionGlitch({
  className,
  intensity = "medium",
  colorPrimary = "cyan",
  colorSecondary = "magenta",
}: SectionGlitchProps) {
  const ref = useRef<HTMLDivElement>(null)
  const config = intensityConfig[intensity]
  const primary = colorVars[colorPrimary]

  // Random delay offset so instances don't glitch at the same time
  const delayOffset = useMemo(() => Math.random() * 5, [])
  const secondary = colorVars[colorSecondary]

  // For minimal, just render a simple gradient line (no overlap/bleed)
  if (intensity === "minimal") {
    return (
      <div
        className={cn("relative w-full h-4 select-none", className)}
        aria-hidden="true"
      >
        {/* Simple gradient line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              rgba(${primary.rgb}, 0.4) 20%,
              rgba(${secondary.rgb}, 0.3) 50%,
              rgba(${primary.rgb}, 0.4) 80%,
              transparent 100%
            )`,
            boxShadow: `0 0 20px rgba(${primary.rgb}, 0.2)`,
          }}
        />
      </div>
    )
  }

  // Full glitch effect for subtle/medium/intense
  // Scroll tracking for parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Smooth spring for natural feel
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Parallax transforms - different speeds for depth
  const parallaxBack = useTransform(smoothProgress, [0, 1], [120 * config.parallax, -120 * config.parallax])
  const parallaxMid = useTransform(smoothProgress, [0, 1], [60 * config.parallax, -60 * config.parallax])
  const parallaxFront = useTransform(smoothProgress, [0, 1], [30 * config.parallax, -30 * config.parallax])

  // Pre-generate static data
  const glitchData = useMemo(() => ({
    hexFragments: Array.from({ length: intensity === "intense" ? 8 : intensity === "medium" ? 5 : 3 }, (_, i) => ({
      value: `0x${randomHex(4)}`,
      x: 5 + (i * 18) + Math.random() * 8,
      y: 15 + Math.random() * 70,
    })),
    glitchBlocks: intensity === "subtle"
      ? [
          { top: 30, left: 10, width: 25, colorIdx: 0 },
          { top: 60, left: 50, width: 30, colorIdx: 1 },
        ]
      : [
          { top: 15, left: 5, width: 30, colorIdx: 0 },
          { top: 40, left: 45, width: 40, colorIdx: 1 },
          { top: 65, left: 20, width: 25, colorIdx: 0 },
          { top: 80, left: 60, width: 35, colorIdx: 1 },
        ],
  }), [intensity])

  return (
    <motion.div
      ref={ref}
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
      }}
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 0: Background radial glow - Deepest parallax
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: parallaxBack }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 25% 50%, rgba(${primary.rgb}, 0.12) 0%, transparent 55%),
              radial-gradient(ellipse 70% 60% at 75% 50%, rgba(${secondary.rgb}, 0.1) 0%, transparent 55%)
            `,
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1: Grid pattern background - Static
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${primary.main} 1px, transparent 1px),
            linear-gradient(to bottom, ${primary.main} 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2: Main glowing lines - Mid parallax
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: parallaxMid }}
      >
        {/* Central bright line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${primary.main} 15%,
              white 50%,
              ${secondary.main} 85%,
              transparent 100%
            )`,
            boxShadow: `0 0 30px ${primary.main}, 0 0 60px ${secondary.main}`,
          }}
        />

        {/* Secondary accent lines */}
        <div
          className="absolute left-[8%] right-[25%] h-px opacity-60"
          style={{
            top: "30%",
            background: primary.main,
            boxShadow: `0 0 15px ${primary.glow}`,
          }}
        />
        <div
          className="absolute left-[20%] right-[12%] h-px opacity-60"
          style={{
            top: "70%",
            background: secondary.main,
            boxShadow: `0 0 15px ${secondary.glow}`,
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3: Glitch displacement blocks - Animate with CSS
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform overflow-hidden"
        style={{ y: parallaxFront }}
      >
        {glitchData.glitchBlocks.map((block, i) => (
          <div
            key={`block-${i}`}
            className={cn(
              "absolute h-2 opacity-0",
              i === 0 && "animate-glitch-block-1",
              i === 1 && "animate-glitch-block-2",
              i === 2 && "animate-glitch-block-3",
              i === 3 && "animate-glitch-block-4"
            )}
            style={{
              top: `${block.top}%`,
              left: `${block.left}%`,
              width: `${block.width}%`,
              background: block.colorIdx === 0 ? primary.main : secondary.main,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 2px)`,
              boxShadow: `0 0 10px ${block.colorIdx === 0 ? primary.glow : secondary.glow}`,
            }}
          />
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 4: RGB chromatic split lines
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen overflow-hidden">
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 opacity-0 animate-rgb-cyan"
          style={{ background: primary.main }}
        />
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 opacity-0 animate-rgb-magenta"
          style={{ background: secondary.main }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 5: Data fragments - Front parallax (skip for subtle)
          ═══════════════════════════════════════════════════════════════════════ */}
      {intensity !== "subtle" && (
        <motion.div
          className="absolute inset-0 pointer-events-none will-change-transform overflow-hidden"
          style={{ y: parallaxFront }}
        >
          {glitchData.hexFragments.map((frag, i) => (
            <div
              key={`hex-${i}`}
              className={cn(
                "absolute font-mono text-[9px] tracking-widest",
                i % 3 === 0 ? "animate-data-flicker-1" : i % 3 === 1 ? "animate-data-flicker-2" : "animate-data-flicker-3"
              )}
              style={{
                left: `${frag.x}%`,
                top: `${frag.y}%`,
                color: i % 2 === 0 ? primary.main : secondary.main,
                textShadow: `0 0 6px ${i % 2 === 0 ? primary.glow : secondary.glow}`,
              }}
            >
              {frag.value}
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 6: Noise/static burst overlay (skip for subtle)
          ═══════════════════════════════════════════════════════════════════════ */}
      {intensity !== "subtle" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 animate-noise-burst mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 7: Scanline flicker
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none animate-scanline-flicker"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.25) 2px,
            rgba(0,0,0,0.25) 4px
          )`,
          opacity: 0,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 8: Flash spike
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none bg-white animate-glitch-flash"
        style={{ opacity: 0 }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 9: Corner decorations - Static (skip for subtle)
          ═══════════════════════════════════════════════════════════════════════ */}
      {intensity !== "subtle" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-6">
            <div className="w-8 h-px" style={{ background: primary.main, boxShadow: `0 0 8px ${primary.glow}` }} />
            <div className="w-px h-8" style={{ background: primary.main, boxShadow: `0 0 8px ${primary.glow}` }} />
          </div>
          <div className="absolute top-4 right-6">
            <div className="w-8 h-px ml-auto" style={{ background: secondary.main, boxShadow: `0 0 8px ${secondary.glow}` }} />
            <div className="w-px h-8 ml-auto" style={{ background: secondary.main, boxShadow: `0 0 8px ${secondary.glow}` }} />
          </div>
          <div className="absolute bottom-4 left-6">
            <div className="w-px h-8" style={{ background: secondary.main, boxShadow: `0 0 8px ${secondary.glow}` }} />
            <div className="w-8 h-px" style={{ background: secondary.main, boxShadow: `0 0 8px ${secondary.glow}` }} />
          </div>
          <div className="absolute bottom-4 right-6">
            <div className="w-px h-8 ml-auto" style={{ background: primary.main, boxShadow: `0 0 8px ${primary.glow}` }} />
            <div className="w-8 h-px ml-auto" style={{ background: primary.main, boxShadow: `0 0 8px ${primary.glow}` }} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 10: Edge glow
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${primary.main}70, transparent)` }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${secondary.main}70, transparent)` }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 11: Subtle persistent scanlines
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          CSS Keyframe Animations
          ═══════════════════════════════════════════════════════════════════════ */}
      <style jsx>{`
        @keyframes glitch-block-1 {
          0%, 91%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
          92% { opacity: 0.7; transform: translateX(${config.displacement}px) scaleX(1.1); }
          93% { opacity: 0.5; transform: translateX(-${config.displacement * 0.6}px) scaleX(0.95); }
          94% { opacity: 0.3; transform: translateX(${config.displacement * 0.3}px) scaleX(1.02); }
          95% { opacity: 0; transform: translateX(0); }
        }
        @keyframes glitch-block-2 {
          0%, 85%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
          86% { opacity: 0.8; transform: translateX(-${config.displacement * 1.3}px) scaleX(1.15); }
          87% { opacity: 0.6; transform: translateX(${config.displacement * 0.8}px) scaleX(0.9); }
          88% { opacity: 0.4; transform: translateX(-${config.displacement * 0.4}px) scaleX(1.05); }
          89% { opacity: 0; transform: translateX(0); }
        }
        @keyframes glitch-block-3 {
          0%, 78%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
          79% { opacity: 0.6; transform: translateX(${config.displacement * 0.9}px) scaleX(1.08); }
          80% { opacity: 0.8; transform: translateX(-${config.displacement * 1.4}px) scaleX(0.92); }
          81% { opacity: 0.5; transform: translateX(${config.displacement * 0.5}px) scaleX(1.03); }
          82% { opacity: 0; transform: translateX(0); }
        }
        @keyframes glitch-block-4 {
          0%, 70%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
          71% { opacity: 0.7; transform: translateX(-${config.displacement * 1.1}px) scaleX(1.12); }
          72% { opacity: 0.5; transform: translateX(${config.displacement * 0.7}px) scaleX(0.94); }
          73% { opacity: 0; transform: translateX(0); }
        }

        @keyframes rgb-cyan {
          0%, 89%, 100% { opacity: 0; transform: translateX(0) translateY(-50%); }
          90% { opacity: 0.9; transform: translateX(-8px) translateY(-50%); }
          92% { opacity: 0.6; transform: translateX(-5px) translateY(-50%); }
          94% { opacity: 0.3; transform: translateX(-2px) translateY(-50%); }
          95% { opacity: 0; transform: translateX(0) translateY(-50%); }
        }
        @keyframes rgb-magenta {
          0%, 89%, 100% { opacity: 0; transform: translateX(0) translateY(-50%); }
          90% { opacity: 0.9; transform: translateX(8px) translateY(-50%); }
          92% { opacity: 0.6; transform: translateX(5px) translateY(-50%); }
          94% { opacity: 0.3; transform: translateX(2px) translateY(-50%); }
          95% { opacity: 0; transform: translateX(0) translateY(-50%); }
        }

        @keyframes data-flicker-1 {
          0%, 88%, 100% { opacity: 0.5; }
          89% { opacity: 0; }
          90% { opacity: 0.9; }
          91% { opacity: 0.3; }
          92% { opacity: 0.7; }
          93% { opacity: 0.5; }
        }
        @keyframes data-flicker-2 {
          0%, 82%, 100% { opacity: 0.4; }
          83% { opacity: 0.9; }
          84% { opacity: 0.1; }
          85% { opacity: 0.8; }
          86% { opacity: 0.4; }
        }
        @keyframes data-flicker-3 {
          0%, 75%, 100% { opacity: 0.6; }
          76% { opacity: 0.1; }
          77% { opacity: 0.8; }
          78% { opacity: 0.2; }
          79% { opacity: 0.7; }
          80% { opacity: 0.6; }
        }

        @keyframes noise-burst {
          0%, 84%, 100% { opacity: 0; transform: translate(0, 0); }
          85% { opacity: 0.35; transform: translate(-3%, -2%); }
          86% { opacity: 0.5; transform: translate(2%, 3%); }
          87% { opacity: 0.4; transform: translate(-1%, 1%); }
          88% { opacity: 0.3; transform: translate(1%, -2%); }
          89% { opacity: 0; }
        }

        @keyframes scanline-flicker {
          0%, 86%, 100% { opacity: 0; }
          87% { opacity: 0.2; }
          88% { opacity: 0; }
          89% { opacity: 0.25; }
          90% { opacity: 0.08; }
          91% { opacity: 0.15; }
          92% { opacity: 0; }
        }

        @keyframes glitch-flash {
          0%, 90%, 100% { opacity: 0; }
          91% { opacity: 0.12; }
          92% { opacity: 0; }
        }

        .animate-glitch-block-1 { animation: glitch-block-1 ${config.animSpeed} steps(1) infinite; animation-delay: ${delayOffset}s; }
        .animate-glitch-block-2 { animation: glitch-block-2 ${parseFloat(config.animSpeed) * 1.3}s steps(1) infinite; animation-delay: ${delayOffset + 0.7}s; }
        .animate-glitch-block-3 { animation: glitch-block-3 ${parseFloat(config.animSpeed) * 0.8}s steps(1) infinite; animation-delay: ${delayOffset + 1.3}s; }
        .animate-glitch-block-4 { animation: glitch-block-4 ${parseFloat(config.animSpeed) * 1.1}s steps(1) infinite; animation-delay: ${delayOffset + 2.1}s; }
        .animate-rgb-cyan { animation: rgb-cyan ${config.animSpeed} ease-out infinite; animation-delay: ${delayOffset}s; }
        .animate-rgb-magenta { animation: rgb-magenta ${config.animSpeed} ease-out infinite; animation-delay: ${delayOffset + 0.03}s; }
        .animate-data-flicker-1 { animation: data-flicker-1 ${parseFloat(config.animSpeed) * 0.9}s steps(1) infinite; animation-delay: ${delayOffset + 0.5}s; }
        .animate-data-flicker-2 { animation: data-flicker-2 ${parseFloat(config.animSpeed) * 1.2}s steps(1) infinite; animation-delay: ${delayOffset + 1.1}s; }
        .animate-data-flicker-3 { animation: data-flicker-3 ${parseFloat(config.animSpeed) * 0.7}s steps(1) infinite; animation-delay: ${delayOffset + 1.8}s; }
        .animate-noise-burst { animation: noise-burst ${parseFloat(config.animSpeed) * 1.15}s steps(2) infinite; animation-delay: ${delayOffset}s; }
        .animate-scanline-flicker { animation: scanline-flicker ${parseFloat(config.animSpeed) * 0.85}s steps(1) infinite; animation-delay: ${delayOffset}s; }
        .animate-glitch-flash { animation: glitch-flash ${config.animSpeed} steps(1) infinite; animation-delay: ${delayOffset}s; }
      `}</style>
    </motion.div>
  )
}
