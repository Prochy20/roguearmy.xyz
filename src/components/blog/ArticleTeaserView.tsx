'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { Clock, Calendar, Shield, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import {
  type Article,
  type TintColor,
  getTintClasses,
  formatArticleDate,
} from '@/lib/articles'

// Map article tint to CyberTag color
const tintToColor = (tint: TintColor) => {
  switch (tint) {
    case 'green': return 'green' as const
    case 'cyan': return 'cyan' as const
    case 'magenta': return 'magenta' as const
    case 'orange': return 'orange' as const
    case 'red': return 'red' as const
    default: return 'green' as const
  }
}

interface ArticleTeaserViewProps {
  article: Article
}

export function ArticleTeaserView({ article }: ArticleTeaserViewProps) {
  const pathname = usePathname()
  const tint = getTintClasses(article.topic.tint)

  const handleLogin = () => {
    const returnTo = encodeURIComponent(pathname)
    window.location.href = `/api/auth/discord?returnTo=${returnTo}`
  }

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Background atmospheric effects - shifted to magenta for locked state */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 100% 50% at 0% 0%, rgba(255,0,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 100% 100%, rgba(255,50,100,0.06) 0%, transparent 40%),
            radial-gradient(ellipse 60% 30% at 50% 50%, rgba(255,0,255,0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.alt}
            fill
            className="object-cover"
            priority
            unoptimized={article.heroImage.url.endsWith('.svg')}
          />

          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-void/20" />
          <div className="absolute inset-0 bg-linear-to-r from-void/50 via-transparent to-void/30" />
          <div className="absolute inset-0 bg-linear-to-b from-void/60 via-transparent to-transparent h-40" />

          {/* Scanline overlay - magenta tint */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,255,0.02)_2px,rgba(255,0,255,0.02)_4px)] pointer-events-none" />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(3,3,3,0.4) 100%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-12">
          <div className="max-w-4xl">
            {/* Topic badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              <CyberTag color={tintToColor(article.topic.tint)} className={cn('text-sm', tint.text)}>
                {article.topic.name}
              </CyberTag>
              {article.games.map((game) => (
                <CyberTag key={game.id} color="gray" className="text-sm text-rga-gray">
                  {game.name}
                </CyberTag>
              ))}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
                <HeroGlitch
                  minInterval={4}
                  maxInterval={10}
                  intensity={8}
                  dataCorruption
                  scanlines
                >
                  <span className="text-white">{article.title}</span>
                </HeroGlitch>
              </h1>
            </motion.div>

            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 text-sm text-rga-gray/60"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatArticleDate(article.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readingTime} min read</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom edge glow line - magenta for locked state */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-rga-magenta to-transparent opacity-40"
        />
      </section>

      {/* Teaser Content */}
      <main className="relative z-10 bg-void">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Perex/excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-12"
            >
              <p className="text-lg md:text-xl text-rga-gray leading-relaxed">
                {article.perex}
              </p>
            </motion.div>

            {/* Classified Intel Login Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <CyberCorners color="magenta" size="md" glow>
                <div className="relative border border-rga-magenta/30 bg-bg-elevated/80 backdrop-blur-sm p-8 overflow-hidden">
                  {/* Animated scan line effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute inset-x-0 h-[2px] bg-linear-to-r from-transparent via-rga-magenta/40 to-transparent"
                      initial={{ top: '-2px' }}
                      animate={{ top: '100%' }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </div>

                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,0,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,0,255,0.5) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Content wrapper */}
                  <div className="relative z-10 text-center">
                    {/* Classification header */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="flex items-center justify-center gap-3 mb-6"
                    >
                      <div className="h-px flex-1 max-w-[60px] bg-linear-to-r from-transparent to-rga-magenta/50" />
                      <span className="font-mono text-[10px] tracking-[0.3em] text-rga-magenta/70 uppercase">
                        Restricted Access
                      </span>
                      <div className="h-px flex-1 max-w-[60px] bg-linear-to-l from-transparent to-rga-magenta/50" />
                    </motion.div>

                    {/* Security Terminal Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        {/* Outer pulsing ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-rga-magenta/30"
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.4, opacity: 0 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                          style={{ width: '72px', height: '72px', margin: '-4px' }}
                        />
                        {/* Main icon container */}
                        <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-rga-magenta/20 to-rga-magenta/5 border border-rga-magenta/40 flex items-center justify-center">
                          {/* Inner glow */}
                          <div className="absolute inset-2 rounded-full bg-rga-magenta/10 blur-sm" />
                          {/* Shield icon with fingerprint */}
                          <div className="relative">
                            <Shield className="w-7 h-7 text-rga-magenta" />
                            <Fingerprint className="absolute -bottom-1 -right-1 w-4 h-4 text-rga-magenta/70" />
                          </div>
                        </div>
                        {/* Corner indicators */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-rga-magenta/60" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-rga-magenta/60" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-rga-magenta/60" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-rga-magenta/60" />
                      </div>
                    </div>

                    {/* Title with glitch */}
                    <h2 className="font-display text-2xl md:text-3xl text-white mb-2">
                      <HeroGlitch
                        minInterval={4}
                        maxInterval={8}
                        intensity={6}
                      >
                        CLASSIFIED INTEL
                      </HeroGlitch>
                    </h2>

                    {/* Classification code */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="font-mono text-[10px] text-rga-magenta/50 tracking-widest mb-4"
                    >
                      [CLEARANCE: DISCORD MEMBER]
                    </motion.div>

                    {/* Description */}
                    <p className="text-rga-gray mb-8 max-w-md mx-auto leading-relaxed">
                      This intelligence briefing is restricted to verified Rogue Army operatives.
                      Join our Discord server and authenticate to decrypt contents.
                    </p>

                    {/* Login Button */}
                    <button
                      onClick={handleLogin}
                      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-rga-magenta/10 border border-rga-magenta/50 hover:border-rga-magenta hover:bg-rga-magenta/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,0,255,0.25)]"
                    >
                      {/* Scan effect on hover */}
                      <span className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-rga-magenta/60 to-transparent animate-scan" />
                      </span>

                      {/* Inner glow on hover */}
                      <span className="absolute inset-0 bg-linear-to-b from-rga-magenta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <DiscordIcon className="relative w-5 h-5 text-rga-magenta group-hover:drop-shadow-[0_0_8px_rgba(255,0,255,0.6)] transition-all duration-300" />
                      <span className="relative font-mono text-white tracking-wide uppercase text-sm">
                        Authenticate
                      </span>

                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-rga-magenta/50 group-hover:border-rga-magenta group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-rga-magenta/50 group-hover:border-rga-magenta group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-rga-magenta/50 group-hover:border-rga-magenta group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-rga-magenta/50 group-hover:border-rga-magenta group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                    </button>

                    {/* Join Discord link */}
                    <p className="text-rga-gray/50 text-sm mt-6">
                      Not in our Discord yet?{' '}
                      <a
                        href="https://dc.roguearmy.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rga-magenta/80 hover:text-rga-magenta underline underline-offset-2 transition-colors"
                      >
                        Join the Rogue Army
                      </a>
                    </p>

                    {/* Bottom status line */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-rga-magenta/10"
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-rga-magenta"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="font-mono text-[10px] text-rga-gray/40 tracking-wider uppercase">
                        Awaiting authentication
                      </span>
                    </motion.div>
                  </div>
                </div>
              </CyberCorners>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom fade */}
      <div className="h-32 bg-linear-to-t from-void to-transparent" />
    </div>
  )
}
