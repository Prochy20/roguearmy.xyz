import {
  ArrowRight,
  AlertTriangle,
  AtSign,
  ExternalLink,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeader } from '@/components/community/SectionHeader'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { RichTextRenderer } from '@/components/richtext/RichTextRenderer'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { StaffPage } from '@/payload-types'

type Severity = 'urgent' | 'formal' | 'casual' | 'social'
type LaneTone = 'cyan' | 'green' | 'magenta'

interface StaffEngagementProtocolProps {
  protocol: StaffPage['protocol']
  faq: StaffPage['faq']
}

type LaneRow = NonNullable<NonNullable<StaffPage['protocol']>['lanes']>[number]
type FaqRowData = NonNullable<NonNullable<StaffPage['faq']>['entries']>[number]

const ICONS: Record<string, LucideIcon> = {
  ticket: Ticket,
  'message-circle': MessageCircle,
  'at-sign': AtSign,
  mail: Mail,
  globe: Globe,
  phone: Phone,
}

const SEVERITY_LABEL: Record<Severity, string> = {
  urgent: 'URGENT',
  formal: 'FORMAL',
  casual: 'CASUAL',
  social: 'SOCIAL',
}

const SEVERITY_DOT: Record<Severity, string> = {
  urgent: 'bg-rga-magenta shadow-[0_0_8px_#FF00FF]',
  formal: 'bg-rga-cyan shadow-[0_0_8px_#00FFFF]',
  casual: 'bg-rga-green shadow-[0_0_8px_#00FF41]',
  social: 'bg-rga-gray shadow-none',
}

const SEVERITY_TEXT: Record<Severity, string> = {
  urgent: 'text-rga-magenta',
  formal: 'text-rga-cyan',
  casual: 'text-rga-green',
  social: 'text-text-muted',
}

const LANE_BORDER: Record<LaneTone, string> = {
  cyan: 'border-rga-cyan/25',
  green: 'border-rga-green/25',
  magenta: 'border-rga-magenta/25',
}

const LANE_ICON_GLOW: Record<LaneTone, string> = {
  cyan: 'drop-shadow(0 0 12px rgba(0,255,255,0.55))',
  green: 'drop-shadow(0 0 12px rgba(0,255,65,0.55))',
  magenta: 'drop-shadow(0 0 12px rgba(255,0,255,0.55))',
}

const LANE_ICON_TEXT: Record<LaneTone, string> = {
  cyan: 'text-rga-cyan',
  green: 'text-rga-green',
  magenta: 'text-rga-magenta',
}

const LANE_LABEL: Record<LaneTone, string> = {
  cyan: 'text-rga-cyan',
  green: 'text-rga-green',
  magenta: 'text-rga-magenta',
}

const LANE_BG_TINT: Record<LaneTone, string> = {
  cyan: 'bg-rga-cyan',
  green: 'bg-rga-green',
  magenta: 'bg-rga-magenta',
}

const LANE_CTA_CLASS: Record<LaneTone, string> = {
  cyan: 'border-rga-cyan/40 text-rga-cyan hover:border-rga-cyan hover:bg-rga-cyan/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,255,0.6)]',
  green:
    'border-rga-green/40 text-rga-green hover:border-rga-green hover:bg-rga-green/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,65,0.6)]',
  magenta:
    'border-rga-magenta/40 text-rga-magenta hover:border-rga-magenta hover:bg-rga-magenta/10 hover:shadow-[0_0_16px_-4px_rgba(255,0,255,0.6)]',
}

export function StaffEngagementProtocol({ protocol, faq }: StaffEngagementProtocolProps) {
  const lanes = protocol?.lanes ?? []
  const entries = faq?.entries ?? []
  const groundRules = faq?.groundRules ?? []

  return (
    <section
      id="sec-02"
      className="relative px-4 py-24 sm:px-8 sm:py-28 lg:px-16 lg:py-32"
      aria-labelledby="staff-protocol-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 15% 25%, rgba(0,255,255,0.05) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 90% 80%, rgba(255,0,255,0.04) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader
          num="02"
          eyebrow={protocol?.sectionEyebrow ?? 'PROTOCOL'}
          kicker={protocol?.sectionKicker ?? '// REACHING THE LINE · YOUR CALL HOW'}
          title={protocol?.sectionTitle ?? 'HOW TO HIT US UP'}
        />

        {protocol?.intro && (
          <p className="mb-12 max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {protocol.intro}
          </p>
        )}

        {protocol?.lanesEyebrow && (
          <div className="mb-4 font-mono text-[11px] tracking-[0.4em] text-rga-cyan uppercase">
            {protocol.lanesEyebrow}
          </div>
        )}

        {lanes.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
            {lanes.map((lane) => (
              <li key={lane.id ?? lane.title} className="flex">
                <LaneCard lane={lane} />
              </li>
            ))}
          </ul>
        )}

        <h3
          id="staff-protocol-heading"
          className="mt-16 mb-6 font-mono text-[11px] tracking-[0.4em] text-rga-cyan uppercase"
        >
          {faq?.heading ?? '// FREQUENTLY ASKED'}
        </h3>

        {entries.length > 0 && (
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {entries.map((entry, i) => (
              <FaqRow key={entry.id ?? entry.question} index={i} entry={entry} />
            ))}
          </ul>
        )}

        {(faq?.groundRulesLabel || groundRules.length > 0) && (
          <div className="mt-12 flex flex-col gap-4 border-t border-[rgba(255,255,255,0.08)] pt-8 sm:flex-row sm:items-center sm:gap-6">
            {faq?.groundRulesLabel && (
              <div className="flex shrink-0 items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-rga-magenta uppercase">
                <AlertTriangle
                  className="h-4 w-4"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.6))' }}
                  aria-hidden
                />
                {faq.groundRulesLabel}
              </div>
            )}
            {groundRules.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {groundRules.map((rule) => (
                  <li key={rule.id ?? rule.label}>
                    <CyberTag color={(rule.tone ?? 'cyan') as LaneTone}>
                      {rule.label}
                    </CyberTag>
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

function LaneCard({ lane }: { lane: LaneRow }) {
  const tone = (lane.tone ?? 'cyan') as LaneTone
  const Icon = ICONS[lane.iconKey ?? 'ticket'] ?? Ticket

  return (
    <CyberCorners color={tone} size="sm" glow className="flex w-full">
      <div
        className={`relative flex h-full w-full flex-col gap-4 border bg-[rgba(0,0,0,0.55)] p-6 backdrop-blur-sm sm:p-7 ${LANE_BORDER[tone]}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[10px] tracking-[0.4em] uppercase ${LANE_LABEL[tone]}`}
          >
            {lane.toneLabel}
          </span>
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 ${LANE_BG_TINT[tone]} shadow-[0_0_6px_currentColor]`}
            style={{ color: 'inherit' }}
          />
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center border bg-black/60 ${LANE_BORDER[tone]}`}
        >
          <Icon
            className={`h-7 w-7 ${LANE_ICON_TEXT[tone]}`}
            style={{ filter: LANE_ICON_GLOW[tone] }}
            aria-hidden
          />
        </div>

        <div className="flex flex-col gap-2">
          <h3
            className="font-display uppercase leading-[0.95] tracking-[0.005em] text-text-primary"
            style={{ fontSize: 'clamp(24px, 2.4vw, 32px)' }}
          >
            {lane.title}
          </h3>
          {lane.hint && (
            <code
              className={`font-mono text-[11px] tracking-[0.25em] uppercase ${LANE_LABEL[tone]}`}
            >
              {lane.hint}
            </code>
          )}
        </div>

        <p className="text-sm leading-relaxed text-text-secondary">{lane.body}</p>

        {lane.href && (
          <div className="mt-auto pt-2">
            <a
              href={lane.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group/cta inline-flex items-center gap-2 border bg-black/40 px-3 py-2 font-mono text-[10px] tracking-[0.3em] uppercase backdrop-blur-md transition-all duration-200 ${LANE_CTA_CLASS[tone]}`}
              aria-label={`${lane.ctaLabel || 'Open channel'} on Discord — ${lane.hint}`}
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              <span>{lane.ctaLabel || 'OPEN CHANNEL'}</span>
              {lane.hint && (
                <span className={`${LANE_LABEL[tone]} opacity-70`}>· {lane.hint}</span>
              )}
              <ArrowRight
                className="h-3 w-3 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        )}
      </div>
    </CyberCorners>
  )
}

interface FaqRowProps {
  index: number
  entry: FaqRowData
}

function FaqRow({ index, entry }: FaqRowProps) {
  const num = String(index + 1).padStart(2, '0')
  const severity = (entry.severity ?? 'formal') as Severity

  return (
    <li className="group/row relative flex h-full flex-col gap-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] px-6 py-7 backdrop-blur-sm transition-all duration-200 hover:border-rga-cyan/30 hover:bg-[rgba(0,255,255,0.02)] sm:px-7 sm:py-8">
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-3 w-px bg-rga-cyan/40 transition-all duration-200 group-hover/row:h-4 group-hover/row:bg-rga-cyan"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-px w-3 bg-rga-cyan/40 transition-all duration-200 group-hover/row:w-4 group-hover/row:bg-rga-cyan"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-3 w-px bg-rga-cyan/40 transition-all duration-200 group-hover/row:h-4 group-hover/row:bg-rga-cyan"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-px w-3 bg-rga-cyan/40 transition-all duration-200 group-hover/row:w-4 group-hover/row:bg-rga-cyan"
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={`font-mono text-[11px] tabular-nums tracking-[0.25em] uppercase ${SEVERITY_TEXT[severity]}`}
        >
          {num}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 ${SEVERITY_DOT[severity]}`}
          />
          <span
            className={`font-mono text-[9px] tracking-[0.4em] uppercase ${SEVERITY_TEXT[severity]}`}
          >
            {SEVERITY_LABEL[severity]}
          </span>
        </span>
      </div>

      <h4 className="font-display text-lg leading-snug tracking-[0.005em] text-text-primary sm:text-xl">
        {entry.question}
      </h4>

      <RichTextRenderer
        data={entry.answer as SerializedEditorState}
        className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base [&_a]:text-rga-cyan [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-rga-cyan/80 [&_strong]:text-text-primary [&_strong]:font-semibold [&_em]:italic [&_code]:rounded-sm [&_code]:bg-white/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-rga-cyan [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p+p]:mt-2 [&_p]:m-0"
      />

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
        <FaqDestination entry={entry} />
        <span className="h-3 w-px bg-white/10" aria-hidden />
        <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
          {entry.response}
        </span>
      </div>
    </li>
  )
}

/**
 * Renders the destination slot as either a clickable button (when entry.href
 * is set) or a read-only chip (when it isn't). The two states use distinct
 * visual vocabulary so the difference is obvious at a glance, not just on
 * hover: the button carries leading + trailing icons and a saturated frame,
 * the chip is dim and preceded by the meta arrow.
 */
function FaqDestination({ entry }: { entry: FaqRowData }) {
  const showHint = entry.channelHint && entry.channelHint !== entry.channel

  if (entry.href) {
    return (
      <a
        href={entry.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group/cta inline-flex items-center gap-2 border border-rga-cyan/40 bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.2em] text-rga-cyan uppercase backdrop-blur-md transition-all duration-200 hover:border-rga-cyan hover:bg-rga-cyan/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,255,0.6)]"
        aria-label={`${entry.channel}${showHint ? ` · ${entry.channelHint}` : ''}`}
      >
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        <span>{entry.channel}</span>
        {showHint && <span className="text-rga-cyan/60">· {entry.channelHint}</span>}
        <ArrowRight
          className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover/cta:translate-x-0.5"
          aria-hidden
        />
      </a>
    )
  }

  return (
    <>
      <ArrowRight
        className="h-3 w-3 shrink-0 text-text-muted/60 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-text-secondary"
        aria-hidden
      />
      <span className="inline-flex items-center gap-2 border border-white/10 bg-transparent px-3 py-1.5 font-mono text-[11px] tracking-[0.2em] text-text-secondary uppercase">
        {entry.channel}
        {showHint && <span className="text-text-muted">· {entry.channelHint}</span>}
      </span>
    </>
  )
}
