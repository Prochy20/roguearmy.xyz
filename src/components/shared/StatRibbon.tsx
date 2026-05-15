import { Fragment, type ReactNode } from 'react'

export interface StatRibbonField {
  label: string
  value: ReactNode
  accent?: 'green' | 'cyan'
}

export interface StatRibbonProps {
  prefix: string
  fields: StatRibbonField[]
  pill: { text: string; ok: boolean }
}

export function StatRibbon({ prefix, fields, pill }: StatRibbonProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm">
      <span className="text-text-secondary">{prefix}</span>
      {fields.map((field, i) => (
        <Fragment key={i}>
          <span className="h-3 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
          <RibbonField field={field} />
        </Fragment>
      ))}
      <span className="ml-auto" />
      <StatusPill text={pill.text} ok={pill.ok} />
    </div>
  )
}

function RibbonField({ field }: { field: StatRibbonField }) {
  const colorClass =
    field.accent === 'green'
      ? 'text-rga-green [text-shadow:0_0_10px_rgba(0,255,65,0.5)]'
      : field.accent === 'cyan'
        ? 'text-rga-cyan [text-shadow:0_0_10px_rgba(0,255,255,0.5)]'
        : 'text-text-primary'

  return (
    <span className="inline-flex items-baseline gap-2">
      {field.label && <span className="text-text-muted">{field.label}</span>}
      <span className={`tabular-nums ${colorClass}`}>{field.value}</span>
    </span>
  )
}

function StatusPill({ text, ok }: { text: string; ok: boolean }) {
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
      {text}
    </span>
  )
}
