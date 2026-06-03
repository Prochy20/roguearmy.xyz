import type { ReactNode } from 'react'

interface StatusControlGridProps {
  /** Discord handle without the leading "@", shown in the form code. */
  handle: string
  /** Left column: SEC_02 CurrentStateCard. */
  currentState: ReactNode
  /** Right column: SEC_01 SetStatusForm. */
  setStatus: ReactNode
}

export function StatusControlGrid({
  handle,
  currentState,
  setStatus,
}: StatusControlGridProps) {
  return (
    <section className="relative border border-[rgba(255,255,255,0.08)] bg-linear-to-b from-[rgba(255,255,255,0.018)] to-[rgba(0,0,0,0.35)]">
      <HatchedHeader handle={handle} />
      <div className="grid grid-cols-1 gap-10 p-5 sm:p-7 lg:grid-cols-2 lg:gap-14 lg:p-10">
        <div className="min-w-0">{currentState}</div>
        <div className="min-w-0">{setStatus}</div>
      </div>
    </section>
  )
}

function HatchedHeader({ handle }: { handle: string }) {
  return (
    <div
      className="relative flex items-center justify-between gap-4 overflow-hidden border-b border-[rgba(255,255,255,0.08)] px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted sm:px-6"
      style={{
        background:
          'repeating-linear-gradient(135deg, rgba(255,0,102,0.05) 0 10px, transparent 10px 20px)',
      }}
    >
      <span className="text-status-error">// STATUS CONTROL · RGA-PERSONNEL</span>
      <span className="hidden sm:inline">FORM 07 / OP-{handle.toUpperCase()}</span>
    </div>
  )
}
