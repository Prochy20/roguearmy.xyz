import { CyberCorners } from '@/components/ui/CyberCorners'
import type { AshleyError } from '@/lib/api/server'

interface LeaderboardFailStateProps {
  error: AshleyError
}

export function LeaderboardFailState({ error }: LeaderboardFailStateProps) {
  const { headline, body } = messageFor(error)

  return (
    <CyberCorners color="rose" size="lg" glow>
      <div className="flex flex-col items-center gap-6 border border-status-error/25 bg-status-error/[0.03] px-8 py-16 text-center sm:px-12 sm:py-24">
        <span
          aria-hidden
          className="inline-block h-3 w-3 rounded-[1px] bg-status-error shadow-[0_0_12px_#FF0066]"
        />
        <div className="flex flex-col gap-3">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-status-error">
            // FEED OFFLINE
          </div>
          <h3
            className="font-display uppercase leading-[0.95] text-text-primary"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
          >
            {headline}
          </h3>
        </div>
        <p className="max-w-md font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
          {body}
        </p>
        {error.status ? (
          <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-status-error/70">
            {`// CODE ${error.status}`}
          </div>
        ) : null}
      </div>
    </CyberCorners>
  )
}

function messageFor(error: AshleyError): { headline: string; body: string } {
  switch (error.code) {
    case 'unavailable':
      return {
        headline: 'LEADERBOARD UNREACHABLE',
        body: 'The scoring service is offline. Refresh in a moment — the board returns when upstream comes back.',
      }
    case 'forbidden':
      return {
        headline: 'ACCESS DENIED BY UPSTREAM',
        body: 'The service rejected our credentials. An operator has been paged.',
      }
    case 'not_found':
      return {
        headline: 'LEADERBOARD ENDPOINT MISSING',
        body: 'The board route is no longer routed. This is a configuration issue.',
      }
    case 'invalid':
      return {
        headline: 'REQUEST REJECTED',
        body: 'Upstream rejected the leaderboard query. Try again — the request shape may have changed.',
      }
    case 'unauthenticated':
    case 'unauthorized':
      return {
        headline: 'SESSION EXPIRED',
        body: 'Sign in again to refresh your access — your rank picks up where it left off.',
      }
    case 'unknown':
    default:
      return {
        headline: 'UNKNOWN UPSTREAM CONDITION',
        body: 'Something unusual happened upstream. Retry, then check the status page if it persists.',
      }
  }
}
