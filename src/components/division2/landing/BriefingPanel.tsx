import Link from 'next/link'
import { BoosterPerksWidget } from '@/components/division2/digest/BoosterPerksWidget'
import { DigestCard } from '@/components/division2/digest/DigestCard'
import { CyberCorners } from '@/components/ui/CyberCorners'
import {
  formatDayShort,
  normalizeDayIso,
} from '@/lib/division2/format'
import type { Digest } from '@/lib/division2/digest.server'
import type { Division2 } from '@/payload-types'

type DigestPerks = NonNullable<NonNullable<Division2['digestPage']>['perks']>

interface BriefingPanelProps {
  digest: Digest
  /**
   * Latest daily briefings. Populated only for boosters/staff/dev; null for
   * plain members (the perks widget renders in that slot instead).
   */
  dailies: Digest[] | null
  /** True when the viewer can see the daily briefings. */
  hasAccess: boolean
  /** Booster perks copy from the digest page CMS — used for non-boosters. */
  perks: DigestPerks | null | undefined
}

/**
 * Compact preview of the latest weekly digest. Title + period + highlights
 * bullets. Deliberately drops the editorial banner image and metadata
 * footer — those live on the digest detail page. This widget exists to
 * answer: "what does this week's briefing cover?"
 */
export function BriefingPanel({
  digest,
  dailies,
  hasAccess,
  perks,
}: BriefingPanelProps) {
  const start = normalizeDayIso(digest.periodStart)
  const end = normalizeDayIso(digest.periodEnd)
  const period = `${formatDayShort(start)} → ${formatDayShort(end)}`
  const highlights = (digest.highlights ?? []).slice(0, 4)
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
            href: `/division-2/digest/${digest.id}`,
            label: 'READ FULL BRIEFING →',
          }}
        />
      </div>
      <CyberCorners color="cyan" size="md">
        <div className="flex flex-col gap-5 border border-rga-cyan/20 bg-[rgba(0,0,0,0.5)] p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.3em]">
            <span className="text-rga-cyan">▸ @ASHLEY · BRIEFING</span>
            {typeof digest.articleCount === 'number' && digest.articleCount > 0 && (
              <span className="text-text-muted tabular-nums">
                {digest.articleCount} SOURCES
              </span>
            )}
          </div>

          <h3
            className="font-display text-2xl uppercase leading-[1.05] text-text-primary sm:text-3xl"
            style={{ textShadow: '0 0 18px rgba(0,255,255,0.18)' }}
          >
            {digest.title}
          </h3>

          {digest.perex && (
            <p className="line-clamp-3 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {digest.perex}
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
        </div>
      </CyberCorners>

      {showDailies && (
        <div className="flex flex-col gap-4 pt-2 sm:gap-5">
          <SubsectionHeader
            label="// DAILY BRIEFINGS"
            meta={`${String(dailyItems.length).padStart(2, '0')} FILES`}
            accent="mod"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {dailyItems.map((d) => (
              <DigestCard key={d.id} digest={d} />
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
  accent,
}: {
  label: string
  meta?: string
  accent: 'mod' | 'magenta'
}) {
  const accentClass =
    accent === 'mod' ? 'text-rga-mod' : 'text-rga-magenta'
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
      <span className={`font-mono text-[10px] tracking-[0.32em] ${accentClass}`}>
        {label}
      </span>
      {meta && (
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted/80">
          {meta}
        </span>
      )}
    </div>
  )
}

function PanelHeader({
  code,
  label,
  meta,
  cta,
}: {
  code: string
  label: string
  meta?: string
  cta: { href: string; label: string }
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
      <div className="flex flex-wrap items-baseline gap-3 font-mono">
        <span className="text-[10px] tracking-[0.4em] text-rga-cyan">
          {code}
        </span>
        <span className="text-[10px] tracking-[0.3em] text-text-muted">
          {label}
        </span>
        {meta && (
          <span className="text-[9px] tracking-[0.3em] text-text-muted/70">
            {meta}
          </span>
        )}
      </div>
      <Link
        href={cta.href}
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-rga-cyan transition-colors hover:text-text-primary"
      >
        {cta.label}
      </Link>
    </header>
  )
}
