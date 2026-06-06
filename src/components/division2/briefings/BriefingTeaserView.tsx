'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { Shield, Fingerprint } from 'lucide-react'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/ui/DiscordIcon'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { D2_ROOT, BRIEFINGS_ROOT } from '@/components/ui/trail-roots'
import { ReaderTitleBlock } from '@/components/content/reader/ReaderTitleBlock'
import { ReaderHeroFrame } from '@/components/content/reader/ReaderHeroFrame'
import { ReaderActions } from '@/components/content/reader/ReaderActions'
import { formatDayShort } from '@/lib/division2/format'
import { frequencyAccent } from './accent-briefing'
import type { Briefing } from '@/lib/division2/briefing.server'

interface BriefingTeaserViewProps {
  briefing: Briefing
  /** Short doc designator like `WK17_2026` or `D_2026-04-21`. */
  designator: string
  /** Pre-formatted period label, e.g. "MAY 19 → MAY 25" or "MAY 19". */
  periodLabel: string
  /** Pre-formatted byline-row date, e.g. "WEEK OF MAY 19" or "MAY 19". */
  dateLabel: string
  /** Read time in minutes for the title block — clamped to >= 1 upstream. */
  readMinutes: number
}

/**
 * Anonymous-only render for the briefing detail page.
 *
 * Composes the same Reader header primitives the full `BriefingDetailPage`
 * uses so the layout reads identical to logged-in viewers up to the byline.
 * Below the hero, the body is replaced with a magenta "CLASSIFIED INTEL"
 * Discord auth card mirroring `ArticleTeaserView`. The outer
 * `briefing-locked-body` class is the CSS selector the page's JSON-LD
 * `hasPart` block points at to signal the paywall boundary to crawlers.
 */
export function BriefingTeaserView({
  briefing,
  designator,
  periodLabel,
  dateLabel,
  readMinutes,
}: BriefingTeaserViewProps) {
  const pathname = usePathname()
  const accent = frequencyAccent(briefing.frequency)
  // Chrome stays RGA-neutral. Weekly briefings tint the leaf cyan as an
  // Ashley-output marker; daily falls back to neutral white. Fields stay
  // uncolored. Body content below keeps its frequency-driven orange.
  const leafAccent: 'cyan' | undefined = accent === 'cyan' ? 'cyan' : undefined
  const updatedShort = briefing.updatedAt.slice(0, 10)
  const fileNumber = `IMG_${briefing.id.replace(/-/g, '').slice(-4).toUpperCase()}`

  const handleLogin = () => {
    const returnTo = encodeURIComponent(pathname)
    window.location.href = `/api/auth/discord?returnTo=${returnTo}`
  }

  return (
    <div className="relative">
      {/* Page chrome — mirrors the ReaderPageShell stickyChrome slot used by
          BriefingDetailPage. Lives OUTSIDE the max-w-[1080px] content column
          so at lg+ its right edge can reach MENU's left bracket. At <lg the
          ribbon renders inline (no stick) to save vertical space. */}
      <div className="mx-auto w-full max-w-[1080px] mt-20 sm:mt-24 lg:mt-28 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-12 lg:pr-[140px]">
        <StatRibbon
          trail={[
            D2_ROOT,
            BRIEFINGS_ROOT,
            { label: `${designator}.md`, accent: leafAccent },
          ]}
          fields={[
            {
              label: 'FREQ',
              value: briefing.frequency.toUpperCase(),
            },
            { label: 'PERIOD', value: periodLabel },
            {
              label: 'SOURCES',
              value: briefing.articleCount.toString(),
            },
            {
              label: 'UPDATED',
              value: /^\d{4}-\d{2}-\d{2}$/.test(updatedShort)
                ? formatDayShort(updatedShort)
                : '—',
            },
          ]}
          pill={{
            // Locked-out viewer — pill names the tier needed to unlock.
            // `booster` (magenta) for daily-tier gates, `error` (rose)
            // for member-tier gates. Booster overrides the generic error
            // because tier identification is the more useful signal here.
            text: briefing.frequency === 'daily' ? 'BOOSTER' : 'MEMBER',
            mode: briefing.frequency === 'daily' ? 'booster' : 'error',
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1080px] px-4 pb-24 sm:px-8 sm:pb-28 lg:px-12 lg:pb-36">
      <div className="flex flex-col gap-7 sm:gap-9 lg:gap-10 pt-7 sm:pt-9 lg:pt-10">
        <ReaderTitleBlock
          accent={accent}
          title={briefing.title}
          perex={briefing.perex}
          dateLabel={dateLabel}
          readMinutes={readMinutes}
          actions={<ReaderActions accent={accent} />}
        />
        <ReaderHeroFrame
          accent={accent}
          thumbnailUrl={briefing.thumbnailUrl}
          kindLabel={briefing.frequency.toUpperCase()}
          periodLabel={periodLabel}
          bylineLabel="// AI · ASHLEY"
          fileNumber={fileNumber}
        />
      </div>

      <div className="briefing-locked-body mt-12 sm:mt-14 lg:mt-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CyberCorners color="magenta" size="md" glow>
              <div className="relative overflow-hidden border border-rga-magenta/30 bg-bg-elevated/80 p-8 backdrop-blur-sm">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,0,255,0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,0,255,0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-6 flex items-center justify-center gap-3"
                  >
                    <div className="h-px max-w-[60px] flex-1 bg-linear-to-r from-transparent to-rga-magenta/50" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-rga-magenta/70">
                      Restricted Access
                    </span>
                    <div className="h-px max-w-[60px] flex-1 bg-linear-to-l from-transparent to-rga-magenta/50" />
                  </motion.div>

                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-rga-magenta/30"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        style={{ width: '72px', height: '72px', margin: '-4px' }}
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-rga-magenta/40 bg-linear-to-br from-rga-magenta/20 to-rga-magenta/5">
                        <div className="absolute inset-2 rounded-full bg-rga-magenta/10 blur-sm" />
                        <div className="relative">
                          <Shield className="h-7 w-7 text-rga-magenta" />
                          <Fingerprint className="absolute -bottom-1 -right-1 h-4 w-4 text-rga-magenta/70" />
                        </div>
                      </div>
                      <div className="absolute -left-1 -top-1 h-2 w-2 border-l border-t border-rga-magenta/60" />
                      <div className="absolute -right-1 -top-1 h-2 w-2 border-r border-t border-rga-magenta/60" />
                      <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b border-l border-rga-magenta/60" />
                      <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-rga-magenta/60" />
                    </div>
                  </div>

                  <h2 className="mb-2 font-display text-2xl text-white md:text-3xl">
                    <HeroGlitch minInterval={4} maxInterval={8} intensity={6}>
                      CLASSIFIED INTEL
                    </HeroGlitch>
                  </h2>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-4 font-mono text-[10px] tracking-widest text-rga-magenta/50"
                  >
                    [CLEARANCE: DISCORD MEMBER]
                  </motion.div>

                  <p className="mx-auto mb-8 max-w-md leading-relaxed text-text-secondary">
                    This Division 2 briefing is restricted to verified Rogue Army operatives.
                    Join our Discord server and authenticate to decrypt contents.
                  </p>

                  <button
                    onClick={handleLogin}
                    type="button"
                    className="group relative inline-flex items-center justify-center gap-3 border border-rga-magenta/50 bg-rga-magenta/10 px-8 py-4 transition-all duration-300 hover:border-rga-magenta hover:bg-rga-magenta/20 hover:shadow-[0_0_40px_rgba(255,0,255,0.25)]"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="absolute inset-x-0 h-px animate-scan bg-linear-to-r from-transparent via-rga-magenta/60 to-transparent" />
                    </span>
                    <span className="absolute inset-0 bg-linear-to-b from-rga-magenta/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <DiscordIcon className="relative h-5 w-5 text-rga-magenta transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" />
                    <span className="relative font-mono text-sm uppercase tracking-wide text-white">
                      Authenticate
                    </span>

                    <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-rga-magenta/50 transition-all duration-300 group-hover:h-4 group-hover:w-4 group-hover:border-rga-magenta" />
                    <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-rga-magenta/50 transition-all duration-300 group-hover:h-4 group-hover:w-4 group-hover:border-rga-magenta" />
                    <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-rga-magenta/50 transition-all duration-300 group-hover:h-4 group-hover:w-4 group-hover:border-rga-magenta" />
                    <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-rga-magenta/50 transition-all duration-300 group-hover:h-4 group-hover:w-4 group-hover:border-rga-magenta" />
                  </button>

                  <p className="mt-6 text-sm text-text-secondary/50">
                    Not in our Discord yet?{' '}
                    <a
                      href="https://dc.roguearmy.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rga-magenta/80 underline underline-offset-2 transition-colors hover:text-rga-magenta"
                    >
                      Join the Rogue Army
                    </a>
                  </p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-8 flex items-center justify-center gap-2 border-t border-rga-magenta/10 pt-6"
                  >
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-rga-magenta"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary/40">
                      Awaiting authentication
                    </span>
                  </motion.div>
                </div>
              </div>
            </CyberCorners>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  )
}
