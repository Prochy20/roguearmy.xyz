import type { ReactNode } from 'react'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie, getAshleyRefreshCookie } from '@/lib/auth/cookies'
import { createAshleyUserClient } from '@/lib/api/client'

export const metadata = {
  title: 'Auth Status | Rogue Army',
  description: 'Verify your local Discord session and Ashley sidecar session.',
}

// Server-rendered debug page. Calls Ashley directly (no refresh middleware)
// because server components cannot write cookies — if the access token has
// expired, the call will 401 and the user can re-login from here.
export default async function AuthStatusPage() {
  const memberAuth = await getMemberAuth()
  const ashleyAccess = await getAshleyAccessCookie()
  const ashleyRefresh = await getAshleyRefreshCookie()
  const ashleyMe = await callAshleyMe(ashleyAccess)

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold">Auth status</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Snapshot of your local session and the Ashley sidecar.
      </p>

      <Section title="Local session (rga_member_session)">
        <Row
          label="Authenticated"
          value={memberAuth.authenticated ? 'yes' : 'no'}
          tone={memberAuth.authenticated ? 'good' : 'bad'}
        />
        {memberAuth.member && (
          <>
            <Row label="Member ID" value={memberAuth.memberId ?? '—'} />
            <Row label="Discord ID" value={memberAuth.member.discordId} />
            <Row label="Username" value={memberAuth.member.username} />
            <Row label="Global name" value={memberAuth.member.globalName ?? '—'} />
            <Row
              label="Status"
              value={memberAuth.status ?? '—'}
              tone={memberAuth.status === 'active' ? 'good' : 'bad'}
            />
          </>
        )}
        {memberAuth.reason && <Row label="Reason" value={memberAuth.reason} />}
      </Section>

      <Section title="Ashley sidecar session">
        <Row
          label="rga_ashley_access cookie"
          value={ashleyAccess ? 'present' : 'missing'}
          tone={ashleyAccess ? 'good' : 'bad'}
        />
        <Row
          label="rga_ashley_refresh cookie"
          value={ashleyRefresh ? 'present' : 'missing'}
          tone={ashleyRefresh ? 'good' : 'bad'}
        />
        <Row
          label="GET /api/auth/me"
          value={summarize(ashleyMe)}
          tone={ashleyMe.kind === 'ok' ? 'good' : ashleyMe.kind === 'skipped' ? 'neutral' : 'bad'}
        />
        {(ashleyMe.kind === 'ok' || ashleyMe.kind === 'error') && ashleyMe.body !== undefined && (
          <pre className="m-3 overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(ashleyMe.body, null, 2)}
          </pre>
        )}
      </Section>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <a className="underline underline-offset-4" href="/auth/login">
          Re-login
        </a>
        <a className="underline underline-offset-4" href="/api/auth/logout">
          Logout
        </a>
        <a className="underline underline-offset-4" href="/blog">
          Continue to blog
        </a>
      </div>
    </main>
  )
}

type AshleyMeResult =
  | { kind: 'skipped' }
  | { kind: 'ok'; body: unknown }
  | { kind: 'error'; status: number; body?: unknown }
  | { kind: 'network'; message: string }

async function callAshleyMe(accessToken: string | undefined): Promise<AshleyMeResult> {
  if (!accessToken) return { kind: 'skipped' }
  try {
    const ashley = createAshleyUserClient(accessToken)
    const { data, error, response } = await ashley.GET('/api/auth/me')
    if (data) return { kind: 'ok', body: data }
    return { kind: 'error', status: response?.status ?? 0, body: error }
  } catch (err) {
    return { kind: 'network', message: err instanceof Error ? err.message : String(err) }
  }
}

function summarize(r: AshleyMeResult): string {
  switch (r.kind) {
    case 'skipped':
      return 'skipped (no access cookie)'
    case 'ok':
      return '200 ok'
    case 'error':
      return `error ${r.status}`
    case 'network':
      return `network error: ${r.message}`
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-medium">{title}</h2>
      <div className="divide-y divide-border rounded border border-border bg-card">
        {children}
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'good' | 'bad' | 'neutral'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-green-500'
      : tone === 'bad'
        ? 'text-red-500'
        : 'text-foreground'
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${toneClass}`}>{value}</span>
    </div>
  )
}
