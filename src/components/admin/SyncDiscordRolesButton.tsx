'use client'

import { useState, useTransition } from 'react'
import { syncDiscordRoles, type SyncResult } from '@/actions/syncDiscordRoles'

export function SyncDiscordRolesButton() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<SyncResult | null>(null)

  const handleClick = () => {
    setResult(null)
    startTransition(async () => {
      const res = await syncDiscordRoles()
      setResult(res)
    })
  }

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.875rem 1rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m, 4px)',
        backgroundColor: 'var(--theme-elevation-50)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem 1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          aria-busy={pending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            backgroundColor: 'var(--theme-elevation-200)',
            border: '1px solid var(--theme-elevation-250)',
            borderRadius: 'var(--style-radius-s, 4px)',
            cursor: pending ? 'wait' : 'pointer',
            transition: 'background-color 120ms ease, border-color 120ms ease',
            lineHeight: 1,
            opacity: pending ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (pending) return
            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-250)'
            e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
          }}
          onMouseLeave={(e) => {
            if (pending) return
            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200)'
            e.currentTarget.style.borderColor = 'var(--theme-elevation-250)'
          }}
        >
          {pending && <Spinner />}
          {pending ? 'Syncing…' : 'Sync from Discord'}
        </button>
        <span
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-600)',
          }}
        >
          Pull the latest role list from the guild.
        </span>
      </div>

      <SyncStatus result={result} pending={pending} />
    </div>
  )
}

export default SyncDiscordRolesButton

// ─── Status line ──────────────────────────────────────────────────────────

function SyncStatus({ result, pending }: { result: SyncResult | null; pending: boolean }) {
  if (pending) {
    return (
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--theme-elevation-600)',
        }}
      >
        Querying Discord…
      </span>
    )
  }

  if (!result) return null

  if (result.ok) {
    const { created, updated, deleted } = result.data
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          color: 'var(--theme-success-500)',
        }}
      >
        <CheckIcon />
        {created} created · {updated} updated · {deleted} deleted
      </span>
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8125rem',
        color: 'var(--theme-error-500)',
      }}
    >
      <AlertIcon />
      {failureMessage(result.error.code)}
    </span>
  )
}

function failureMessage(code: string): string {
  switch (code) {
    case 'unauthenticated':
      return 'Admin session expired — reload and log in again.'
    case 'forbidden':
      return 'Not authorized to sync Discord roles.'
    case 'unavailable':
      return 'Cannot reach the Discord role service.'
    case 'empty_response':
      return 'Empty live response — sync aborted to protect existing data.'
    default:
      return 'Sync failed.'
  }
}

// ─── Inline icons ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'sync-spin 0.8s linear infinite' }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <style>{`@keyframes sync-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 12.5L10 17.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 8V13M12 16.5V17M3 19h18L12 4 3 19z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
