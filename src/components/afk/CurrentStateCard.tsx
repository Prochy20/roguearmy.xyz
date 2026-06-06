import { AfkTicker } from './AfkTicker'
import type { AfkRecord } from './types'

interface CurrentStateCardProps {
  /** Active AFK record, or null when active. */
  afkRecord: AfkRecord | null
  /**
   * Most recent closed AFK session, used to fill the "RETURNED" timestamp
   * on the ACTIVE variant. Null when the user has no history yet.
   */
  latestClosedSession: AfkRecord | null
}

export function CurrentStateCard({
  afkRecord,
  latestClosedSession,
}: CurrentStateCardProps) {
  return afkRecord
    ? <AfkVariant record={afkRecord} />
    : <ActiveVariant latestClosedSession={latestClosedSession} />
}

function AfkVariant({ record }: { record: AfkRecord }) {
  return (
    <div className="flex flex-col gap-7">
      <Eyebrow tone="rose">// SEC_02 · CURRENT STATE</Eyebrow>

      <GlyphLine tone="rose">AFK</GlyphLine>

      <ReasonQuote reason={record.reason} />

      <Divider />

      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
          TIME AFK
        </span>
        <AfkTicker createdAt={record.createdAt} variant="loud" className="text-text-primary" />
      </div>

      <MetaFooter
        leftLabel="AFK SINCE"
        leftValue={formatDateTime(record.createdAt)}
        rightLabel="AUTO-CLEAR"
        rightValue={<span className="text-text-primary">ON VOICE JOIN</span>}
      />
    </div>
  )
}

function ActiveVariant({
  latestClosedSession,
}: {
  latestClosedSession: AfkRecord | null
}) {
  const returnedAt = latestClosedSession?.endedAt ?? null

  return (
    <div className="flex flex-col gap-7">
      <Eyebrow tone="green">// SEC_02 · CURRENT STATE</Eyebrow>

      <GlyphLine tone="green">ACTIVE</GlyphLine>

      <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-text-muted">
        STATUS LIVE · RECEIVING PINGS
      </p>

      <MetaFooter
        leftLabel="RETURNED"
        leftValue={returnedAt ? formatDateTime(returnedAt) : '—'}
        rightLabel="FLAGS"
        rightValue={<span className="text-text-muted">NONE</span>}
      />
    </div>
  )
}

function Eyebrow({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'green' | 'rose'
}) {
  const color = tone === 'rose' ? 'text-status-error' : 'text-rga-green'
  return (
    <div className={`font-mono text-[11px] uppercase tracking-[0.3em] ${color}`}>
      {children}
    </div>
  )
}

function GlyphLine({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'green' | 'rose'
}) {
  const color = tone === 'rose' ? '#FF0066' : '#00FF41'
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <span
        aria-hidden
        className="me-dot-pulse inline-block h-3 w-3 shrink-0 translate-y-[-0.4em] rounded-[2px] sm:h-4 sm:w-4"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
      <h2
        className="m-0 min-w-0 whitespace-nowrap font-display uppercase leading-[0.86]"
        style={{
          fontSize: 'clamp(48px, 7vw, 96px)',
          letterSpacing: '0.01em',
          color,
          textShadow: `0 0 28px ${color}66`,
        }}
      >
        {children}
      </h2>
    </div>
  )
}

function ReasonQuote({ reason }: { reason: string | null }) {
  if (!reason || reason.trim().length === 0) {
    return (
      <p className="font-mono text-[13px] text-text-muted">
        &gt; <span className="text-text-muted/70">// no reason set</span>
      </p>
    )
  }
  return (
    <p
      className="break-words font-mono text-[15px] text-text-primary"
      title={reason}
    >
      &gt; &quot;{reason}&quot;
    </p>
  )
}

function Divider() {
  return <div className="h-px bg-[rgba(255,255,255,0.08)]" />
}

function MetaFooter({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: React.ReactNode
  rightLabel: string
  rightValue: React.ReactNode
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-10 gap-y-2">
      <div className="flex flex-col gap-1.5">
        <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          {leftLabel}
        </dt>
        <dd className="font-mono text-[13px] uppercase tracking-[0.22em] text-text-primary">
          {leftValue}
        </dd>
      </div>
      <div className="flex flex-col gap-1.5">
        <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          {rightLabel}
        </dt>
        <dd className="font-mono text-[13px] uppercase tracking-[0.22em] text-text-primary">
          {rightValue}
        </dd>
      </div>
    </dl>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const day = d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${day} · ${time}`
}
