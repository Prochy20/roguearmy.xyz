'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { TypeWriter } from '@/components/effects/TypeWriter'
import { ChromaticText } from '@/components/effects/ChromaticText'
import { GlitchText } from '@/components/effects/GlitchText'
import { SectionGlitch } from '@/components/effects/SectionGlitch'
import { ScanlineOverlay } from '@/components/effects/ScanlineOverlay'
import {
  ScrollReveal,
  ScrollRevealContainer,
  ScrollRevealItem,
} from '@/components/shared/ScrollReveal'
import { GlowButton } from '@/components/shared/GlowButton'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { OverlayBox } from '@/components/overlays/OverlayBox'
import type { OverlayBoxConfig } from '@/lib/overlay-box-config'

const DEMO_BOX_CONFIG: OverlayBoxConfig = {
  color: 'cyan',
  badge: 'NOW PLAYING',
  icon: 'zap',
  accent: true,
  text: '',
  flicker: false,
  flickerSpeed: 4,
  fontSize: 'md',
  badgeSize: 'sm',
  textAlign: 'left',
  background: 'glass',
  bgOpacity: 100,
}

const OBS_STEPS = [
  {
    title: 'Add Browser Source',
    description: 'Click the + button under Sources in OBS and select "Browser".',
  },
  {
    title: 'Set the URL',
    description:
      'Paste the overlay URL into the URL field. Use the Box Builder to generate a configured URL.',
  },
  {
    title: 'Set Any Size',
    description:
      'The overlay automatically adjusts to whatever browser source dimensions you set — no need to match a specific resolution.',
  },
  {
    title: 'Enable Transparency',
    description:
      'Leave the Custom CSS at its default value. The overlay background is already transparent.',
  },
  {
    title: 'Position & Resize',
    description:
      'Drag and resize the source in your scene. Use the red grab handles to fit it where you need.',
  },
]

export default function OverlaysPage() {
  return (
    <>
      <style>{`html, body { overflow: auto !important; }`}</style>
      <div className="min-h-screen bg-void text-text-primary">
        <ScanlineOverlay intensity="low" />

        {/* ═══════════════════════════════════════════════════════════════════
            HERO
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-20">
          {/* Background accents */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,65,0.12) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,255,255,0.08) 0%, transparent 40%),
                radial-gradient(ellipse 40% 30% at 10% 80%, rgba(255,0,255,0.06) 0%, transparent 40%)
              `,
            }}
          />

          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative mb-6"
          >
            {/* RGB ghost copies */}
            <div
              className="absolute inset-0 opacity-50 animate-glitch"
              style={{ transform: 'translate(-3px, 0)' }}
            >
              <Image
                src="/logo.png"
                alt=""
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28 opacity-60"
                style={{ filter: 'hue-rotate(180deg)' }}
                aria-hidden="true"
              />
            </div>
            <div
              className="absolute inset-0 opacity-50 animate-glitch"
              style={{ transform: 'translate(3px, 0)', animationDelay: '0.05s' }}
            >
              <Image
                src="/logo.png"
                alt=""
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28 opacity-60"
                style={{ filter: 'hue-rotate(-60deg)' }}
                aria-hidden="true"
              />
            </div>
            {/* Main logo */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/logo.png"
                alt="Rogue Army Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-4"
          >
            <h1 className="font-display text-[10vw] md:text-[7vw] lg:text-[5vw] leading-[0.9] uppercase tracking-tight">
              <HeroGlitch
                minInterval={4}
                maxInterval={10}
                intensity={6}
                dataCorruption={false}
                colors={['#00ffff', '#ff00ff']}
              >
                <span className="text-white">
                  RGA STREAM <span className="text-rga-green text-glow-green">OVERLAYS</span>
                </span>
              </HeroGlitch>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-text-secondary text-base md:text-lg max-w-lg mx-auto">
              <TypeWriter
                text="Cyberpunk overlay toolkit for your Twitch stream"
                speed={30}
                delay={800}
              />
            </p>
          </motion.div>

          {/* RGA-only notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="mt-6 px-4 py-2 border border-rga-magenta/30 bg-rga-magenta/5"
          >
            <p className="font-mono text-xs text-rga-magenta tracking-wider text-center uppercase">
              Strictly reserved for Rogue Army members only
            </p>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            DIVIDER 1
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionGlitch intensity="medium" colorPrimary="green" colorSecondary="cyan" />

        {/* ═══════════════════════════════════════════════════════════════════
            LOGO OVERLAY SHOWCASE
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <ScrollReveal>
            <CyberCorners color="green" size="md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
                {/* Preview */}
                <div
                  className="relative overflow-hidden border border-white/10 aspect-16/9"
                  style={{
                    background: `
                      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,65,0.06) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(10,10,10,1) 100%)
                    `,
                  }}
                >
                  {/* Chromatic aberration logo mockup */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Cyan ghost */}
                    <Image
                      src="/logo.png"
                      alt=""
                      width={200}
                      height={200}
                      className="absolute w-32 h-32 md:w-40 md:h-40 opacity-30"
                      style={{ filter: 'hue-rotate(180deg)', transform: 'translate(-4px, -2px)' }}
                      aria-hidden="true"
                    />
                    {/* Magenta ghost */}
                    <Image
                      src="/logo.png"
                      alt=""
                      width={200}
                      height={200}
                      className="absolute w-32 h-32 md:w-40 md:h-40 opacity-30"
                      style={{ filter: 'hue-rotate(-60deg)', transform: 'translate(4px, 2px)' }}
                      aria-hidden="true"
                    />
                    {/* Main */}
                    <Image
                      src="/logo.png"
                      alt="Logo Overlay Preview"
                      width={200}
                      height={200}
                      className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_40px_rgba(0,255,65,0.6)]"
                    />
                  </div>

                  {/* Scanline overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
                    }}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col justify-center space-y-4">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
                    {'// OVERLAY 01'}
                  </p>
                  <ChromaticText as="h2" className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white">
                    Logo Overlay
                  </ChromaticText>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                    Animated RGA logo with chromatic aberration and glitch effects. Sits in the
                    corner of your stream as a persistent brand watermark with cyberpunk flair.
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-rga-cyan">
                    <li>{'>'} RGB chromatic split animation</li>
                    <li>{'>'} Periodic glitch bursts</li>
                    <li>{'>'} Transparent background — no green screen needed</li>
                    <li>{'>'} Lightweight — minimal CPU usage</li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/twitch/overlays/logo">
                      <GlowButton glowColor="green" pulse className="text-sm px-6 py-3">
                        View Logo Overlay
                      </GlowButton>
                    </Link>
                  </div>
                </div>
              </div>
            </CyberCorners>
          </ScrollReveal>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            DIVIDER 2
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionGlitch intensity="subtle" colorPrimary="cyan" colorSecondary="magenta" />

        {/* ═══════════════════════════════════════════════════════════════════
            BOX OVERLAY SHOWCASE
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <ScrollReveal>
            <CyberCorners color="cyan" size="md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
                {/* Description */}
                <div className="flex flex-col justify-center space-y-4 order-2 lg:order-1">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
                    {'// OVERLAY 02'}
                  </p>
                  <ChromaticText as="h2" className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white">
                    Box Overlay
                  </ChromaticText>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                    Configurable cyberpunk-styled box frame for scene labels, alerts, and info
                    panels. Design your box visually in the builder, then copy the URL into OBS.
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-rga-cyan">
                    <li>{'>'} 6 neon color themes</li>
                    <li>{'>'} Badge text with icon support</li>
                    <li>{'>'} Glass, tint, dark & solid backgrounds</li>
                    <li>{'>'} Corner brackets + accent bar options</li>
                    <li>{'>'} Optional neon flicker animation</li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/twitch/overlays/box/builder">
                      <GlowButton glowColor="cyan" pulse className="text-sm px-6 py-3">
                        Open Box Builder
                      </GlowButton>
                    </Link>
                  </div>
                </div>

                {/* Preview — live OverlayBox in contained preview */}
                <div
                  className="relative overflow-hidden border border-white/10 aspect-16/9 order-1 lg:order-2"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#111',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                  >
                    <div className="relative w-full h-full">
                      <OverlayBox {...DEMO_BOX_CONFIG} />
                    </div>
                  </div>
                </div>
              </div>
            </CyberCorners>
          </ScrollReveal>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            DIVIDER 3
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionGlitch intensity="medium" colorPrimary="magenta" colorSecondary="green" />

        {/* ═══════════════════════════════════════════════════════════════════
            OBS SETUP GUIDE
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">
              {'// SETUP GUIDE'}
            </p>
            <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-white">
              <GlitchText trigger="scroll">OBS SETUP</GlitchText>
            </h2>
          </div>

          <ScrollRevealContainer staggerDelay={0.12} className="space-y-6">
            {OBS_STEPS.map((step, i) => (
              <ScrollRevealItem key={i}>
                <div className="flex gap-5 items-start">
                  {/* Step number */}
                  <div
                    className="shrink-0 w-10 h-10 flex items-center justify-center font-mono text-sm font-bold border border-rga-cyan/40 text-rga-cyan"
                    style={{ backgroundColor: 'rgba(0,255,255,0.06)' }}
                  >
                    {i + 1}
                  </div>
                  {/* Step content */}
                  <div>
                    <h3 className="font-bold text-white text-base mb-1">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════════════════════════════════ */}
        <footer className="px-6 pt-12 pb-16">
          {/* Neon line separator */}
          <div
            className="h-px max-w-2xl mx-auto mb-10"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,255,255,0.6) 30%, rgba(255,0,255,0.6) 70%, transparent)',
              boxShadow: '0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(255,0,255,0.2)',
            }}
          />
          <div className="flex flex-col items-center gap-4">
            <p className="text-text-muted text-xs font-mono tracking-wider uppercase">
              Exclusively for Rogue Army streamers
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
