import { ACCENT_TOKENS, type AccentName } from './accent'
import { formatDayShort } from '@/lib/division2/format'
import type { DigestFrequency } from '@/lib/division2/digest.server'

interface DigestDocStripProps {
  accent: AccentName
  designator: string
  frequency: DigestFrequency
  wordCount: number
  /** ISO datetime — formatted to short day in UTC. */
  updatedAt: string
}

/**
 * Mono "packet header" strip directly above the TL;DR card.
 *
 * The four fields read like the metadata block on top of an intel packet:
 * doc code, classification, length, last-touched. Separators are `::` (mono
 * double-colons) in accent color — small typographic ticks that reinforce
 * the channel without crowding the text. Word count and date use tabular-
 * nums so the columns don't jitter when content updates.
 */
export function DigestDocStrip({
  accent,
  designator,
  frequency,
  wordCount,
  updatedAt,
}: DigestDocStripProps) {
  const a = ACCENT_TOKENS[accent]
  const updated = formatUpdated(updatedAt)
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border ${a.borderFaint} bg-void/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm`}
    >
      <Field label="DOC">
        <span className={`${a.text} tabular-nums`} style={{ textShadow: a.textGlow }}>
          {designator}
        </span>
      </Field>
      <Sep accent={accent} />
      <Field label="CLASS">{frequency.toUpperCase()}</Field>
      <Sep accent={accent} />
      <Field label="WORDS">
        <span className="text-text-secondary tabular-nums">
          {wordCount.toLocaleString('en-US')}
        </span>
      </Field>
      <Sep accent={accent} />
      <Field label="UPDATED">
        <span className="text-text-secondary tabular-nums">{updated}</span>
      </Field>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-text-muted/70">{label}</span>
      <span>{children}</span>
    </span>
  )
}

function Sep({ accent }: { accent: AccentName }) {
  const a = ACCENT_TOKENS[accent]
  return (
    <span aria-hidden className={`${a.textSoft} select-none`}>
      ::
    </span>
  )
}

function formatUpdated(iso: string): string {
  if (!iso) return ''
  const day = iso.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return formatDayShort(day)
  return iso
}
