import type { AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { SectionHeader } from './SectionHeader'
import { StatCounter } from './StatCounter'
import { FailNote } from './FailNote'

type CommunityStats = components['schemas']['CommunityStatsDto']

interface StatsSectionProps {
  stats: AshleyResult<CommunityStats>
}

const STAT_LABELS = {
  members: 'OPERATIVES',
  joined14d: 'JOINED · LAST 14 DAYS',
  voice: 'MINUTES IN VOICE',
  messages: 'CHAT MESSAGES',
} as const

const COMMITMENTS = [
  { label: '$0 · FOREVER', tone: 'green' as const },
  { label: '0 ADS · 0 DATA SOLD', tone: 'cyan' as const },
  { label: 'VOLUNTEER-RUN', tone: 'magenta' as const },
] as const

const TONE_CLASS: Record<'green' | 'cyan' | 'magenta', string> = {
  green: 'text-rga-green border-rga-green/40 [text-shadow:0_0_18px_rgba(0,255,65,0.45)]',
  cyan: 'text-rga-cyan border-rga-cyan/40 [text-shadow:0_0_18px_rgba(0,255,255,0.45)]',
  magenta:
    'text-rga-magenta border-rga-magenta/40 [text-shadow:0_0_18px_rgba(255,0,255,0.45)]',
}

const CELL_TONE: Record<'green' | 'cyan' | 'magenta', string> = {
  green: 'text-rga-green [text-shadow:0_0_24px_rgba(0,255,65,0.55)]',
  cyan: 'text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.55)]',
  magenta: 'text-rga-magenta [text-shadow:0_0_24px_rgba(255,0,255,0.55)]',
}

export function StatsSection({ stats }: StatsSectionProps) {
  const kicker = stats.ok
    ? `// SNAPSHOT ${formatTime(stats.data.generatedAt)}`
    : '// SNAPSHOT UNAVAILABLE'

  return (
    <section
      id="sec-01"
      className="relative px-4 py-24 sm:px-8 sm:py-32 lg:px-16 lg:py-36"
      aria-labelledby="community-stats-heading"
    >
      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader num="01" eyebrow="LIVE METRICS" kicker={kicker} title="BY THE NUMBERS" />

        {!stats.ok ? (
          <FailNote error={stats.error} resource="STATS" />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-10">
            <StatCell
              label={STAT_LABELS.members}
              value={stats.data.totalMembers}
              tone="green"
              compact
            />
            <StatCell
              label={STAT_LABELS.joined14d}
              value={stats.data.joinedLast14d}
              tone="cyan"
              compact
            />
            <StatCell
              label={STAT_LABELS.voice}
              value={stats.data.totalVoiceMinutes}
              tone="green"
              compact
            />
            <StatCell
              label={STAT_LABELS.messages}
              value={stats.data.totalMessages}
              tone="magenta"
              compact
            />
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-10">
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
            // STANDING COMMITMENTS
          </span>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {COMMITMENTS.map((c) => (
              <li
                key={c.label}
                className={`border bg-[rgba(0,0,0,0.4)] px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase ${TONE_CLASS[c.tone]}`}
              >
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function StatCell({
  label,
  value,
  tone,
  locale,
  compact,
}: {
  label: string
  value: number
  tone: 'green' | 'cyan' | 'magenta'
  locale?: boolean
  compact?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 border-l border-[rgba(255,255,255,0.08)] pl-5 sm:pl-6">
      <div
        className={`font-display tabular-nums leading-none tracking-tight ${CELL_TONE[tone]}`}
        style={{ fontSize: 'clamp(32px, 4.2vw, 64px)' }}
      >
        <StatCounter value={value} locale={locale} compact={compact} />
      </div>
      <div className="font-mono text-[10px] tracking-[0.35em] text-text-muted uppercase">
        {label}
      </div>
    </div>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '— · ——'
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} UTC`
}
