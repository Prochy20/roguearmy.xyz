'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  setAfk,
  clearAfk,
} from '@/app/(frontend)/(with-chrome)/afk/actions'
import type { AshleyError } from '@/lib/api/server'

type Intent = 'active' | 'afk'

const REASON_MAX = 80

interface SetStatusFormProps {
  currentStatus: Intent
  /** Existing reason when AFK, shown disabled (frozen per session). */
  currentReason: string | null
}

export function SetStatusForm({
  currentStatus,
  currentReason,
}: SetStatusFormProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<AshleyError | null>(null)
  const [pending, startTransition] = useTransition()

  const intent: Intent = currentStatus === 'active' ? 'afk' : 'active'
  const blockedByConfig = error?.status === 412

  const textareaEditable = intent === 'afk'
  const textareaValue = textareaEditable ? reason : (currentReason ?? '')
  const charCount = textareaEditable ? reason.length : (currentReason?.length ?? 0)

  const buttonLabel = (() => {
    if (pending) return intent === 'afk' ? 'GOING AFK…' : 'RETURNING…'
    return intent === 'afk' ? 'GO AFK' : 'GO ACTIVE'
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pending || blockedByConfig) return

    startTransition(async () => {
      const result =
        intent === 'afk' ? await setAfk(buildFormData(reason)) : await clearAfk()

      if (result.ok) {
        setError(null)
        setReason('')
        router.refresh()
        return
      }

      setError(result.error)
      // 409: bot set AFK in parallel → sync state by refreshing page.
      if (result.error.status === 409) router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Eyebrow>// SEC_01 · SET STATUS</Eyebrow>

      <ReasonField
        value={textareaValue}
        editable={textareaEditable}
        onChange={setReason}
        charCount={charCount}
        currentStatus={currentStatus}
        disabledByPending={pending}
      />

      <SubmitBar
        label={buttonLabel}
        active={!pending}
        disabled={pending || blockedByConfig}
      />

      {error && !pending && <ErrorPanel error={error} intent={intent} />}

      <Caption>
        // afk applies a role + nickname prefix · reason is optional
      </Caption>
    </form>
  )
}

function buildFormData(reason: string): FormData {
  const fd = new FormData()
  const trimmed = reason.trim()
  if (trimmed.length > 0) fd.set('reason', trimmed)
  return fd
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-rga-green">
      {children}
    </div>
  )
}

function ReasonField({
  value,
  editable,
  onChange,
  charCount,
  currentStatus,
  disabledByPending,
}: {
  value: string
  editable: boolean
  onChange: (next: string) => void
  charCount: number
  currentStatus: Intent
  disabledByPending: boolean
}) {
  const placeholder =
    currentStatus === 'afk'
      ? value.length === 0
        ? '// no reason set'
        : ''
      : '// optional reason · max 80 chars'
  return (
    <div className="border border-[rgba(255,255,255,0.08)]">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editable || disabledByPending}
        maxLength={REASON_MAX}
        rows={2}
        placeholder={placeholder}
        className={cn(
          'block w-full resize-none bg-transparent px-4 py-3 font-mono text-[14px] text-text-primary placeholder:text-text-muted placeholder:tracking-[0.22em] placeholder:uppercase',
          'focus:outline-none focus:ring-1 focus:ring-status-error/40',
          'disabled:cursor-not-allowed disabled:text-text-muted',
        )}
      />
      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
        <span>{editable ? '// reason' : ''}</span>
        <span>
          {charCount}/{REASON_MAX}
        </span>
      </div>
    </div>
  )
}

function SubmitBar({
  label,
  active,
  disabled,
}: {
  label: string
  active: boolean
  disabled: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'border px-4 py-4 font-mono text-[12px] uppercase tracking-[0.3em] transition-colors',
        active
          ? 'border-status-error/40 bg-status-error/[0.05] text-status-error hover:bg-status-error/[0.1]'
          : 'border-[rgba(255,255,255,0.08)] text-text-muted',
        'disabled:cursor-not-allowed',
      )}
    >
      {label}
    </button>
  )
}

function ErrorPanel({ error, intent }: { error: AshleyError; intent: Intent }) {
  const { headline, body } = errorCopy(error, intent)
  return (
    <div className="border border-status-error/30 bg-status-error/[0.04] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-status-error">
        // {headline}
      </div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
        {body}
      </div>
    </div>
  )
}

function errorCopy(
  error: AshleyError,
  intent: Intent,
): { headline: string; body: string } {
  if (error.status === 412) {
    return {
      headline: 'AFK ROLE NOT CONFIGURED',
      body: 'Contact staff — Ashley is missing the AFK role binding.',
    }
  }
  if (error.status === 409) {
    return {
      headline: 'STATE OUT OF SYNC',
      body:
        intent === 'afk'
          ? 'Already AFK upstream. State refreshed — re-submit if needed.'
          : 'Already active upstream. State refreshed — re-submit if needed.',
    }
  }
  switch (error.code) {
    case 'unauthenticated':
    case 'unauthorized':
      return {
        headline: 'SESSION EXPIRED',
        body: 'Sign in again to manage your AFK state.',
      }
    case 'not_found':
      return {
        headline: 'GUILD MEMBERSHIP LOST',
        body: 'You are not a current member of the bound guild.',
      }
    case 'unavailable':
      return {
        headline: 'COMMS DOWN',
        body: 'Status service unreachable. Try again in a moment.',
      }
    default:
      return {
        headline: 'UPSTREAM REJECTED',
        body: 'Request failed. Retry, then ping staff if it persists.',
      }
  }
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
      {children}
    </p>
  )
}
