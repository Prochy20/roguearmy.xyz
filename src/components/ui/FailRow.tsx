import type { AshleyErrorCode } from '@/lib/api/server'

/**
 * Shared fail-state row for Ashley failures. Pattern-matches on
 * `AshleyErrorCode` so every consumer surfaces the same vocabulary across
 * the site (per the Ashley failure-UI convention).
 *
 * `returnTo` lets re-login affordances point back to the originating
 * surface (e.g. `/me`, `/division-2/escalation`).
 */
export function FailRow({
  code,
  status,
  returnTo = '/',
}: {
  code: AshleyErrorCode
  status?: number
  returnTo?: string
}) {
  let message: string
  let action: { href: string; label: string } | null = null

  switch (code) {
    case 'unauthenticated':
      message = 'ASHLEY SESSION NOT ESTABLISHED'
      action = { href: `/auth/login?returnTo=${encodeURIComponent(returnTo)}`, label: 'RE-LOGIN' }
      break
    case 'unauthorized':
      message = 'SESSION EXPIRED — TOKENS NEED A REFRESH'
      action = { href: `/auth/login?returnTo=${encodeURIComponent(returnTo)}`, label: 'RE-LOGIN' }
      break
    case 'unavailable':
      message = `UPSTREAM UNREACHABLE${status ? ` — CODE ${status}` : ''} — RETRY MOMENTARILY`
      break
    default:
      message = `REQUEST REJECTED — CODE ${status ?? '?'}`
      break
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border border-status-error/25 bg-status-error/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-status-error">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-[1px] bg-status-error shadow-[0_0_8px_#FF0066]"
      />
      <span>// {message}</span>
      {action && (
        <a
          href={action.href}
          className="ml-auto underline underline-offset-4 transition-colors hover:text-text-primary"
        >
          {action.label} →
        </a>
      )}
    </div>
  )
}
