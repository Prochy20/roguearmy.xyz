import type { AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { CyberButton } from '@/components/members/CyberButton'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

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
    <section
      className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] px-4 pt-20 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:px-16 lg:pt-32 lg:pb-36"
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
        <SnapshotRibbon stats={stats} />

        <div className="flex min-w-0 flex-col gap-7">
          <div className="font-mono text-[11px] tracking-[0.35em] text-rga-green uppercase">
            {COPY.kicker}
          </div>

          <h1
            id="community-hero-headline"
            className="font-display uppercase leading-[0.85] tracking-[0.005em] text-balance break-words"
            style={{ fontSize: 'clamp(48px, 9vw, 144px)' }}
          >
            <span className="block text-text-primary">{COPY.preLine}</span>
            <span
              className="block text-rga-green"
              style={{ textShadow: '0 0 36px rgba(0,255,65,0.45), 0 0 80px rgba(0,255,65,0.18)' }}
            >
              {stats.ok ? stats.data.totalMembers.toLocaleString() : COPY.fallbackCount}
            </span>
            <span className="block text-text-primary">{COPY.postLine}</span>
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
  )
}

function SnapshotRibbon({ stats }: { stats: AshleyResult<CommunityStats> }) {
  const totalMembers = stats.ok ? stats.data.totalMembers : null
  const joinedLast14d = stats.ok ? stats.data.joinedLast14d : null
  const generatedAt = stats.ok ? stats.data.generatedAt : null

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm">
      <span className="text-text-secondary">// SNAPSHOT</span>
      <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
      <RibbonField label="MEMBERS" value={formatNumber(totalMembers)} accent="green" />
      <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
      <RibbonField label="JOINED · 14D" value={formatNumber(joinedLast14d)} accent="cyan" />
      <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
      <RibbonField label="TAKEN" value={formatTime(generatedAt)} />
      <span className="ml-auto" />
      <StatusPill ok={stats.ok} />
    </div>
  )
}

function RibbonField({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'green' | 'cyan'
}) {
  const colorClass =
    accent === 'green'
      ? 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
      : accent === 'cyan'
        ? 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.5)]'
        : 'text-text-primary'

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-text-muted">{label}</span>
      <span className={`tabular-nums ${colorClass}`}>{value}</span>
    </span>
  )
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${ok ? 'text-rga-green' : 'text-rga-magenta'}`}
    >
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-[1px] ${
          ok
            ? 'bg-rga-green shadow-[0_0_8px_#00FF41] animate-pulse'
            : 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]'
        }`}
      />
      {ok ? 'LIVE' : 'OFFLINE'}
    </span>
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
