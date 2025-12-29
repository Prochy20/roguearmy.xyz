"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { Home, RotateCcw } from "lucide-react"
import { HeroGlitch } from "@/components/effects"
import { GlowButton } from "@/components/shared/GlowButton"
import { AshleyErrorTerminal } from "./AshleyErrorTerminal"
import { getErrorConfig, type ErrorCode } from "./error-config"

interface ErrorPageProps {
  /** The error code to display */
  errorType: ErrorCode
  /** Callback to retry/reset (for error.tsx boundaries) */
  reset?: () => void
  /** Show the "Go Home" button (default: true) */
  showHomeButton?: boolean
  /** Show the "Try Again" button (default: true if reset provided) */
  showRetryButton?: boolean
}

/**
 * Cyberpunk-themed error page featuring Ashley reporting errors.
 * Displays glitched error code, terminal output, and recovery CTAs.
 */
export function ErrorPage({
  errorType,
  reset,
  showHomeButton = true,
  showRetryButton,
}: ErrorPageProps) {
  const config = getErrorConfig(errorType)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Handle hydration for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Default showRetryButton to true if reset is provided
  const shouldShowRetry = showRetryButton ?? !!reset

  const colorGradients = {
    red: "from-red-500/20 via-transparent to-rga-magenta/10",
    cyan: "from-rga-cyan/20 via-transparent to-rga-green/10",
    magenta: "from-rga-magenta/20 via-transparent to-rga-cyan/10",
  }

  const chromaColor = {
    red: "text-red-500",
    cyan: "text-rga-cyan",
    magenta: "text-rga-magenta",
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,65,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,65,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Color gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-radial ${colorGradients[config.color]} opacity-50`}
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${config.glitchColors[0]}15 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 80%, ${config.glitchColors[1]}10 0%, transparent 40%)`,
        }}
      />

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
        }}
      />

      {/* Animated corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-rga-green/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-rga-green/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-rga-green/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-rga-green/30" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 py-12 max-w-2xl mx-auto">
        {/* Glitched error code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            {/* RGB ghost copies for extra depth */}
            <span
              className="absolute inset-0 font-display text-[25vw] md:text-[18vw] lg:text-[14vw] select-none opacity-30 pointer-events-none"
              style={{ color: config.glitchColors[0], transform: "translate(-3px, 0)" }}
              aria-hidden="true"
            >
              {config.code}
            </span>
            <span
              className="absolute inset-0 font-display text-[25vw] md:text-[18vw] lg:text-[14vw] select-none opacity-30 pointer-events-none"
              style={{ color: config.glitchColors[1], transform: "translate(3px, 0)" }}
              aria-hidden="true"
            >
              {config.code}
            </span>

            <HeroGlitch
              minInterval={2}
              maxInterval={6}
              intensity={6}
              dataCorruption={false}
              scanlines
              colors={config.glitchColors}
            >
              <h1
                className={`font-display text-[25vw] md:text-[18vw] lg:text-[14vw] leading-none ${chromaColor[config.color]}`}
                style={{
                  textShadow: `0 0 40px ${config.glitchColors[0]}40, 0 0 80px ${config.glitchColors[0]}20`,
                }}
              >
                {config.code}
              </h1>
            </HeroGlitch>
          </div>
        </motion.div>

        {/* Title with chromatic effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2
            className={`font-display text-3xl md:text-4xl lg:text-5xl mb-2 ${chromaColor[config.color]} text-chromatic`}
          >
            {config.title}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl font-mono">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Ashley's terminal */}
        <AshleyErrorTerminal config={config} startDelay={600} requestedPath={pathname} />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="flex flex-wrap gap-4 mt-8 justify-center"
        >
          {showHomeButton && (
            <Link href="/">
              <GlowButton
                glowColor="green"
                size="lg"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </GlowButton>
            </Link>
          )}

          {shouldShowRetry && reset && (
            <GlowButton
              glowColor="cyan"
              size="lg"
              variant="outline"
              className="gap-2 border-rga-cyan/50 text-rga-cyan hover:bg-rga-cyan/10"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </GlowButton>
          )}
        </motion.div>

        {/* Hex decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          className="mt-12 font-mono text-xs text-text-muted/50 tracking-widest"
        >
          0x{config.code.padStart(4, "0")} :: SECTOR_BREACH :: RGA_NET
        </motion.div>
      </div>

      {/* Floating glitch fragments (decorative) */}
      <motion.div
        className="absolute top-1/4 left-[10%] w-24 h-1 bg-rga-cyan/30"
        animate={{
          x: [0, 10, -5, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-[15%] w-16 h-0.5 bg-rga-magenta/40"
        animate={{
          x: [0, -15, 5, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-[60%] left-[5%] w-2 h-2 bg-rga-green/50"
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </div>
  )
}
