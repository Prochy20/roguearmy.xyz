import type { AshleyResult } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import type { CommunityPage } from '@/payload-types'
import { SectionHeader } from './SectionHeader'
import { StatCounter } from './StatCounter'
import { FailNote } from './FailNote'

type CommunityStats = components['schemas']['CommunityStatsDto']
type Tone = 'green' | 'cyan' | 'magenta'

interface StatsSectionProps {
  stats: AshleyResult<CommunityStats>
  content: CommunityPage['stats']
}

const TONE_CLASS: Record<Tone, string> = {
  green: 'text-rga-green border-rga-green/40 [text-shadow:0_0_18px_rgba(0,255,65,0.45)]',
  cyan: 'text-rga-cyan border-rga-cyan/40 [text-shadow:0_0_18px_rgba(0,255,255,0.45)]',
  magenta: 'text-rga-magenta border-rga-magenta/40 [text-shadow:0_0_18px_rgba(255,0,255,0.45)]',
}

const CELL_TONE: Record<Tone, string> = {
  green: 'text-rga-green [text-shadow:0_0_24px_rgba(0,255,65,0.55)]',
  cyan: 'text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.55)]',
  magenta: 'text-rga-magenta [text-shadow:0_0_24px_rgba(255,0,255,0.55)]',
}

export function StatsSection({ stats, content }: StatsSectionProps) {
  const kicker = stats.ok
    ? (content?.kickerLive ?? '// SNAPSHOT {time}').replace('{time}', formatTime(stats.data.generatedAt))
    : (content?.kickerOffline ?? '// SNAPSHOT UNAVAILABLE')

  return (
    <section
      id="sec-01"
      className="relative px-4 py-24 sm:px-8 sm:py-32 lg:px-16 lg:py-36"
      aria-labelledby="community-stats-heading"
    >
      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader
          num={content?.sectionNum ?? '01'}
          eyebrow={content?.sectionEyebrow ?? 'LIVE METRICS'}
          kicker={kicker}
          title={content?.sectionTitle ?? 'BY THE NUMBERS'}
        />

        {!stats.ok ? (
          <FailNote error={stats.error} resource="STATS" />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-10">
            <StatCell
              label={content?.statLabelMembers ?? 'OPERATIVES'}
              value={stats.data.totalMembers}
              tone="green"
              compact
            />
            <StatCell
              label={content?.statLabelJoined14d ?? 'JOINED · LAST 14 DAYS'}
              value={stats.data.joinedLast14d}
              tone="cyan"
              compact
            />
            <StatCell
              label={content?.statLabelVoice ?? 'MINUTES IN VOICE'}
              value={stats.data.totalVoiceMinutes}
              tone="green"
              compact
            />
            <StatCell
              label={content?.statLabelMessages ?? 'CHAT MESSAGES'}
              value={stats.data.totalMessages}
              tone="magenta"
              compact
            />
          </div>
        )}

        {(content?.commitmentsLabel || (content?.commitments && content.commitments.length > 0)) && (
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-10">
            {content?.commitmentsLabel && (
              <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
                {content.commitmentsLabel}
              </span>
            )}
            {content?.commitments && content.commitments.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-3">
                {content.commitments.map((c) => (
                  <li
                    key={c.id ?? c.label}
                    className={`border bg-[rgba(0,0,0,0.4)] px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase ${TONE_CLASS[c.tone]}`}
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
  tone: Tone
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
