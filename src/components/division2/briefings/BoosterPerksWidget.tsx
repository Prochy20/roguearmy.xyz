import { CyberButton } from '@/components/ui/CyberButton'
import type { Division2 } from '@/payload-types'

type BriefingsPerks = NonNullable<NonNullable<Division2['briefingsPage']>['perks']>

interface BoosterPerksWidgetProps {
  perks: BriefingsPerks | null | undefined
}

const STRIPE_BG =
  'repeating-linear-gradient(-45deg, transparent 0 12px, rgba(255,0,255,0.025) 12px 13px)'

/**
 * Non-booster widget in the SEC_02 slot. Reframes the booster perk as a
 * community-support channel rather than a paywall — the left column shows
 * what server boosts actually fund (Discord features the whole community
 * benefits from), the right column shows what boosters get back as a
 * thank-you. Renders nothing when `perks.enabled === false`.
 */
export function BoosterPerksWidget({ perks }: BoosterPerksWidgetProps) {
  if (!perks || perks.enabled === false) return null

  const kicker = perks.kicker?.trim() ?? ''
  const heading = perks.heading?.trim() ?? ''
  const body = perks.body?.trim() ?? ''
  const fundBullets = (perks.fundBullets ?? [])
    .map((b) => b.text?.trim())
    .filter((t): t is string => Boolean(t && t.length > 0))
  const giveBackBullets = (perks.bullets ?? [])
    .map((b) => b.text?.trim())
    .filter((t): t is string => Boolean(t && t.length > 0))
  const ctaLabel = perks.cta?.label?.trim() ?? ''
  const ctaUrl = perks.cta?.url?.trim() ?? ''
  const ctaVisible = ctaLabel.length > 0 && ctaUrl.length > 0
  const external = /^https?:\/\//i.test(ctaUrl)

  return (
    <div
      className="relative border border-rga-magenta/25 bg-[rgba(8,8,8,0.95)]"
      style={{ backgroundImage: STRIPE_BG }}
    >
      <BracketStamp />

      <div className="flex flex-col gap-7 p-6 sm:gap-9 sm:p-8 lg:p-10">
        {/* Header — bracket pill + status indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {kicker && (
            <span className="inline-flex items-center border border-rga-magenta/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-rga-magenta">
              {kicker}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
            <span aria-hidden className="text-rga-magenta/70">◊</span>
            <span>COMMUNITY-FUNDED</span>
          </span>
        </div>

        {/* Display headline */}
        {heading && (
          <h2
            className="break-words font-display text-2xl uppercase leading-[1.0] text-text-primary sm:text-3xl lg:text-[40px] xl:text-[44px]"
            style={{ textShadow: '0 0 32px rgba(255,0,255,0.25)' }}
          >
            {heading}
          </h2>
        )}

        {/* Body paragraph */}
        {body && (
          <p className="max-w-3xl text-[15px] leading-relaxed text-text-secondary/95 sm:text-base">
            {body}
          </p>
        )}

        {/* Two-column give/get split */}
        {(fundBullets.length > 0 || giveBackBullets.length > 0) && (
          <div className="grid grid-cols-1 gap-6 border-t border-rga-magenta/15 pt-7 sm:gap-10 lg:grid-cols-2">
            <Column
              label="// WHAT BOOSTS FUND"
              sublabel="DISCORD · COMMUNITY"
              items={fundBullets}
              accent="magenta"
            />
            <Column
              label="// YOUR THANK-YOU"
              sublabel="BRIEFING · BOOSTER"
              items={giveBackBullets}
              accent="cyan"
            />
          </div>
        )}

        {/* CTA + telemetry strip */}
        {ctaVisible && (
          <div className="flex flex-col gap-5 border-t border-rga-magenta/15 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
              <span className="flex items-center gap-2">
                <span aria-hidden className="text-rga-magenta">▸</span>
                <span className="text-text-secondary">DISCORD NITRO TIER</span>
              </span>
              <span className="pl-5">
                BOOSTS ROLL UP TO SERVER · NOT TO RGA POCKETS
              </span>
            </div>
            <CyberButton
              href={ctaUrl}
              external={external}
              color="magenta"
              className="px-7 py-4 self-start sm:self-auto"
            >
              {ctaLabel}
            </CyberButton>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────

function Column({
  label,
  sublabel,
  items,
  accent,
}: {
  label: string
  sublabel: string
  items: string[]
  accent: 'magenta' | 'cyan'
}) {
  if (items.length === 0) return null
  const labelColor = accent === 'magenta' ? 'text-rga-magenta' : 'text-rga-cyan'
  const dotColor =
    accent === 'magenta'
      ? 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]'
      : 'bg-rga-cyan shadow-[0_0_8px_#00FFFF]'
  const ruleColor =
    accent === 'magenta' ? 'bg-rga-magenta/40' : 'bg-rga-cyan/40'
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`h-px w-5 ${ruleColor}`} />
        <span className={`font-mono text-[10px] uppercase tracking-[0.32em] ${labelColor}`}>
          {label}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-text-muted/70">
          {sublabel}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((b, i) => (
          <li
            key={i}
            className="flex gap-3 text-[14px] leading-snug text-text-secondary"
          >
            <span
              aria-hidden
              className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-[1px] ${dotColor}`}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Outside corner brackets — same L-tick treatment as the LATEST hero, in
 * magenta to mark the widget as a community-support callout.
 */
function BracketStamp() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2.5 -left-2.5 z-10 h-6 w-6 border-t-2 border-l-2 border-rga-magenta"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2.5 -right-2.5 z-10 h-6 w-6 border-t-2 border-r-2 border-rga-magenta"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2.5 -left-2.5 z-10 h-6 w-6 border-b-2 border-l-2 border-rga-magenta"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2.5 -right-2.5 z-10 h-6 w-6 border-b-2 border-r-2 border-rga-magenta"
      />
    </>
  )
}
