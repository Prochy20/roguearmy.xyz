import { redirect } from 'next/navigation'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { fetchAshleyUser, fetchAshleyUserNullable } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { FailRow } from '@/components/ui/FailRow'
import { StatusControlGrid } from '@/components/afk/StatusControlGrid'
import { CurrentStateCard } from '@/components/afk/CurrentStateCard'
import { SetStatusForm } from '@/components/afk/SetStatusForm'
import { SessionHistorySection } from '@/components/afk/SessionHistorySection'
import {
  normalizeAfkHistoryPage,
  normalizeAfkRecord,
  type AfkRecord,
} from '@/components/afk/types'
import '../me/me.css'

type RawAfk = components['schemas']['AfkRecordResponseDto']
type RawHistory = components['schemas']['AfkHistoryResponseDto']

const HISTORY_PAGE_SIZE = 20

export const metadata = {
  title: 'Status Management | Rogue Army',
  description: 'Manage your AFK state and review past sessions.',
}

export default async function AfkPage() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    redirect('/auth/login?returnTo=/afk')
  }

  const accessToken = await getAshleyAccessCookie()
  const [afkResult, historyResult] = await Promise.all([
    // GET /api/afk/me returns 200 + empty body when active — use the
    // nullable variant so an empty body doesn't surface as a fail row.
    fetchAshleyUserNullable<RawAfk>(accessToken, (c) => c.GET('/api/afk/me')),
    // Ashley's `isValid=false` query filter has flaky string-vs-bool
    // coercion server-side — pulling all records and filtering active
    // out client-side is more reliable. SEC_02 already owns the active
    // session display, so we don't need duplication anyway.
    fetchAshleyUser<RawHistory>(accessToken, (c) =>
      c.GET('/api/afk/me/history', {
        params: { query: { limit: HISTORY_PAGE_SIZE, offset: 0 } },
      }),
    ),
  ])

  const afkRecord: AfkRecord | null = afkResult.ok
    ? normalizeAfkRecord(afkResult.data)
    : null
  const currentStatus = afkRecord ? 'afk' : 'active'
  const currentReason = afkRecord?.reason ?? null

  const history = historyResult.ok ? normalizeAfkHistoryPage(historyResult.data) : null
  const latestClosedSession = history?.items[0] ?? null

  // Both fetches failed with the same upstream code (typically the user
  // lost their Ashley session — every Ashley call returns the same auth
  // error). Render one combined fail panel instead of two duplicate rows.
  const pageWideFailure =
    !afkResult.ok &&
    !historyResult.ok &&
    afkResult.error.code === historyResult.error.code

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-24">
      <OperationalStrip handle={auth.member.username} />

      {pageWideFailure ? (
        <section className="me-fade me-fade--01">
          <PageFailHeadline code={(!afkResult.ok && afkResult.error.code) || 'unknown'} />
          <FailRow
            code={afkResult.error.code}
            status={afkResult.error.status}
            returnTo="/afk"
          />
        </section>
      ) : (
        <>
          <section className="me-fade me-fade--01">
            {afkResult.ok ? (
              <StatusControlGrid
                handle={auth.member.username}
                currentState={
                  <CurrentStateCard
                    afkRecord={afkRecord}
                    latestClosedSession={latestClosedSession}
                  />
                }
                setStatus={
                  <SetStatusForm
                    currentStatus={currentStatus}
                    currentReason={currentReason}
                  />
                }
              />
            ) : (
              <FailRow
                code={afkResult.error.code}
                status={afkResult.error.status}
                returnTo="/afk"
              />
            )}
          </section>

          <section className="me-fade me-fade--02 mt-10 sm:mt-16 lg:mt-24">
            {historyResult.ok ? (
              <SessionHistorySection
                initialItems={history!.items}
                initialTotal={history!.total}
                initialOffset={0}
                joinedAt={auth.member.joinedAt}
                currentlyAfk={afkRecord !== null}
              />
            ) : (
              <FailRow
                code={historyResult.error.code}
                status={historyResult.error.status}
                returnTo="/afk"
              />
            )}
          </section>
        </>
      )}
    </main>
  )
}

function PageFailHeadline({
  code,
}: {
  code: import('@/lib/api/server').AshleyErrorCode
}) {
  const headline =
    code === 'unauthenticated' || code === 'unauthorized'
      ? 'STATUS CONSOLE LOCKED'
      : code === 'unavailable'
        ? 'STATUS CONSOLE OFFLINE'
        : 'STATUS CONSOLE UNAVAILABLE'
  const subtext =
    code === 'unauthenticated' || code === 'unauthorized'
      ? '// session not established · sign back in to manage your AFK state'
      : '// upstream unreachable · the console returns when Ashley comes back'
  return (
    <div className="mb-5 flex flex-col gap-2">
      <h1
        className="m-0 font-display uppercase leading-[0.95] text-text-primary"
        style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '0.01em' }}
      >
        {headline}
      </h1>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-muted">
        {subtext}
      </p>
    </div>
  )
}

function OperationalStrip({ handle }: { handle: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
      <span
        aria-hidden
        className="me-dot-pulse inline-block h-2 w-2 rounded-[1px]"
        style={{ background: '#FF0066', boxShadow: '0 0 8px #FF0066' }}
      />
      <span className="text-status-error">ROGUE_ARMY</span>
      <span>/</span>
      <span className="text-text-primary">STATUS MANAGEMENT</span>
      <span
        aria-hidden
        className="hidden h-px flex-1 min-w-10 max-w-[320px] bg-linear-to-r from-status-error/20 to-transparent sm:inline-block"
      />
      <span className="text-text-muted">OP · @{handle}</span>
    </div>
  )
}

