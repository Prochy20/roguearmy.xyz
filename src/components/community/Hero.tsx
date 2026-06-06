import type { AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { CyberButton } from '@/components/ui/CyberButton'
import { DiscordIcon } from '@/components/ui/DiscordIcon'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { RGA_ROOT } from '@/components/ui/trail-roots'
import { HeroGlitch } from '@/components/effects/HeroGlitch'

type CommunityStats = components['schemas']['CommunityStatsDto']

interface HeroProps {
  stats: AshleyResult<CommunityStats>
}

const DISCORD_INVITE = 'https://dc.roguearmy.xyz'

const COPY = {
  kicker: '// CASUAL GAMING · ADULTS · SA · UK · EU',
  preLine: 'WE ARE',
  postLine: 'OPERATIVES',
  fallbackCount: '∞',
  subline:
    'A casual gaming community for adults across South Africa, the UK, and Europe — together since 2019. No drama, no skill gates, no engagement metrics. Life’s stressful enough — your gaming shouldn’t be.',
  primaryCta: { label: 'ENLIST · DISCORD', href: DISCORD_INVITE },
  secondaryCta: { label: 'SEE THE NUMBERS', href: '#sec-01' },
} as const

export function Hero({ stats }: HeroProps) {
  return (
    <>
      {/* Page chrome — at <lg inline, from lg+ sticks at MENU's vertical
          center. The community Hero used to host the SnapshotRibbon as the
          first item in its flex column; now the ribbon lives in this
          page-level sticky wrapper so it stays in view while the hero scrolls
          away. Trail: RGA › Community. */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-32 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <SnapshotRibbon stats={stats} />
      </div>

      <section
        className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] px-4 pt-7 pb-20 sm:px-8 sm:pt-9 sm:pb-28 lg:px-16 lg:pt-10 lg:pb-36"
        aria-labelledby="community-hero-headline"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 60% 45% at 20% 30%, rgba(0,255,65,0.08) 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 85% 75%, rgba(0,255,255,0.06) 0%, transparent 50%)
            `,
          }}
        />

        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 sm:gap-10">
          <div className="flex min-w-0 flex-col gap-7">
            {/* Brand tagline kicker stays — it's identity copy, not location.
                Demoted from text-rga-green to muted to defer to the trail. */}
            <div className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
              {COPY.kicker}
            </div>

            <h1
              id="community-hero-headline"
              className="font-display uppercase leading-[0.85] tracking-[0.005em] text-balance break-words"
              style={{ fontSize: 'clamp(48px, 9vw, 144px)' }}
            >
              <HeroGlitch
                className="block"
                minInterval={4}
                maxInterval={10}
                intensity={8}
                dataCorruption
                scanlines
              >
                <span className="text-text-primary">{COPY.preLine}</span>
              </HeroGlitch>
              <HeroGlitch
                className="block"
                minInterval={5}
                maxInterval={12}
                intensity={6}
                dataCorruption={false}
                colors={['#00ff41', '#00ffff']}
              >
                <span
                  className="text-rga-green"
                  style={{ textShadow: '0 0 36px rgba(0,255,65,0.45), 0 0 80px rgba(0,255,65,0.18)' }}
                >
                  {stats.ok ? stats.data.totalMembers.toLocaleString() : COPY.fallbackCount}
                </span>
              </HeroGlitch>
              <HeroGlitch
                className="block"
                minInterval={6}
                maxInterval={14}
                intensity={7}
                dataCorruption
                scanlines
              >
                <span className="text-text-primary">{COPY.postLine}</span>
              </HeroGlitch>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {COPY.subline}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-6">
              <CyberButton
                href={COPY.primaryCta.href}
                external
                color="green"
                iconLeft={<DiscordIcon className="h-4 w-4" />}
                className="px-6 py-4"
              >
                {COPY.primaryCta.label}
              </CyberButton>
              <a
                href={COPY.secondaryCta.href}
                className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted underline-offset-4 transition-colors duration-200 hover:text-rga-cyan hover:underline"
              >
                {COPY.secondaryCta.label} ↓
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SnapshotRibbon({ stats }: { stats: AshleyResult<CommunityStats> }) {
  const totalMembers = stats.ok ? stats.data.totalMembers : null
  const joinedLast14d = stats.ok ? stats.data.joinedLast14d : null
  const generatedAt = stats.ok ? stats.data.generatedAt : null

  return (
    <StatRibbon
      trail={[RGA_ROOT, { label: 'Community' }]}
      fields={[
        { label: 'MEMBERS', value: formatNumber(totalMembers) },
        { label: 'JOINED · 14D', value: formatNumber(joinedLast14d), accent: 'cyan' },
        { label: 'TAKEN', value: formatTime(generatedAt) },
      ]}
      pill={
        stats.ok
          ? { text: 'LIVE', mode: 'info' }
          : { text: 'OFFLINE', mode: 'error' }
      }
    />
  )
}

function formatNumber(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} UTC`
}
