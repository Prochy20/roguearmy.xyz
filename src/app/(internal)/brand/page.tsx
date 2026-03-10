'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
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
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { CyberButton } from '@/components/members/CyberButton'

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR DATA
   ═══════════════════════════════════════════════════════════════════════════ */

interface ColorSwatch {
  name: string
  hex: string
  tailwind: string
  glow?: boolean
}

const BRAND_COLORS: ColorSwatch[] = [
  { name: 'Green', hex: '#00FF41', tailwind: 'rga-green', glow: true },
  { name: 'Cyan', hex: '#00FFFF', tailwind: 'rga-cyan', glow: true },
  { name: 'Magenta', hex: '#FF00FF', tailwind: 'rga-magenta', glow: true },
]

const BG_COLORS: ColorSwatch[] = [
  { name: 'Void', hex: '#030303', tailwind: 'void' },
  { name: 'Primary', hex: '#0A0A0A', tailwind: 'bg-primary' },
  { name: 'Elevated', hex: '#111111', tailwind: 'bg-elevated' },
  { name: 'Surface', hex: '#1A1A1A', tailwind: 'bg-surface' },
]

const TEXT_COLORS: ColorSwatch[] = [
  { name: 'Primary', hex: '#FFFFFF', tailwind: 'text-primary' },
  { name: 'Secondary', hex: '#888888', tailwind: 'text-secondary' },
  { name: 'Muted', hex: '#555555', tailwind: 'text-muted' },
]

const GLOW_COLORS: ColorSwatch[] = [
  { name: 'Glow Green', hex: 'rgba(0,255,65,0.5)', tailwind: 'glow-green' },
  { name: 'Glow Cyan', hex: 'rgba(0,255,255,0.5)', tailwind: 'glow-cyan' },
  { name: 'Glow Magenta', hex: 'rgba(255,0,255,0.5)', tailwind: 'glow-magenta' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const TYPE_SCALE = [
  { label: 'H1', classes: 'font-display text-5xl md:text-6xl uppercase', sample: 'ROGUE ARMY' },
  { label: 'H2', classes: 'font-display text-3xl md:text-4xl uppercase', sample: 'SECTION TITLE' },
  { label: 'H3', classes: 'font-display text-xl md:text-2xl uppercase', sample: 'SUB HEADING' },
  { label: 'Body', classes: 'font-body text-base', sample: 'The quick brown fox jumps over the lazy dog. Rogue Army is a gaming community with cyberpunk aesthetics.' },
  { label: 'Small', classes: 'font-body text-sm text-text-secondary', sample: 'Secondary text for supporting information and metadata.' },
  { label: 'Mono', classes: 'font-mono text-sm', sample: '> system.init() // terminal output' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   GRADIENT DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const GRADIENTS = [
  {
    name: 'Brand Gradient',
    classes: 'bg-linear-to-r from-rga-green via-rga-cyan to-rga-magenta',
    description: 'The full RGA spectrum. Use for primary CTAs, hero accents, and major brand moments. This is the most impactful gradient — use it sparingly to maintain its effect.',
  },
  {
    name: 'Green \u2192 Cyan',
    classes: 'bg-linear-to-r from-rga-green to-rga-cyan',
    description: 'The primary accent pair. Use for secondary UI elements, progress bars, and data visualizations. Feels technical and clean.',
  },
  {
    name: 'Cyan \u2192 Magenta',
    classes: 'bg-linear-to-r from-rga-cyan to-rga-magenta',
    description: 'The neon accent pair. Works well for hover states, notifications, and decorative lines. Has a more energetic, cyberpunk feel.',
  },
  {
    name: 'Green \u2192 Magenta',
    classes: 'bg-linear-to-r from-rga-green to-rga-magenta',
    description: 'High contrast pair. Use for alerts, important badges, or when you need maximum visual tension. The complementary colors create strong energy.',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   COPY TOAST
   ═══════════════════════════════════════════════════════════════════════════ */

function useCopyToast() {
  const [toast, setToast] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setToast(text)
    setTimeout(() => setToast(null), 2000)
  }, [])

  return { toast, copy }
}

function CopyToast({ value }: { value: string | null }) {
  return (
    <AnimatePresence>
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-bg-elevated border border-rga-green/40 font-mono text-sm text-rga-green"
        >
          Copied: {value}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SWATCH COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function Swatch({ color, onCopy }: { color: ColorSwatch; onCopy: (v: string) => void }) {
  return (
    <button
      onClick={() => onCopy(color.hex)}
      className="group text-left transition-transform hover:scale-105"
    >
      <div
        className="h-20 border border-white/10 mb-2"
        style={{
          backgroundColor: color.hex,
          boxShadow: color.glow ? `0 0 30px ${color.hex}40, 0 0 60px ${color.hex}20` : undefined,
        }}
      />
      <p className="font-mono text-xs text-text-primary">{color.name}</p>
      <p className="font-mono text-xs text-text-secondary">{color.hex}</p>
      <p className="font-mono text-xs text-text-muted">{color.tailwind}</p>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOWNLOAD ICON
   ═══════════════════════════════════════════════════════════════════════════ */

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionHeading({ tag, title, description }: { tag: string; title: string; description?: string }) {
  return (
    <div className="text-center mb-12">
      <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">
        {tag}
      </p>
      <ChromaticText as="h2" className="font-display text-4xl md:text-5xl uppercase tracking-tight text-white">
        {title}
      </ChromaticText>
      {description && (
        <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   GUIDELINE NOTE
   ═══════════════════════════════════════════════════════════════════════════ */

function GuidelineNote({ children, color = 'cyan' }: { children: React.ReactNode; color?: 'green' | 'cyan' | 'magenta' }) {
  const borderColor = { green: 'border-rga-green/20', cyan: 'border-rga-cyan/20', magenta: 'border-rga-magenta/20' }[color]
  const bgColor = { green: 'bg-rga-green/5', cyan: 'bg-rga-cyan/5', magenta: 'bg-rga-magenta/5' }[color]
  const textColor = { green: 'text-rga-green', cyan: 'text-rga-cyan', magenta: 'text-rga-magenta' }[color]

  return (
    <div className={`border-l-2 ${borderColor} ${bgColor} px-4 py-3 my-6`}>
      <p className={`font-mono text-xs ${textColor} tracking-widest uppercase mb-1`}>{'>'} Guideline</p>
      <p className="text-text-secondary text-sm leading-relaxed">{children}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function BrandPage() {
  const { toast, copy } = useCopyToast()

  return (
    <>
      <style>{`html, body { overflow: auto !important; background: #030303 !important; }`}</style>
      <div className="min-h-screen bg-void text-text-primary">
        <ScanlineOverlay intensity="low" />
        <CopyToast value={toast} />

        {/* ═════════════════════════════════════════════════════════════════
            HERO
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-20">
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
            <div className="absolute inset-0 opacity-50 animate-glitch" style={{ transform: 'translate(-3px, 0)' }}>
              <Image src="/logo.png" alt="" width={120} height={120} className="w-24 h-24 md:w-28 md:h-28 opacity-60" style={{ filter: 'hue-rotate(180deg)' }} aria-hidden="true" />
            </div>
            <div className="absolute inset-0 opacity-50 animate-glitch" style={{ transform: 'translate(3px, 0)', animationDelay: '0.05s' }}>
              <Image src="/logo.png" alt="" width={120} height={120} className="w-24 h-24 md:w-28 md:h-28 opacity-60" style={{ filter: 'hue-rotate(-60deg)' }} aria-hidden="true" />
            </div>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Image src="/logo.png" alt="Rogue Army Logo" width={120} height={120} className="w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]" priority />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center mb-4">
            <h1 className="font-display text-[10vw] md:text-[7vw] lg:text-[5vw] leading-[0.9] uppercase tracking-tight">
              <HeroGlitch minInterval={4} maxInterval={10} intensity={6} dataCorruption={false} colors={['#00ffff', '#ff00ff']}>
                <span className="text-white">
                  RGA <span className="text-rga-green text-glow-green">BRAND</span> MANUAL
                </span>
              </HeroGlitch>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }} className="text-center">
            <p className="text-text-secondary text-base md:text-lg max-w-lg mx-auto">
              <TypeWriter text="// VISUAL IDENTITY & DESIGN GUIDELINES" speed={30} delay={800} />
            </p>
          </motion.div>

          {/* Internal use notice */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1.2 }} className="mt-6 px-4 py-2 border border-rga-magenta/30 bg-rga-magenta/5">
            <p className="font-mono text-xs text-rga-magenta tracking-wider text-center uppercase">
              Internal use only — Not for public distribution
            </p>
          </motion.div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════
            DIVIDER
            ═════════════════════════════════════════════════════════════════ */}
        <SectionGlitch intensity="medium" colorPrimary="green" colorSecondary="cyan" />

        {/* ═════════════════════════════════════════════════════════════════
            ABOUT THIS DOCUMENT
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-4xl mx-auto">
          <SectionHeading
            tag="// 00 — ABOUT"
            title="ABOUT THIS DOCUMENT"
          />

          <ScrollReveal>
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">What is this?</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  This is the official Rogue Army brand manual — a complete reference for our visual identity.
                  It defines every color, typeface, effect, and component that makes RGA look like RGA. Whether
                  you&apos;re designing a stream overlay, editing a social media post, building a website feature,
                  or creating content for the community, this document is your source of truth.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Who is it for?</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Anyone creating visual content for Rogue Army — designers, developers, streamers, and content creators.
                  If you&apos;re putting the RGA name or logo on something, check this document first.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">How to use it</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  The manual is organized into sections, each covering a different part of our identity.
                  Scroll through them in order for the full picture, or jump to the section you need:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { num: '01', label: 'Logo', desc: 'Usage rules, clear space, minimum sizes, do\u2019s & don\u2019ts' },
                    { num: '02', label: 'Colors', desc: 'Brand palette, backgrounds, text hierarchy, glow values' },
                    { num: '03', label: 'Typography', desc: 'Typefaces, weights, scale, downloadable font files' },
                    { num: '04', label: 'Gradients & Backgrounds', desc: 'Linear & radial gradients, cinematic background images' },
                    { num: '05', label: 'Effects', desc: 'Glows, glitch, chromatic aberration, noise — when & how' },
                    { num: '06', label: 'Components', desc: 'Buttons, corners, tags — pre-built UI building blocks' },
                  ].map((s) => (
                    <div key={s.num} className="flex gap-3 items-start border border-white/5 bg-bg-primary/50 px-3 py-2">
                      <span className="font-mono text-xs text-rga-cyan shrink-0">{s.num}</span>
                      <div>
                        <p className="font-mono text-xs text-white">{s.label}</p>
                        <p className="text-text-muted text-xs leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Downloadable assets</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Logo files and fonts are available for direct download throughout the document — look for
                  the download buttons in the Logo and Typography sections. Color values can be copied to
                  clipboard by clicking any swatch in the Colors section.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">The golden rule</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Consistency is everything. Every piece of RGA content should feel like it came from the
                  same universe — dark, neon-lit, and unmistakably cyberpunk. When in doubt, refer back
                  here. If something isn&apos;t covered, ask before improvising.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <SectionGlitch intensity="subtle" colorPrimary="green" colorSecondary="magenta" />

        {/* ═════════════════════════════════════════════════════════════════
            LOGO
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 01 — LOGO"
            title="LOGO"
            description="The RGA skull logo is the single most recognizable element of our brand. It should always appear sharp, properly spaced, and in its original colors. It works on both dark and light backgrounds. Never alter, recolor, or distort it."
          />

          {/* Large logo display */}
          <ScrollReveal>
            <div className="flex justify-center mb-6">
              <div className="p-12 md:p-16 border border-white/10 bg-bg-primary relative">
                <Image
                  src="/logo.png"
                  alt="RGA Logo"
                  width={200}
                  height={200}
                  className="w-40 h-40 md:w-48 md:h-48 drop-shadow-[0_0_40px_rgba(0,255,65,0.5)]"
                />
                {/* Clear space markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-rga-green/40" />
                <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-rga-green/40" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-rga-green/40" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-rga-green/40" />
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-text-muted whitespace-nowrap">
                  Minimum clear space = logo height &times; 0.25
                </p>
              </div>
            </div>

            {/* Download */}
            <div className="flex justify-center mt-10 mb-2">
              <a href="/logo.png" download="RGA-Logo.png">
                <GlowButton glowColor="green" pulse={false} className="text-sm px-6 py-3">
                  Download Logo (PNG)
                </GlowButton>
              </a>
            </div>
            <p className="text-text-muted text-xs text-center font-mono">logo.png — original full-resolution mark</p>

            <GuidelineNote color="green">
              Always maintain a clear zone around the logo equal to at least 25% of its height on all sides.
              No text, icons, or other graphic elements should enter this zone. The corner brackets above
              illustrate the minimum padding boundary.
            </GuidelineNote>
          </ScrollReveal>

          {/* Minimum sizes */}
          <ScrollReveal>
            <div className="mb-6">
              <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2 text-center">Minimum Sizes</h3>
              <p className="text-text-secondary text-sm text-center mb-6 max-w-xl mx-auto">
                The logo must never be rendered below 32px. At small sizes, fine details in the skull are lost
                and the mark becomes unrecognizable. For avatars or favicons, use the simplified icon variant if available.
              </p>
              <div className="flex items-end justify-center gap-8 md:gap-12">
                {[
                  { size: 128, note: 'Hero / splash' },
                  { size: 64, note: 'Navigation / cards' },
                  { size: 32, note: 'Minimum allowed' },
                ].map(({ size, note }) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Image src="/logo.png" alt="" width={size} height={size} style={{ width: size, height: size }} />
                    <span className="font-mono text-xs text-text-primary">{size}px</span>
                    <span className="font-mono text-xs text-text-muted">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Do's and Don'ts */}
          <ScrollRevealContainer staggerDelay={0.1}>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2 text-center">Usage Guidelines</h3>
            <p className="text-text-secondary text-sm text-center mb-6 max-w-xl mx-auto">
              The logo must always appear in its original form and colors. The green glow effect is
              encouraged for hero placements on dark backgrounds. Never modify the logo&apos;s colors, proportions, or orientation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Do's */}
              {[
                { label: 'On dark backgrounds', desc: 'The logo is designed for dark contexts. Use Void (#030303) or darker for best contrast.', bg: 'bg-bg-primary' },
                { label: 'With green glow', desc: 'The signature green drop-shadow reinforces our brand identity. Encouraged for hero placements.', bg: 'bg-bg-primary', glow: true },
                { label: 'On light backgrounds', desc: 'The logo works on white or light surfaces too. The colors hold up across any background.', bg: 'bg-white', lightText: true },
              ].map((item) => (
                <ScrollRevealItem key={item.label}>
                  <div className={`${item.bg} border border-white/10 p-6 flex flex-col items-center gap-3 h-full`}>
                    <div className="relative w-16 h-16">
                      <Image
                        src="/logo.png"
                        alt=""
                        fill
                        className="object-contain"
                        style={item.glow ? { filter: 'drop-shadow(0 0 20px rgba(0,255,65,0.6))' } : undefined}
                      />
                    </div>
                    <p className={`font-mono text-xs text-center ${item.lightText ? 'text-black' : 'text-text-secondary'}`}>{item.label}</p>
                    <p className={`text-xs text-center leading-relaxed ${item.lightText ? 'text-black/60' : 'text-text-muted'}`}>{item.desc}</p>
                    <span className="font-mono text-xs font-bold text-rga-green mt-auto">&#10003; DO</span>
                  </div>
                </ScrollRevealItem>
              ))}

              {/* Don'ts */}
              {[
                { label: 'Stretched / distorted', desc: 'Always maintain the original 1:1 aspect ratio. Scaling must be uniform on both axes.', bg: 'bg-bg-primary', distort: true },
                { label: 'Rotated', desc: 'The skull must always face forward and upright. Never rotate, flip, or tilt the logo.', bg: 'bg-bg-primary', rotate: true },
                { label: 'Monochrome / recolored', desc: 'The logo uses its original colors. Never apply filters, tints, or convert to monochrome white/black.', bg: 'bg-bg-primary', mono: true },
              ].map((item) => (
                <ScrollRevealItem key={item.label}>
                  <div className={`${item.bg} border border-white/10 p-6 flex flex-col items-center gap-3 h-full`}>
                    <div className="relative w-16 h-16">
                      <Image
                        src="/logo.png"
                        alt=""
                        fill
                        className={`object-contain ${item.distort ? 'scale-x-150' : ''} ${item.rotate ? 'rotate-45' : ''} ${item.mono ? 'brightness-0 invert' : ''}`}
                      />
                    </div>
                    <p className="font-mono text-xs text-center text-text-secondary">
                      {item.label}
                    </p>
                    <p className="text-xs text-center leading-relaxed text-text-muted">{item.desc}</p>
                    <span className="font-mono text-xs font-bold text-rga-magenta mt-auto">&#10007; DON&apos;T</span>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollRevealContainer>
        </section>

        <SectionGlitch intensity="subtle" colorPrimary="cyan" colorSecondary="magenta" />

        {/* ═════════════════════════════════════════════════════════════════
            COLOR PALETTE
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 02 — COLORS"
            title="COLOR PALETTE"
            description="Our palette is built for dark interfaces. The three brand colors — Green, Cyan, and Magenta — are high-saturation neon accents designed to pop against near-black backgrounds. Click any swatch to copy its hex value."
          />

          {/* Brand Colors */}
          <ScrollReveal>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Brand Colors</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              These are the core identity colors. Green is the primary accent used for CTAs, active states, and the logo glow.
              Cyan serves as the secondary accent for links, highlights, and technical UI. Magenta is the tertiary accent
              reserved for warnings, special badges, and moments of visual tension.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {BRAND_COLORS.map((c) => <Swatch key={c.hex} color={c} onCopy={copy} />)}
            </div>
            <GuidelineNote color="green">
              Never use brand colors as large background fills — they are accent colors only. On dark backgrounds,
              use them for text, borders, glows, and small UI elements. If you need a colored background area,
              use the color at 5-10% opacity (e.g. <span className="font-mono">bg-rga-green/5</span>).
            </GuidelineNote>
          </ScrollReveal>

          {/* Background Colors */}
          <ScrollReveal>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Background Colors</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Four levels of darkness create depth and hierarchy. Void is the base canvas color used for page backgrounds.
              Primary is for cards and content areas. Elevated is for raised elements like modals and dropdowns.
              Surface is the lightest level, used for hover states and subtle borders.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {BG_COLORS.map((c) => <Swatch key={c.hex} color={c} onCopy={copy} />)}
            </div>
            <GuidelineNote>
              These background shades are intentionally close together. The subtle difference between them creates
              depth without breaking the dark aesthetic. Layer them from dark to light: Void &rarr; Primary &rarr; Elevated &rarr; Surface.
              Never skip levels (e.g. don&apos;t place Surface directly on Void).
            </GuidelineNote>
          </ScrollReveal>

          {/* Text Colors */}
          <ScrollReveal>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Text Colors</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Three text hierarchy levels. Primary (#FFFFFF) is for headings and important content.
              Secondary (#888888) is for body text and descriptions. Muted (#555555) is for labels,
              timestamps, placeholders, and disabled text.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {TEXT_COLORS.map((c) => <Swatch key={c.hex} color={c} onCopy={copy} />)}
            </div>
            <GuidelineNote>
              Always use the text hierarchy consistently: primary for headings, secondary for body paragraphs,
              muted for supporting metadata. Never use brand colors (green, cyan, magenta) for long-form body text —
              they are for short labels, links, and accents only.
            </GuidelineNote>
          </ScrollReveal>

          {/* Glow Colors */}
          <ScrollReveal>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2">Glow Colors</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Semi-transparent versions of our brand colors, used exclusively for <span className="font-mono text-xs">box-shadow</span> and
              glow effects. These create the signature neon luminosity that defines our cyberpunk aesthetic.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GLOW_COLORS.map((c) => <Swatch key={c.tailwind} color={c} onCopy={copy} />)}
            </div>
          </ScrollReveal>
        </section>

        <SectionGlitch intensity="subtle" colorPrimary="magenta" colorSecondary="green" />

        {/* ═════════════════════════════════════════════════════════════════
            TYPOGRAPHY
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 03 — TYPOGRAPHY"
            title="TYPE SYSTEM"
            description="Three typefaces form our typographic identity. Each serves a distinct purpose — display for impact, body for readability, mono for data and code. Never swap their roles or introduce additional fonts."
          />

          {/* Font specimens */}
          <ScrollRevealContainer staggerDelay={0.1} className="space-y-12 mb-16">
            {/* Hanson Bold */}
            <ScrollRevealItem>
              <div className="space-y-4">
                <CyberCorners color="green" size="sm">
                  <div className="p-6 md:p-8">
                    <p className="font-mono text-xs text-rga-green tracking-widest uppercase mb-6">
                      Hanson Bold — font-display
                    </p>
                    <p className="font-display text-6xl md:text-8xl uppercase text-white leading-none mb-3">
                      ROGUE ARMY
                    </p>
                    <p className="font-display text-2xl md:text-3xl uppercase text-text-secondary leading-none">
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </p>
                  </div>
                </CyberCorners>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-1">
                  <p className="text-text-secondary text-sm leading-relaxed flex-1">
                    Our display typeface. Used for all headings (H1, H2, H3), hero text, and brand moments.
                    Always set in <strong className="text-white">UPPERCASE</strong> — Hanson Bold is not designed for mixed case.
                    Apply tight tracking and leading for maximum impact. Pair with chromatic aberration or glow effects
                    on hero headings for the full RGA look.
                  </p>
                  <a href="/fonts/Hanson-Bold.otf" download="Hanson-Bold.otf" className="inline-flex items-center gap-2 font-mono text-xs text-rga-green hover:text-white transition-colors border border-rga-green/30 px-3 py-1.5 hover:border-rga-green/60 shrink-0 self-start">
                    <DownloadIcon /> Download Hanson-Bold.otf
                  </a>
                </div>
              </div>
            </ScrollRevealItem>

            {/* Outfit */}
            <ScrollRevealItem>
              <div className="space-y-4">
                <CyberCorners color="cyan" size="sm">
                  <div className="p-6 md:p-8">
                    <p className="font-mono text-xs text-rga-cyan tracking-widest uppercase mb-6">
                      Outfit — font-body
                    </p>
                    <div className="space-y-2">
                      <p className="font-body font-light text-xl text-white">Light 300 — The quick brown fox jumps over the lazy dog</p>
                      <p className="font-body font-normal text-xl text-white">Regular 400 — The quick brown fox jumps over the lazy dog</p>
                      <p className="font-body font-medium text-xl text-white">Medium 500 — The quick brown fox jumps over the lazy dog</p>
                      <p className="font-body font-semibold text-xl text-white">Semibold 600 — The quick brown fox jumps over the lazy dog</p>
                      <p className="font-body font-bold text-xl text-white">Bold 700 — The quick brown fox jumps over the lazy dog</p>
                    </div>
                  </div>
                </CyberCorners>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-1">
                  <p className="text-text-secondary text-sm leading-relaxed flex-1">
                    Our body typeface for all readable content — paragraphs, descriptions, UI labels, and navigation.
                    Use <strong className="text-white">Regular 400</strong> for body text
                    and <strong className="text-white">Semibold 600</strong> or <strong className="text-white">Bold 700</strong> for
                    emphasis and inline labels. Light 300 can be used for large-size decorative text but avoid it
                    at small sizes where readability suffers.
                  </p>
                  <a href="https://fonts.google.com/specimen/Outfit" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-xs text-rga-cyan hover:text-white transition-colors border border-rga-cyan/30 px-3 py-1.5 hover:border-rga-cyan/60 shrink-0 self-start">
                    <DownloadIcon /> Get on Google Fonts ↗
                  </a>
                </div>
              </div>
            </ScrollRevealItem>

            {/* JetBrains Mono */}
            <ScrollRevealItem>
              <div className="space-y-4">
                <CyberCorners color="magenta" size="sm">
                  <div className="p-6 md:p-8">
                    <p className="font-mono text-xs text-rga-magenta tracking-widest uppercase mb-6">
                      JetBrains Mono — font-mono
                    </p>
                    <div className="font-mono text-base text-white space-y-1">
                      <p>{'>'} system.init()</p>
                      <p>{'>'} loading modules... <span className="text-rga-green">OK</span></p>
                      <p>{'>'} const rga = new RogueArmy()</p>
                      <p className="text-text-muted">{'// 0123456789 !@#$%^&*()'}</p>
                    </div>
                  </div>
                </CyberCorners>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-1">
                  <p className="text-text-secondary text-sm leading-relaxed flex-1">
                    Our monospace typeface for terminal-style output, code snippets, section tags (e.g. {'"// SECTION 01"'}),
                    technical metadata, timestamps, and data labels. It reinforces the cyberpunk / hacker aesthetic.
                    Always use at smaller sizes (text-xs to text-sm) for UI labels. Set in uppercase with wide
                    tracking for section markers.
                  </p>
                  <a href="https://fonts.google.com/specimen/JetBrains+Mono" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-xs text-rga-magenta hover:text-white transition-colors border border-rga-magenta/30 px-3 py-1.5 hover:border-rga-magenta/60 shrink-0 self-start">
                    <DownloadIcon /> Get on Google Fonts ↗
                  </a>
                </div>
              </div>
            </ScrollRevealItem>
          </ScrollRevealContainer>

          {/* Size hierarchy */}
          <ScrollReveal>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2 text-center">Size Hierarchy</h3>
            <p className="text-text-secondary text-sm text-center mb-6 max-w-xl mx-auto">
              Use this scale consistently. H1 is reserved for page-level titles and hero sections.
              H2 marks major sections. H3 introduces subsections. Body is for paragraphs.
              Small is for captions and metadata. Mono is for tags and technical labels.
            </p>
            <div className="space-y-6 border border-white/10 p-6">
              {TYPE_SCALE.map((t) => (
                <div key={t.label} className="flex items-baseline gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <span className="shrink-0 w-12 font-mono text-xs text-rga-cyan">{t.label}</span>
                  <span className={t.classes}>{t.sample}</span>
                </div>
              ))}
            </div>
            <GuidelineNote color="magenta">
              Never use Hanson Bold for body text or long paragraphs — it is illegible at small sizes and in mixed case.
              Conversely, never use Outfit for hero headings where Hanson Bold is expected. The font pairing is
              intentional: Hanson screams, Outfit speaks, JetBrains whispers.
            </GuidelineNote>
          </ScrollReveal>
        </section>

        <SectionGlitch intensity="medium" colorPrimary="green" colorSecondary="cyan" />

        {/* ═════════════════════════════════════════════════════════════════
            GRADIENTS
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 04 — GRADIENTS"
            title="GRADIENTS"
            description="Gradients bridge our accent colors and add energy to flat surfaces. Use them for decorative lines, text fills, button backgrounds, and section dividers. Always apply left-to-right direction for consistency."
          />

          <ScrollRevealContainer staggerDelay={0.1} className="space-y-8">
            {GRADIENTS.map((g) => (
              <ScrollRevealItem key={g.name}>
                <div>
                  <div className={`h-16 md:h-20 ${g.classes}`} />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mt-2">
                    <p className="font-mono text-xs text-text-secondary">{g.name}</p>
                    <p className="font-mono text-xs text-text-muted">{g.classes}</p>
                  </div>
                  <p className="text-text-muted text-sm mt-1 leading-relaxed">{g.description}</p>
                </div>
              </ScrollRevealItem>
            ))}

            {/* Radial gradient */}
            <ScrollRevealItem>
              <div>
                <div
                  className="h-32 md:h-40 border border-white/10"
                  style={{
                    background: `
                      radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,255,65,0.15) 0%, transparent 50%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,255,255,0.10) 0%, transparent 40%),
                      radial-gradient(ellipse 40% 30% at 20% 20%, rgba(255,0,255,0.08) 0%, transparent 40%),
                      #030303
                    `,
                  }}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mt-2">
                  <p className="font-mono text-xs text-text-secondary">Radial Background (Hero pattern)</p>
                  <p className="font-mono text-xs text-text-muted">Custom radial-gradient</p>
                </div>
                <p className="text-text-muted text-sm mt-1 leading-relaxed">
                  The standard hero/section background. Three overlapping radial ellipses at low opacity create ambient
                  depth without overpowering content. Position the green ellipse at top-center as the dominant light source,
                  cyan at bottom-right, and magenta at bottom-left.
                </p>
              </div>
            </ScrollRevealItem>
          </ScrollRevealContainer>

          <GuidelineNote>
            Use Tailwind v4 syntax: <span className="font-mono">bg-linear-to-r</span> not the
            deprecated <span className="font-mono">bg-gradient-to-r</span>. For radial backgrounds,
            use inline styles with <span className="font-mono">radial-gradient()</span> since Tailwind
            does not have radial gradient utilities.
          </GuidelineNote>

          {/* Background images */}
          <div className="mt-16">
            <ScrollReveal>
              <h3 className="font-display text-lg uppercase tracking-wider text-white mb-2 text-center">Background Images</h3>
              <p className="text-text-secondary text-sm text-center mb-8 max-w-2xl mx-auto">
                Five cinematic background images are available for hero sections, stream scenes, and promotional
                materials. They are always blended with a solid black overlay at 50-75% opacity to keep text
                readable and maintain the dark aesthetic. Never use them at full brightness.
              </p>
            </ScrollReveal>

            <ScrollRevealContainer staggerDelay={0.1} className="space-y-6">
              {[
                { file: 'Bg_01.jpg', name: 'Background 01' },
                { file: 'Bg_02.jpg', name: 'Background 02' },
                { file: 'Bg_03.jpg', name: 'Background 03' },
                { file: 'Bg_04.jpg', name: 'Background 04' },
                { file: 'Bg_05.jpg', name: 'Background 05' },
              ].map((bg) => (
                <ScrollRevealItem key={bg.file}>
                  <div className="space-y-3">
                    <div className="relative aspect-21/9 overflow-hidden border border-white/10">
                      {/* Full image for reference */}
                      <Image
                        src={`/images/bg/${bg.file}`}
                        alt={bg.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 1280px"
                      />
                      {/* Black overlay showing recommended usage (left half darker) */}
                      <div className="absolute inset-0 grid grid-cols-3">
                        <div className="bg-black/75" />
                        <div className="bg-black/50" />
                        <div />
                      </div>
                      {/* Labels */}
                      <div className="absolute inset-0 grid grid-cols-3">
                        <div className="flex items-end justify-center pb-3">
                          <span className="font-mono text-xs text-text-secondary">75% overlay</span>
                        </div>
                        <div className="flex items-end justify-center pb-3">
                          <span className="font-mono text-xs text-text-secondary">50% overlay</span>
                        </div>
                        <div className="flex items-end justify-center pb-3">
                          <span className="font-mono text-xs text-text-secondary/60">raw (don&apos;t use)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <p className="font-mono text-xs text-text-secondary">{bg.name}</p>
                        <p className="font-mono text-xs text-text-muted">/images/bg/{bg.file}</p>
                      </div>
                      <a
                        href={`/images/bg/${bg.file}`}
                        download={bg.file}
                        className="inline-flex items-center gap-2 font-mono text-xs text-rga-cyan hover:text-white transition-colors border border-rga-cyan/30 px-3 py-1.5 hover:border-rga-cyan/60 shrink-0"
                      >
                        <DownloadIcon /> Download
                      </a>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </ScrollRevealContainer>

            <GuidelineNote color="magenta">
              Always darken these images with a black overlay — use 75% opacity for text-heavy sections
              and 50% for atmospheric backgrounds with minimal text. The raw image at full brightness
              breaks the dark aesthetic and makes text illegible. Combine with radial gradient overlays
              for additional depth.
            </GuidelineNote>
          </div>
        </section>

        <SectionGlitch intensity="subtle" colorPrimary="cyan" colorSecondary="magenta" />

        {/* ═════════════════════════════════════════════════════════════════
            EFFECTS & ANIMATIONS
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 05 — EFFECTS"
            title="EFFECTS & ANIMATIONS"
            description="These effects create our cyberpunk identity. Each one is purpose-built — use them intentionally. Overuse dilutes their impact. The general rule: one major effect per viewport, subtle effects can stack."
          />

          <div className="space-y-10">
            {/* Text Glow */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="green" size="sm">
                  <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <p className="font-display text-2xl uppercase text-rga-green text-glow-green mb-2">Green Glow</p>
                    <p className="font-display text-2xl uppercase text-rga-cyan text-glow-cyan mb-2">Cyan Glow</p>
                    <p className="font-display text-2xl uppercase text-rga-magenta text-glow-magenta">Magenta Glow</p>
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-green mb-1">text-glow-green / cyan / magenta</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Adds a neon luminosity to text using layered text-shadows. Best on display-size headings or
                    single keywords you want to emphasize. Avoid applying to body text or long strings —
                    the blur makes them harder to read.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Box Glow */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="cyan" size="sm">
                  <div className="p-6 md:p-8 flex items-center justify-center gap-6 min-h-[160px]">
                    <div className="w-20 h-20 border border-rga-green/60 glow-green" />
                    <div className="w-20 h-20 border border-rga-cyan/60 glow-cyan" />
                    <div className="w-20 h-20 border border-rga-magenta/60 glow-magenta" />
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-cyan mb-1">glow-green / cyan / magenta</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Box-shadow glow applied to containers and cards. Use with a matching border color
                    at reduced opacity. Ideal for featured cards, active states, and focused elements.
                    Combine with CyberCorners for the full tactical UI look.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Chromatic Aberration */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="magenta" size="sm">
                  <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <ChromaticText as="p" className="font-display text-3xl uppercase text-white mb-2">Static</ChromaticText>
                    <ChromaticText as="p" animated className="font-display text-3xl uppercase text-white">Animated</ChromaticText>
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-magenta mb-1">
                    {'import { ChromaticText } from "@/components/effects/ChromaticText"'}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Simulates RGB channel misalignment from a broken CRT screen. The static version adds permanent
                    cyan/magenta text-shadows. The animated version pulses the offset. Use on section headings
                    and brand moments. The <span className="font-mono text-xs">as</span> prop controls the HTML element
                    (h1, h2, h3, span, p, div).
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Gradient Text */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="green" size="sm">
                  <div className="p-6 md:p-8 flex items-center justify-center min-h-[160px]">
                    <p className="font-display text-4xl md:text-5xl uppercase text-gradient-rga">ROGUE ARMY</p>
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-green mb-1">text-gradient-rga</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Applies the full brand gradient (green &rarr; cyan &rarr; magenta) as a text fill.
                    Use for feature titles, promotional headings, or anywhere you want the full spectrum
                    on text. Works by clipping a background gradient to the text shape. Always pair
                    with Hanson Bold at display sizes for best effect.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Glitch Text */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="cyan" size="sm">
                  <div className="p-6 md:p-8 flex items-center justify-center min-h-[160px]">
                    <GlitchText trigger="hover">
                      <span className="font-display text-4xl uppercase text-white cursor-pointer">Hover Me</span>
                    </GlitchText>
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-cyan mb-1">
                    {'import { GlitchText } from "@/components/effects/GlitchText"'}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    A brief digital distortion burst with RGB chromatic split. Three trigger modes:
                    {' '}<span className="font-mono text-xs">hover</span> (on mouse enter),
                    {' '}<span className="font-mono text-xs">scroll</span> (once on viewport entry),
                    and <span className="font-mono text-xs">always</span> (continuous loop).
                    Use hover for interactive elements and scroll for section titles.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Noise Overlay */}
            <ScrollReveal>
              <div className="space-y-3">
                <CyberCorners color="magenta" size="sm">
                  <div
                    className="relative min-h-[160px] noise-overlay overflow-hidden"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(0,255,65,0.15) 0%, rgba(0,255,255,0.10) 50%, rgba(255,0,255,0.10) 100%),
                        #1A1A1A
                      `,
                    }}
                  >
                    <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/30 tracking-widest uppercase">
                      Noise texture visible on lighter surfaces
                    </p>
                  </div>
                </CyberCorners>
                <div className="px-1">
                  <p className="font-mono text-xs text-rga-magenta mb-1">noise-overlay</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Adds a subtle animated static/grain texture over an element using a CSS pseudo-element.
                    Apply to any container
                    with <span className="font-mono text-xs">position: relative</span> and
                    {' '}<span className="font-mono text-xs">overflow: hidden</span>.
                    Keep it subtle — this is background texture, not a foreground effect.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <GuidelineNote color="magenta">
            Effects should enhance, not overwhelm. A page with every effect active simultaneously feels chaotic.
            Use HeroGlitch for one hero heading per page, ChromaticText for section headings, GlitchText for
            interactive moments, and text-glow for single keyword emphasis. The scanline overlay and noise texture
            are ambient — they can run page-wide at low intensity.
          </GuidelineNote>
        </section>

        <SectionGlitch intensity="medium" colorPrimary="magenta" colorSecondary="green" />

        {/* ═════════════════════════════════════════════════════════════════
            COMPONENTS
            ═════════════════════════════════════════════════════════════════ */}
        <section className="relative px-6 py-16 max-w-6xl mx-auto">
          <SectionHeading
            tag="// 06 — COMPONENTS"
            title="COMPONENTS"
            description="Pre-built UI components that embody the RGA visual language. Use these instead of creating custom elements — they handle colors, animations, hover states, and accessibility consistently."
          />

          <div className="space-y-8">
            {/* GlowButton */}
            <ScrollReveal>
              <CyberCorners color="green" size="sm">
                <div className="p-6">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">GlowButton</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <GlowButton glowColor="green" pulse>Green Pulse</GlowButton>
                    <GlowButton glowColor="cyan" pulse>Cyan Pulse</GlowButton>
                    <GlowButton glowColor="magenta" pulse>Magenta Pulse</GlowButton>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <GlowButton glowColor="green" pulse={false}>Green</GlowButton>
                    <GlowButton glowColor="cyan" pulse={false}>Cyan</GlowButton>
                    <GlowButton glowColor="magenta" pulse={false}>Magenta</GlowButton>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    The primary call-to-action button. Extends shadcn&apos;s Button with a neon box-shadow glow that
                    intensifies on hover. Enable <span className="font-mono text-xs">pulse</span> for the most important
                    action on a page (e.g. &quot;Join Now&quot;, &quot;Open Builder&quot;). Use green for primary actions,
                    cyan for secondary, and magenta for destructive or high-attention actions. Only one pulsing
                    button per viewport.
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {'import { GlowButton } from "@/components/shared/GlowButton"'}
                  </p>
                </div>
              </CyberCorners>
            </ScrollReveal>

            {/* CyberCorners */}
            <ScrollReveal>
              <CyberCorners color="cyan" size="sm">
                <div className="p-6">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">CyberCorners</p>
                  <div className="flex flex-wrap gap-6 mb-4">
                    <CyberCorners color="green" size="sm">
                      <div className="px-6 py-4 font-mono text-xs text-white">green / sm</div>
                    </CyberCorners>
                    <CyberCorners color="cyan" size="md">
                      <div className="px-6 py-4 font-mono text-xs text-white">cyan / md</div>
                    </CyberCorners>
                    <CyberCorners color="magenta" size="lg">
                      <div className="px-6 py-4 font-mono text-xs text-white">magenta / lg</div>
                    </CyberCorners>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    L-shaped targeting brackets positioned outside the content area, inspired by military HUD interfaces.
                    The brackets shift outward on hover for a subtle interactive feel. Use to frame featured
                    content blocks, cards, and sections.
                    Size <span className="font-mono text-xs">sm</span> for inline elements,
                    {' '}<span className="font-mono text-xs">md</span> for cards,
                    {' '}<span className="font-mono text-xs">lg</span> for hero-level containers.
                    The <span className="font-mono text-xs">corners</span> prop lets you selectively show
                    specific corners ({'"tl"'}, {'"tr"'}, {'"bl"'}, {'"br"'}).
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {'import { CyberCorners } from "@/components/ui/CyberCorners"'}
                  </p>
                </div>
              </CyberCorners>
            </ScrollReveal>

            {/* CyberButton */}
            <ScrollReveal>
              <CyberCorners color="magenta" size="sm">
                <div className="p-6">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">CyberButton</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <CyberButton color="green" onClick={() => {}}>Green</CyberButton>
                    <CyberButton color="cyan" onClick={() => {}}>Cyan</CyberButton>
                    <CyberButton color="magenta" onClick={() => {}}>Magenta</CyberButton>
                    <CyberButton color="gray" onClick={() => {}}>Gray</CyberButton>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    A versatile button/link component with subtle corner accents and a scan-line hover animation.
                    Works in two modes: pass <span className="font-mono text-xs">href</span> for navigation links,
                    or <span className="font-mono text-xs">onClick</span> for interactive actions. Supports optional
                    {' '}<span className="font-mono text-xs">iconLeft</span> and <span className="font-mono text-xs">iconRight</span> props
                    for inline icons that shift outward on hover. Use green for primary, cyan for informational,
                    magenta for featured, and gray for neutral/disabled-looking actions.
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {'import { CyberButton } from "@/components/members/CyberButton"'}
                  </p>
                </div>
              </CyberCorners>
            </ScrollReveal>

            {/* CyberTag */}
            <ScrollReveal>
              <CyberCorners color="green" size="sm">
                <div className="p-6">
                  <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">CyberTag</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <CyberTag color="green">Green</CyberTag>
                    <CyberTag color="cyan">Cyan</CyberTag>
                    <CyberTag color="magenta">Magenta</CyberTag>
                    <CyberTag color="orange">Orange</CyberTag>
                    <CyberTag color="red">Red</CyberTag>
                    <CyberTag color="gray">Gray</CyberTag>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    Compact tactical badge with miniature targeting brackets that animate on hover.
                    Use for status indicators, role labels, category tags, and metadata chips.
                    Green for active/online, cyan for info, magenta for special/featured, orange for
                    warnings, red for errors/offline, and gray for neutral/archived. The backdrop blur
                    and dark background make them work well layered over any content.
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {'import { CyberTag } from "@/components/ui/CyberCorners"'}
                  </p>
                </div>
              </CyberCorners>
            </ScrollReveal>
          </div>

          <GuidelineNote color="green">
            When choosing between GlowButton and CyberButton: GlowButton is the loud, attention-grabbing CTA
            with a neon glow — use it for the single most important action on a page. CyberButton is the quieter,
            more versatile option for navigation and secondary actions. Don&apos;t mix them side-by-side in the
            same button group.
          </GuidelineNote>
        </section>

        {/* ═════════════════════════════════════════════════════════════════
            FOOTER
            ═════════════════════════════════════════════════════════════════ */}
        <footer className="px-6 pt-12 pb-16">
          <div
            className="h-px max-w-2xl mx-auto mb-10"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.6) 30%, rgba(255,0,255,0.6) 70%, transparent)',
              boxShadow: '0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(255,0,255,0.2)',
            }}
          />
          <div className="flex flex-col items-center gap-4">
            <p className="text-text-muted text-xs font-mono tracking-wider uppercase">
              Internal reference — Rogue Army
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
