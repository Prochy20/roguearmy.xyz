import { Fragment } from 'react'
import { ACCENT_TOKENS, type AccentName } from './accent'

/**
 * One field in the doc strip. `tone` picks the visual emphasis:
 *  - 'accent': the page-accent color + glow (for marquee fields like designators)
 *  - 'secondary': solid foreground text (for primary numeric values)
 *  - 'muted': dim secondary text (for incidental info)
 */
export interface ReaderDocStripField {
  label: string
  value: string
  tone?: 'accent' | 'secondary' | 'muted'
}

interface ReaderDocStripProps {
  accent: AccentName
  fields: ReadonlyArray<ReaderDocStripField>
}

/**
 * Mono "packet header" strip — sits directly above the TL;DR card.
 *
 * Reads like the metadata block on top of an intel packet: a flat row of
 * label/value pairs separated by `::` ticks. Each caller composes its own
 * field list — briefing passes DOC/CLASS/WORDS/UPDATED, article passes
 * DOC/CLASS/WORDS/PUBLISHED, etc.
 *
 * Word count and date values typically use tabular-nums (caller adds it
 * inline if needed — kept off by default to avoid forcing tabular on labels
 * like topic names).
 */
export function ReaderDocStrip({ accent, fields }: ReaderDocStripProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border ${a.borderFaint} bg-void/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm`}
    >
      {fields.map((field, i) => (
        <Fragment key={`${field.label}-${i}`}>
          {i > 0 && <Sep accent={accent} />}
          <Field label={field.label}>
            <FieldValue accent={accent} tone={field.tone}>
              {field.value}
            </FieldValue>
          </Field>
        </Fragment>
      ))}
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

function FieldValue({
  accent,
  tone = 'secondary',
  children,
}: {
  accent: AccentName
  tone?: 'accent' | 'secondary' | 'muted'
  children: React.ReactNode
}) {
  const a = ACCENT_TOKENS[accent]
  if (tone === 'accent') {
    return (
      <span className={`${a.text} tabular-nums`} style={{ textShadow: a.textGlow }}>
        {children}
      </span>
    )
  }
  if (tone === 'muted') {
    return <span className="text-text-muted tabular-nums">{children}</span>
  }
  return <span className="text-text-secondary tabular-nums">{children}</span>
}

function Sep({ accent }: { accent: AccentName }) {
  const a = ACCENT_TOKENS[accent]
  return (
    <span aria-hidden className={`${a.textSoft} select-none`}>
      ::
    </span>
  )
}
