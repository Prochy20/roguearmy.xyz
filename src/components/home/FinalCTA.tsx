"use client"

import { motion } from "motion/react"
import { GlitchText } from "@/components/effects/GlitchText"
import { SectionGlitch } from "@/components/effects/SectionGlitch"
import { GlowButton } from "@/components/shared/GlowButton"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { DiscordIcon } from "@/components/shared/DiscordIcon"

const DISCORD_INVITE = "https://dc.roguearmy.xyz"

/**
 * Final CTA Section
 * "READY TO GO ROGUE?" with massive Discord button and testimonial
 */
export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Glitch transition from AshleyTerminal */}
      <SectionGlitch
        intensity="medium"
        colorPrimary="cyan"
        colorSecondary="green"
      />

      {/* Background effects */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,65,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 0%, rgba(0,255,255,0.08) 0%, transparent 40%),
            radial-gradient(ellipse 40% 30% at 90% 20%, rgba(255,0,255,0.06) 0%, transparent 40%)
          `,
        }}
      />

      <div className="container mx-auto px-6 text-center">
        {/* Main headline - stacked/staggered */}
        <ScrollReveal direction="up" className="mb-12">
          <h2 className="font-display uppercase leading-[0.85]">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="block text-5xl md:text-7xl lg:text-[10vw] text-white"
            >
              READY TO
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="block text-5xl md:text-7xl lg:text-[10vw] text-white"
            >
              GO
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="block"
            >
              <GlitchText trigger="scroll" duration={0.8}>
                <span className="text-6xl md:text-8xl lg:text-[12vw] text-rga-green text-glow-green">
                  ROGUE?
                </span>
              </GlitchText>
            </motion.span>
          </h2>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal direction="up" delay={0.3} className="mb-12">
          <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto">
            Join 200+ gamers who chose friendship over frustration.
            <br className="hidden md:block" />
            Your squad is waiting.
          </p>
        </ScrollReveal>

        {/* CTA Button - MASSIVE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            <GlowButton
              size="lg"
              glowColor="green"
              pulse
              className="text-xl md:text-2xl px-12 py-8 gap-4"
            >
              <DiscordIcon className="w-7 h-7" />
              Join the Discord
            </GlowButton>
          </a>
        </motion.div>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-text-muted font-mono text-sm mb-4">
            © {new Date().getFullYear()} Rogue Army Gaming Community
          </p>
          <p className="text-text-muted/50 text-xs font-mono">
            Built with{" "}
            <span className="text-rga-green">&lt;/&gt;</span>
            {" "}and{" "}
            <span className="text-rga-magenta">♥</span>
          </p>
        </footer>
      </div>
    </section>
  )
}
