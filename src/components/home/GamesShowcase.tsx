"use client"

import { motion } from "motion/react"
import { SectionGlitch } from "@/components/effects"
import { ScrollReveal } from "@/components/shared"
import type { Game } from "@/payload-types"

interface GamesShowcaseProps {
  games: Game[]
}

const colorClasses: Record<string, { text: string; glow: string; border: string; bg: string }> = {
  orange: {
    text: "text-orange-500",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.3)]",
    border: "border-orange-500/30",
    bg: "rgba(249,115,22,0.05)",
  },
  blue: {
    text: "text-blue-400",
    glow: "shadow-[0_0_40px_rgba(96,165,250,0.3)]",
    border: "border-blue-400/30",
    bg: "rgba(96,165,250,0.05)",
  },
  yellow: {
    text: "text-yellow-400",
    glow: "shadow-[0_0_40px_rgba(250,204,21,0.3)]",
    border: "border-yellow-400/30",
    bg: "rgba(250,204,21,0.05)",
  },
  teal: {
    text: "text-teal-400",
    glow: "shadow-[0_0_40px_rgba(45,212,191,0.3)]",
    border: "border-teal-400/30",
    bg: "rgba(45,212,191,0.05)",
  },
  green: {
    text: "text-green-500",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.3)]",
    border: "border-green-500/30",
    bg: "rgba(34,197,94,0.05)",
  },
  purple: {
    text: "text-purple-400",
    glow: "shadow-[0_0_40px_rgba(192,132,252,0.3)]",
    border: "border-purple-400/30",
    bg: "rgba(192,132,252,0.05)",
  },
  red: {
    text: "text-red-500",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]",
    border: "border-red-500/30",
    bg: "rgba(239,68,68,0.05)",
  },
  pink: {
    text: "text-pink-400",
    glow: "shadow-[0_0_40px_rgba(244,114,182,0.3)]",
    border: "border-pink-400/30",
    bg: "rgba(244,114,182,0.05)",
  },
}

/**
 * Games Showcase Section
 * Full-bleed horizontal strips with massive diagonal text
 */
export function GamesShowcase({ games }: GamesShowcaseProps) {
  if (games.length === 0) {
    return null
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Glitch transition from Hero */}
      <SectionGlitch
        intensity="medium"
        colorPrimary="green"
        colorSecondary="cyan"
      />

      {/* Section header */}
      <ScrollReveal direction="up" className="text-center mb-16 px-6">
        <h2 className="font-display text-4xl md:text-6xl text-white uppercase mb-4">
          What We Play
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          From tactical shooters to high seas adventures. Find your squad.
        </p>
      </ScrollReveal>

      {/* Game strips */}
      <div className="space-y-1">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`
              group relative w-full py-8 md:py-12 overflow-hidden
              border-y ${colorClasses[game.color].border}
              hover:bg-bg-elevated transition-all duration-500
              ${game.featured ? "py-12 md:py-20" : ""}
            `}
          >
            {/* Background glow on hover */}
            <div
              className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${colorClasses[game.color].glow}
              `}
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${colorClasses[game.color].bg} 50%, transparent 100%)`,
              }}
            />

            <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
              {/* Game name - MASSIVE */}
              <div className="flex-1">
                <h3
                  className={`
                    font-display uppercase tracking-tight
                    ${game.featured ? "text-5xl md:text-7xl lg:text-8xl" : "text-3xl md:text-5xl lg:text-6xl"}
                    ${colorClasses[game.color].text}
                    group-hover:tracking-wide transition-all duration-300
                  `}
                  style={{
                    transform: "skewX(-3deg)",
                  }}
                >
                  {game.name}
                </h3>
                <p className="text-text-muted text-sm md:text-base mt-2 font-mono uppercase tracking-widest">
                  {game.subtitle}
                </p>
              </div>

              {/* Description - appears on hover */}
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="hidden md:block max-w-xs text-right text-text-secondary"
              >
                {game.description}
              </motion.p>
            </div>

            {/* Featured badge */}
            {game.featured && (
              <div className="absolute top-4 right-6 bg-rga-green/20 border border-rga-green/50 px-3 py-1 rounded-full">
                <span className="text-rga-green text-xs font-mono uppercase tracking-widest">
                  Main Game
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* And more indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8 px-6"
      >
        <p className="text-text-muted font-mono text-sm uppercase tracking-widest">
          <span className="text-rga-green">+</span> and many more
        </p>
        <p className="text-text-muted/60 text-xs mt-1">
          We play whatever our community is hyped about
        </p>
      </motion.div>

      {/* Glitch transition to StatsTicker */}
      <SectionGlitch
        intensity="intense"
        colorPrimary="cyan"
        colorSecondary="green"
      />
    </section>
  )
}
