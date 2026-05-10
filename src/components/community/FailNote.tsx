import type { AshleyError } from '@/lib/api/server'

interface FailNoteProps {
  error: AshleyError
  /** Short noun describing the missing data, e.g. "STATS", "ROLES". */
  resource: string
}

/**
 * Pattern-matched error UI for Ashley failures within a section. Each
 * AshleyErrorCode maps to a specific message; the section keeps its
 * SectionHeader so the page rhythm is preserved even when the data is gone.
 */
export function FailNote({ error, resource }: FailNoteProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-[rgba(255,0,255,0.25)] bg-[rgba(255,0,255,0.03)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-rga-magenta">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-[1px] bg-rga-magenta shadow-[0_0_8px_#FF00FF]"
      />
      <span>{`// ${resource} · ${messageFor(error)}`}</span>
    </div>
  )
}

function messageFor(error: AshleyError): string {
  const status = error.status ? ` — CODE ${error.status}` : ''
  switch (error.code) {
    case 'unavailable':
      return `UPSTREAM UNREACHABLE${status} — RETRY MOMENTARILY`
    case 'not_found':
      return 'CHANNEL NOT FOUND ON UPSTREAM'
    case 'forbidden':
      return 'SERVICE TOKEN REJECTED — CHECK API KEY'
    case 'invalid':
      return `REQUEST REJECTED${status}`
    case 'unauthenticated':
    case 'unauthorized':
      // Should not reach here for service-context calls, but keep a clear
      // message in case the helper is misused.
      return 'SERVICE AUTH MISCONFIGURED'
    case 'unknown':
    default:
      return `UNKNOWN UPSTREAM CONDITION${status}`
  }
}
