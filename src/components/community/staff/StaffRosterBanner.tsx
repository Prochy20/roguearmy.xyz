import { ArrowRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners } from '@/components/ui/CyberCorners'
import type { StaffPage } from '@/payload-types'

type RosterTailBanner = NonNullable<NonNullable<StaffPage['roster']>['tailBanner']>
type FragmentEntry = NonNullable<NonNullable<RosterTailBanner['fragment']>['entries']>[number]
type FragmentTone = 'cyan' | 'green' | 'magenta'

interface StaffRosterBannerProps {
  content: RosterTailBanner | null | undefined
}

const NOTE_TEXT: Record<FragmentTone, string> = {
  cyan: 'text-rga-cyan',
  green: 'text-rga-green',
  magenta: 'text-rga-magenta',
}

const NOTE_GLOW: Record<FragmentTone, string> = {
  cyan: 'shadow-[0_0_6px_#00FFFF]',
  green: 'shadow-[0_0_6px_#00FF41]',
  magenta: 'shadow-[0_0_6px_#FF00FF]',
}

const NOTE_DOT: Record<FragmentTone, string> = {
  cyan: 'bg-rga-cyan',
  green: 'bg-rga-green',
  magenta: 'bg-rga-magenta',
}

/**
 * Wide closing card slotted under the roster grid. The right-hand side
 * carries a "redacted manifest fragment" — a mono console readout listing
 * a few off-manifest role-groups followed by literally redacted rows. The
 * panel ships with three layers of motion that respect prefers-reduced-
 * motion via the motion-safe: variant: staggered row entry, a blinking
 * cursor in the header, and neon-flicker on the redacted rows (different
 * delays per column so they read as independent noise).
 */
export function StaffRosterBanner({ content }: StaffRosterBannerProps) {
  if (!content || content.enabled === false) return null

  const kicker = content.kicker?.trim()
  const title = content.title?.trim()
  const body = content.body?.trim()
  const ctaLabel = content.ctaLabel?.trim()
  const ctaHref = content.ctaHref?.trim()

  const fragment = content.fragment
  const fragmentLabel = fragment?.label?.trim() ?? ''
  const fragmentEntries = (fragment?.entries ?? []).filter((e) =>
    Boolean(e.label?.trim()),
  )
  const redactedLine = fragment?.redactedLine?.trim() ?? ''

  if (!kicker && !title && !body && fragmentEntries.length === 0) return null

  const showCta = Boolean(ctaHref && ctaLabel)
  const isExternal = Boolean(ctaHref && /^https?:\/\//i.test(ctaHref))
  const hasFragment = fragmentEntries.length > 0
  const hasAside = hasFragment || showCta

  return (
    <div className="mt-10 sm:mt-12">
      <CyberCorners color="cyan" size="md" glow>
        <div className="relative flex flex-col gap-8 overflow-hidden border border-rga-cyan/20 bg-[rgba(0,0,0,0.4)] p-8 backdrop-blur-sm sm:p-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent 0,
                transparent 3px,
                rgba(0,255,255,0.5) 3px,
                rgba(0,255,255,0.5) 4px
              )`,
            }}
          />

          <div className="relative flex min-w-0 flex-col gap-4 lg:max-w-xl">
            {kicker && (
              <div className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] text-rga-cyan uppercase">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 bg-rga-cyan shadow-[0_0_6px_#00FFFF]"
                />
                {kicker}
              </div>
            )}

            {title && (
              <h3
                className="font-display uppercase leading-[0.95] tracking-[0.005em] text-text-primary text-balance"
                style={{ fontSize: 'clamp(28px, 3.2vw, 48px)' }}
              >
                {title}
              </h3>
            )}

            {body && (
              <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {body}
              </p>
            )}
          </div>

          {hasAside && (
            <div className="relative flex w-full shrink-0 flex-col gap-4 lg:w-[24rem]">
              {hasFragment && (
                <FragmentPanel
                  label={fragmentLabel}
                  entries={fragmentEntries}
                  redactedLine={redactedLine}
                />
              )}

              {showCta && (
                <a
                  href={ctaHref}
                  {...(isExternal
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="group/cta inline-flex items-center justify-center gap-3 border border-rga-cyan/40 bg-black/40 px-4 py-2.5 font-mono text-[11px] tracking-[0.35em] text-rga-cyan uppercase backdrop-blur-md transition-all duration-200 hover:border-rga-cyan hover:bg-rga-cyan/10 hover:shadow-[0_0_18px_-4px_rgba(0,255,255,0.6)] lg:self-end"
                  aria-label={isExternal ? `${ctaLabel} (opens in a new tab)` : ctaLabel}
                >
                  <span>{ctaLabel}</span>
                  {isExternal ? (
                    <ExternalLink
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:scale-110"
                      aria-hidden
                    />
                  ) : (
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                      aria-hidden
                    />
                  )}
                </a>
              )}
            </div>
          )}
        </div>
      </CyberCorners>
    </div>
  )
}

interface FragmentPanelProps {
  label: string
  entries: FragmentEntry[]
  redactedLine: string
}

function FragmentPanel({ label, entries, redactedLine }: FragmentPanelProps) {
  return (
    <div className="relative">
      {/* Console-frame header line: filename + blinking cursor */}
      {label && (
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[9px] tracking-[0.35em] text-rga-cyan/70 uppercase">
          <span className="flex items-center gap-2 truncate">
            <span aria-hidden className="text-text-muted">$</span>
            <span className="truncate">{label}</span>
          </span>
          <span
            aria-hidden
            className="text-rga-cyan motion-safe:animate-blink"
          >
            ▮
          </span>
        </div>
      )}

      <div className="relative overflow-hidden border border-rga-cyan/20 bg-[rgba(0,0,0,0.55)] px-4 py-3.5 backdrop-blur-sm">
        <ul className="flex flex-col gap-1.5 font-mono text-[11px]">
          {entries.map((entry, index) => {
            const tone = (entry.tone ?? 'green') as FragmentTone
            const num = String(index + 1).padStart(3, '0')
            return (
              <li
                key={entry.id ?? `${entry.label}-${index}`}
                className="grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 motion-safe:opacity-0 motion-safe:[animation:rga-card-in_420ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <span className="text-rga-cyan tabular-nums">{num}</span>
                <span className="truncate tracking-[0.15em] text-text-primary uppercase">
                  {entry.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block h-1 w-1 shrink-0',
                      NOTE_DOT[tone],
                      NOTE_GLOW[tone],
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] tracking-[0.25em] uppercase',
                      NOTE_TEXT[tone],
                    )}
                  >
                    {entry.note ?? 'ACTIVE'}
                  </span>
                </span>
              </li>
            )
          })}

          {/* Decorative redacted rows — same grid as real entries but
              filled with U+2592 medium-shade blocks. neon-flicker with
              different delays keeps them out of phase so they read as
              independent noise, not a single pulsing element. */}
          <RedactedRow
            blocks={{ no: '▒▒▒', label: '▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒', note: '▒▒▒▒▒▒' }}
            delayMs={120 + entries.length * 90}
          />
          <RedactedRow
            blocks={{ no: '▒▒▒', label: '▒▒▒▒▒▒▒▒▒▒▒▒', note: '▒▒▒▒▒' }}
            delayMs={120 + entries.length * 90 + 220}
            flickerOffset={1700}
          />
        </ul>

        {redactedLine && (
          <div className="mt-3 border-t border-dashed border-rga-magenta/25 pt-2 font-mono text-[10px] tracking-[0.3em] text-rga-magenta uppercase">
            {redactedLine}
          </div>
        )}
      </div>
    </div>
  )
}

interface RedactedRowProps {
  blocks: { no: string; label: string; note: string }
  delayMs: number
  /** Offsets the neon-flicker cycle so two rows don't pulse in sync. */
  flickerOffset?: number
}

function RedactedRow({ blocks, delayMs, flickerOffset = 0 }: RedactedRowProps) {
  return (
    <li
      aria-hidden
      className="grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 text-rga-magenta/45 motion-safe:opacity-0 motion-safe:[animation:rga-card-in_420ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="tabular-nums motion-safe:animate-neon-flicker" style={{ animationDelay: `${flickerOffset}ms` }}>
        {blocks.no}
      </span>
      <span className="truncate motion-safe:animate-neon-flicker" style={{ animationDelay: `${flickerOffset + 300}ms` }}>
        {blocks.label}
      </span>
      <span className="motion-safe:animate-neon-flicker" style={{ animationDelay: `${flickerOffset + 600}ms` }}>
        :: {blocks.note}
      </span>
    </li>
  )
}
