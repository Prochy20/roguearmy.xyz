import Link from 'next/link'
import { BoosterPerksWidget } from '@/components/division2/briefings/BoosterPerksWidget'
import { BriefingCard } from '@/components/division2/briefings/BriefingCard'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { PanelHeader } from '@/components/division2/landing/PanelHeader'
import {
  formatDayShort,
  normalizeDayIso,
} from '@/lib/division2/format'
import type { Briefing } from '@/lib/division2/briefing.server'
import type { Division2 } from '@/payload-types'

type BriefingsPerks = NonNullable<NonNullable<Division2['briefingsPage']>['perks']>

interface BriefingPanelProps {
  briefing: Briefing
  /**
   * Latest daily briefings. Populated only for boosters/staff/dev; null for
   * plain members (the perks widget renders in that slot instead).
   */
  dailies: Briefing[] | null
  /** True when the viewer can see the daily briefings. */
  hasAccess: boolean
  /** Booster perks copy from the briefings page CMS — used for non-boosters. */
  perks: BriefingsPerks | null | undefined
}

/**
 * Compact preview of the latest weekly briefing. Title + period + highlights
 * bullets. Deliberately drops the editorial banner image and metadata
 * footer — those live on the briefing detail page. This widget exists to
 * answer: "what does this week's briefing cover?"
 */
export function BriefingPanel({
  briefing,
  dailies,
  hasAccess,
  perks,
}: BriefingPanelProps) {
  const start = normalizeDayIso(briefing.periodStart)
  const end = normalizeDayIso(briefing.periodEnd)
  const period = `${formatDayShort(start)} → ${formatDayShort(end)}`
  const highlights = (briefing.highlights ?? []).slice(0, 4)
  const dailyItems = (dailies ?? []).slice(0, 3)
  const showDailies = hasAccess && dailyItems.length > 0
  const showPerks = !hasAccess

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h2
          className="font-display uppercase leading-[0.9] tracking-[0.005em] text-balance"
          style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
        >
          <span className="text-text-primary">WEEKLY </span>
          <span
            className="text-rga-cyan"
            style={{
              textShadow:
                '0 0 24px rgba(0,255,255,0.32), 0 0 56px rgba(0,255,255,0.14)',
            }}
          >
            BRIEFING
          </span>
        </h2>
        <PanelHeader
          code="SEC_03"
          label="// LATEST · WEEKLY BRIEFING"
          meta={period}
          cta={{
            href: '/division-2/briefings',
            label: 'ALL BRIEFINGS →',
          }}
          accent="cyan"
        />
      </div>
      <CyberCorners color="cyan" size="md">
        <div className="flex flex-col gap-5 border border-rga-cyan/20 bg-[rgba(0,0,0,0.5)] p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.3em]">
            <span className="text-rga-cyan">▸ @ASHLEY · BRIEFING</span>
            {typeof briefing.articleCount === 'number' && briefing.articleCount > 0 && (
              <span className="text-text-muted tabular-nums">
                {briefing.articleCount} SOURCES
              </span>
            )}
          </div>

          <Link href={briefing.canonicalPath} className="group/title block">
            <h3
              className="font-display text-2xl uppercase leading-[1.05] text-text-primary transition-colors group-hover/title:text-rga-cyan sm:text-3xl"
              style={{ textShadow: '0 0 18px rgba(0,255,255,0.18)' }}
            >
              {briefing.title}
            </h3>
          </Link>

          {briefing.perex && (
            <p className="line-clamp-3 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {briefing.perex}
            </p>
          )}

          {highlights.length > 0 && (
            <ul className="flex flex-col gap-2.5 border-t border-rga-cyan/15 pt-4">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[14px_minmax(0,1fr)] gap-3 text-sm leading-relaxed text-text-secondary"
                >
                  <span
                    aria-hidden
                    className="pt-[5px] font-mono text-[10px] leading-none text-rga-cyan"
                  >
                    ▸
                  </span>
                  <span className="line-clamp-2">{h}</span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={briefing.canonicalPath}
            className="self-end font-mono text-[10px] uppercase tracking-[0.3em] text-rga-cyan transition-colors hover:text-text-primary"
          >
            OPEN BRIEFING →
          </Link>
        </div>
      </CyberCorners>

      {showDailies && (
        <div className="flex flex-col gap-4 pt-2 sm:gap-5">
          <SubsectionHeader
            label="// DAILY BRIEFINGS"
            cta={{ href: '/division-2/briefings', label: 'ALL BRIEFINGS →' }}
            accent="mod"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {dailyItems.map((d) => (
              <BriefingCard key={d.id} briefing={d} />
            ))}
          </div>
        </div>
      )}

      {showPerks && (
        <div className="flex flex-col gap-4 pt-2 sm:gap-5">
          <SubsectionHeader
            label="// DAILY BRIEFINGS"
            meta="// BOOSTER PERK"
            accent="magenta"
          />
          <BoosterPerksWidget perks={perks ?? null} />
        </div>
      )}
    </section>
  )
}

function SubsectionHeader({
  label,
  meta,
  cta,
  accent,
}: {
  label: string
  meta?: string
  cta?: { href: string; label: string }
  accent: 'mod' | 'magenta'
}) {
  const accentClass =
    accent === 'mod' ? 'text-game-d2' : 'text-tier-booster'
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
      <span className={`font-mono text-[10px] tracking-[0.32em] ${accentClass}`}>
        {label}
      </span>
      {cta ? (
        <Link
          href={cta.href}
          className={`font-mono text-[10px] uppercase tracking-[0.3em] ${accentClass} transition-colors hover:text-text-primary`}
        >
          {cta.label}
        </Link>
      ) : meta ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted/80">
          {meta}
        </span>
      ) : null}
    </div>
  )
}

