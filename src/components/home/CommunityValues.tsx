"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { ChromaticText, SectionGlitch } from "@/components/effects"
import { ScrollReveal, ScrollRevealContainer, ScrollRevealItem } from "@/components/shared"
import { Shield, Users, Heart } from "lucide-react"

const VALUES = [
  {
    icon: Shield,
    title: "Drama-Free Zone",
    description: "Leave the toxicity at the door. We game to have fun, not to stress.",
    color: "green",
  },
  {
    icon: Users,
    title: "Adults Only (25+)",
    description: "Mature gamers who understand life gets in the way. No judgment.",
    color: "cyan",
  },
  {
    icon: Heart,
    title: "Friendship First",
    description: "Games come and go, but the connections we make last. That's what matters.",
    color: "magenta",
  },
]

const colorClasses: Record<string, { icon: string; glow: string }> = {
  green: { icon: "text-rga-green", glow: "shadow-[0_0_20px_rgba(0,255,65,0.3)]" },
  cyan: { icon: "text-rga-cyan", glow: "shadow-[0_0_20px_rgba(0,255,255,0.3)]" },
  magenta: { icon: "text-rga-magenta", glow: "shadow-[0_0_20px_rgba(255,0,255,0.3)]" },
}

/**
 * Community Values Section
 * "NOT YOUR AVERAGE CLAN" with Ashley image and three pillars
 */
export function CommunityValues() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Glitch transition from StatsTicker */}
      <SectionGlitch
        intensity="intense"
        colorPrimary="green"
        colorSecondary="magenta"
      />

      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,255,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(255,0,255,0.06) 0%, transparent 40%)
          `,
        }}
      />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div>
            <ScrollReveal direction="left">
              <p className="text-rga-green font-mono text-sm uppercase tracking-widest mb-4">
                // OUR PHILOSOPHY
              </p>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] mb-8">
                <span className="text-white">NOT YOUR</span>
                <br />
                <span className="text-white">AVERAGE</span>
                <br />
                <ChromaticText animated>
                  <span className="text-rga-green">CLAN</span>
                </ChromaticText>
              </h2>
            </ScrollReveal>

            {/* Values list */}
            <ScrollRevealContainer staggerDelay={0.15} className="space-y-8 mt-12">
              {VALUES.map((value) => (
                <ScrollRevealItem key={value.title} direction="left">
                  <div className="flex gap-5 group">
                    <div
                      className={`
                        shrink-0 w-14 h-14 rounded-lg bg-bg-elevated border border-border
                        flex items-center justify-center
                        group-hover:${colorClasses[value.color].glow} transition-shadow duration-300
                      `}
                    >
                      <value.icon className={`w-6 h-6 ${colorClasses[value.color].icon}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{value.title}</h3>
                      <p className="text-text-secondary">{value.description}</p>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </ScrollRevealContainer>
          </div>

          {/* Right: Banner image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* RGB ghost effect */}
            <div className="absolute inset-0 translate-x-2 opacity-50">
              <Image
                src="/images/banner.jpg"
                alt=""
                fill
                className="object-cover object-center rounded-lg"
                style={{ filter: "hue-rotate(180deg)" }}
                aria-hidden="true"
              />
            </div>
            <div className="absolute inset-0 -translate-x-2 opacity-50">
              <Image
                src="/images/banner.jpg"
                alt=""
                fill
                className="object-cover object-center rounded-lg"
                style={{ filter: "hue-rotate(-60deg)" }}
                aria-hidden="true"
              />
            </div>
            {/* Main image */}
            <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <Image
                src="/images/banner.jpg"
                alt="Rogue Army - Skull Logo"
                fill
                className="object-cover object-center"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-void via-transparent to-transparent" />
              {/* Scanline effect */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, 0.5) 2px,
                    rgba(0, 0, 0, 0.5) 4px
                  )`,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Glitch transition to AshleyTerminal */}
      <SectionGlitch
        intensity="intense"
        colorPrimary="magenta"
        colorSecondary="cyan"
      />
    </section>
  )
}
