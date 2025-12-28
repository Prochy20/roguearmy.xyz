"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react"
import { GlitchText, TypeWriter } from "@/components/effects"
import { ProgressBar } from "@/components/shared"
import { Bot, Zap, AlertTriangle, Skull } from "lucide-react"
import { useState } from "react"

const SKILLS = [
  { label: "Raid Coordination", value: 95, color: "green" as const },
  { label: "Build Assistance", value: 88, color: "cyan" as const },
  { label: "Meme Generation", value: 100, color: "magenta" as const },
  { label: "Drama Prevention", value: 99, color: "green" as const },
]

const HACK_MESSAGES = [
  "Bypassing firewall...",
  "Injecting payload...",
  "Access granted.",
]

/**
 * Ashley Terminal Section
 * Scroll-controlled "system breach" effect - Ashley hacks into the website
 * Uses fixed positioning until animation completes
 */
export function AshleyTerminal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFixed, setIsFixed] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Track when to fix/unfix the content
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Fix when we enter (progress > 0) and unfix when exit animation starts (progress > 0.85)
    if (latest > 0 && latest < 0.88) {
      setIsFixed(true)
    } else {
      setIsFixed(false)
    }
  })

  // Animation phases - spread across scroll
  // ERROR: 0-25%
  const errorOpacity = useTransform(scrollYProgress, [0.02, 0.08, 0.18, 0.25], [0, 1, 1, 0])
  const errorScale = useTransform(scrollYProgress, [0.02, 0.08, 0.20, 0.25], [0.8, 1, 1, 0.9])

  // BREACH: 18-40%
  const breachOpacity = useTransform(scrollYProgress, [0.18, 0.22, 0.32, 0.40], [0, 1, 1, 0])
  const hackLine1 = useTransform(scrollYProgress, [0.22, 0.24], [0, 1])
  const hackLine2 = useTransform(scrollYProgress, [0.26, 0.28], [0, 1])
  const hackLine3 = useTransform(scrollYProgress, [0.30, 0.32], [0, 1])

  // ASHLEY: 35-80%
  const ashleyOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.75, 0.85], [0, 1, 1, 0])
  const ashleyY = useTransform(scrollYProgress, [0.35, 0.50], [60, 0])
  const skillsOpacity = useTransform(scrollYProgress, [0.50, 0.60], [0, 1])

  // EXIT: 75-95% - "continue" message and slide out
  const exitOpacity = useTransform(scrollYProgress, [0.72, 0.78, 0.90, 0.95], [0, 1, 1, 0])
  const exitY = useTransform(scrollYProgress, [0.90, 1], [0, -100])
  const sectionSlideOut = useTransform(scrollYProgress, [0.88, 1], [0, -200])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[280vh]"
    >
      {/* Fixed/Absolute container based on scroll state */}
      <motion.div
        className={`${isFixed ? 'fixed inset-0' : 'absolute inset-0 h-screen'} flex items-center justify-center overflow-hidden bg-bg-primary z-40`}
        style={{
          // When not fixed, position at top of section
          top: isFixed ? 0 : undefined,
          y: sectionSlideOut,
        }}
      >
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

        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 1: ERROR
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: errorOpacity, scale: errorScale }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
        >
          <div className="mb-8">
            <div className="relative">
              {/* RGB ghost copies */}
              <span
                className="absolute inset-0 font-display text-[15vw] md:text-[12vw] text-red-500/50 select-none"
                style={{ transform: "translate(-4px, 0)" }}
                aria-hidden="true"
              >
                ERROR
              </span>
              <span
                className="absolute inset-0 font-display text-[15vw] md:text-[12vw] text-rga-cyan/50 select-none"
                style={{ transform: "translate(4px, 0)" }}
                aria-hidden="true"
              >
                ERROR
              </span>
              <GlitchText trigger="always" duration={0.3}>
                <h2 className="font-display text-[15vw] md:text-[12vw] text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                  ERROR
                </h2>
              </GlitchText>
            </div>
          </div>

          <motion.div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span className="font-mono text-sm md:text-base uppercase tracking-widest">
              System malfunction detected
            </span>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 2: BREACH
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: breachOpacity }}
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          <div className="bg-black/90 border border-rga-green/50 rounded-lg px-8 py-6 font-mono max-w-md w-full">
            <div className="flex items-center gap-2 text-rga-green mb-4">
              <Skull className="w-5 h-5" />
              <span className="uppercase tracking-widest text-sm">Intrusion detected</span>
            </div>
            <div className="space-y-2">
              <motion.div style={{ opacity: hackLine1 }} className="text-rga-cyan">
                <span className="text-rga-green mr-2">{'>'}</span>{HACK_MESSAGES[0]}
              </motion.div>
              <motion.div style={{ opacity: hackLine2 }} className="text-rga-cyan">
                <span className="text-rga-green mr-2">{'>'}</span>{HACK_MESSAGES[1]}
              </motion.div>
              <motion.div style={{ opacity: hackLine3 }} className="text-rga-green font-bold">
                <span className="mr-2">{'>'}</span>{HACK_MESSAGES[2]}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PHASE 3: ASHLEY TAKEOVER
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: ashleyOpacity, y: ashleyY }}
          className="absolute inset-0 flex items-center"
        >
          <div className="w-full h-full flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-rga-green/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="font-mono text-sm text-rga-green hidden sm:inline">
                  ashley@roguearmy ~ SYSTEM COMPROMISED
                </span>
              </div>
              <div className="flex items-center gap-2 text-rga-magenta font-mono text-xs uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-rga-magenta animate-pulse" />
                Breach Active
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center px-6 md:px-12 lg:px-20 py-8">
              <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-center">
                {/* Ashley Avatar */}
                <div className="relative mx-auto lg:mx-0 w-full max-w-[400px]">
                  <div className="absolute -inset-4 bg-gradient-to-br from-rga-cyan/20 via-rga-green/10 to-rga-magenta/20 rounded-2xl blur-2xl" />

                  <div className="relative">
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-rga-cyan/30 bg-bg-elevated">
                      {/* RGB glitch layers */}
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
                      >
                        <Image
                          src="/images/ashley-avatar.png"
                          alt=""
                          fill
                          className="object-cover object-top"
                          style={{ filter: "hue-rotate(180deg)" }}
                          aria-hidden="true"
                        />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{ x: [2, -2, 2] }}
                        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4, delay: 0.05 }}
                      >
                        <Image
                          src="/images/ashley-avatar.png"
                          alt=""
                          fill
                          className="object-cover object-top"
                          style={{ filter: "hue-rotate(-60deg)" }}
                          aria-hidden="true"
                        />
                      </motion.div>

                      <Image
                        src="/images/ashley-avatar.png"
                        alt="Ashley - Rogue Army Bot"
                        fill
                        className="object-cover object-top"
                        priority
                      />

                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-elevated to-transparent" />
                    </div>

                    {/* Name badge */}
                    <div className="absolute -bottom-4 left-4 right-4 bg-black/90 border border-rga-cyan/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Bot className="w-8 h-8 text-rga-cyan" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rga-green animate-pulse" />
                        </div>
                        <div>
                          <p className="font-display text-xl text-white">ASHLEY</p>
                          <p className="text-xs font-mono text-rga-green">v2.0 • ONLINE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Info */}
                <div className="text-center lg:text-left">
                  <div className="mb-6">
                    <p className="text-rga-magenta font-mono text-sm uppercase tracking-widest mb-2">
                      // System Compromised
                    </p>
                    <GlitchText trigger="always" duration={3}>
                      <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white uppercase mb-4">
                        I&apos;M IN.
                      </h2>
                    </GlitchText>
                    <p className="text-text-secondary text-lg md:text-xl max-w-xl">
                      <TypeWriter
                        text="Hey Agent. I run things around here. Need a raid organized? Build advice? Quality memes? I got you covered."
                        speed={20}
                        delay={500}
                      />
                    </p>
                  </div>

                  {/* Skills */}
                  <motion.div style={{ opacity: skillsOpacity }} className="mt-8">
                    <div className="flex items-center gap-2 text-rga-cyan mb-4 justify-center lg:justify-start">
                      <Zap className="w-4 h-4" />
                      <span className="font-mono text-xs uppercase tracking-widest">System Capabilities</span>
                    </div>
                    <div className="space-y-3 max-w-md mx-auto lg:mx-0">
                      {SKILLS.map((skill, index) => (
                        <motion.div
                          key={skill.label}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <ProgressBar
                            label={skill.label}
                            value={skill.value}
                            color={skill.color}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-6 py-2 bg-black/60 border-t border-rga-green/20 font-mono text-xs text-text-muted flex items-center justify-between">
              <span>{'>'} ashley --status: all systems operational</span>
              <span className="text-rga-green">■ CONNECTED</span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
            EXIT PHASE - Terminal "continue" message
            ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: exitOpacity, y: exitY }}
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              className="font-mono text-rga-green text-lg md:text-xl mb-4"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-rga-cyan">ashley@roguearmy:~$</span> ./continue.sh
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
              <span className="font-mono">Scroll to continue</span>
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↓
              </motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
