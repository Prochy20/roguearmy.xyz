"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { GlitchText, ChromaticText, TypeWriter } from "@/components/effects"
import { GlowButton } from "@/components/shared"
import { ChevronDown, MessageCircle } from "lucide-react"

const DISCORD_INVITE = "https://dc.roguearmy.xyz"

/**
 * Hero Section - Full viewport landing
 * Features: Animated logo, GIGANTIQUE title, typing tagline, Discord CTA
 */
export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,65,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,255,255,0.1) 0%, transparent 40%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(255,0,255,0.08) 0%, transparent 40%)
          `,
        }}
      />

      {/* Animated Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-8"
      >
        {/* RGB ghost copies for glitch effect */}
        <div className="absolute inset-0 opacity-50 animate-glitch" style={{ transform: "translate(-3px, 0)" }}>
          <Image
            src="/logo.png"
            alt=""
            width={140}
            height={140}
            className="w-28 h-28 md:w-36 md:h-36 opacity-60"
            style={{ filter: "hue-rotate(180deg)" }}
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 opacity-50 animate-glitch" style={{ transform: "translate(3px, 0)", animationDelay: "0.05s" }}>
          <Image
            src="/logo.png"
            alt=""
            width={140}
            height={140}
            className="w-28 h-28 md:w-36 md:h-36 opacity-60"
            style={{ filter: "hue-rotate(-60deg)" }}
            aria-hidden="true"
          />
        </div>
        {/* Main logo */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/logo.png"
            alt="Rogue Army Logo"
            width={140}
            height={140}
            className="w-28 h-28 md:w-36 md:h-36 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]"
            priority
          />
        </motion.div>
      </motion.div>

      {/* GIGANTIQUE Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="font-display text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] uppercase tracking-tight">
          <GlitchText trigger="hover" duration={0.5}>
            <span className="text-white">ROGUE</span>
          </GlitchText>
          <br />
          <ChromaticText animated>
            <span className="text-rga-green text-glow-green">ARMY</span>
          </ChromaticText>
        </h1>
      </motion.div>

      {/* Tagline with typewriter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mb-10 text-center"
      >
        <p className="text-text-secondary text-lg md:text-xl max-w-md mx-auto">
          <TypeWriter
            text="Casual gaming community for adults 25+. No drama, just good times."
            speed={30}
            delay={800}
          />
        </p>
      </motion.div>

      {/* Discord CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          <GlowButton
            size="lg"
            glowColor="green"
            pulse
            className="text-lg px-8 py-6 gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            Join the Discord
          </GlowButton>
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-text-muted"
        >
          <span className="text-xs uppercase tracking-widest mb-2 font-mono">Scroll</span>
          <ChevronDown className="w-5 h-5 text-rga-green" />
        </motion.div>
      </motion.div>
    </section>
  )
}
