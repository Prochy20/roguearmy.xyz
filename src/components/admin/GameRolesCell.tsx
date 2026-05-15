'use client'

import { useEffect, useState } from 'react'
import type { DefaultCellComponentProps } from 'payload'
import type { components } from '@/lib/api/schema'

type DiscordRole = components['schemas']['DiscordRoleDto']

type ProxyResponse =
  | { ok: true; data: DiscordRole[] }
  | { ok: false; error: { code: string; message?: string } }

type RoleSnapshot = { id: string; name?: string; color?: string | null }

// Shared across all rows on the list page: one fetch per page load, every Cell
// awaits the same promise. Stays resolved for the SPA session — reload to refresh.
let liveRolesPromise: Promise<Set<string> | null> | null = null

function getLiveRoleIds(): Promise<Set<string> | null> {
  if (liveRolesPromise) return liveRolesPromise
  liveRolesPromise = (async () => {
    try {
      const res = await fetch('/api/admin/discord-roles', { credentials: 'same-origin' })
      const body = (await res.json()) as ProxyResponse
      if (!body.ok) return null
      return new Set(body.data.map((r) => r.id))
    } catch {
      return null
    }
  })()
  return liveRolesPromise
}

export const GameRolesCell: React.FC<DefaultCellComponentProps> = ({ cellData }) => {
  const roles: RoleSnapshot[] = Array.isArray(cellData) ? (cellData as RoleSnapshot[]) : []
  const [missingCount, setMissingCount] = useState<number | null>(null)
  const [liveAvailable, setLiveAvailable] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    getLiveRoleIds().then((liveIds) => {
      if (cancelled) return
      if (liveIds === null) {
        setLiveAvailable(false)
        return
      }
      const missing = roles.reduce((n, r) => (r?.id && !liveIds.has(r.id) ? n + 1 : n), 0)
      setMissingCount(missing)
    })
    return () => {
      cancelled = true
    }
  }, [roles])

  const total = roles.length

  if (total === 0) {
    return <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <span>
        {total} {total === 1 ? 'role' : 'roles'}
      </span>
      {missingCount !== null && missingCount > 0 && (
        <span
          style={{
            padding: '0.125rem 0.5rem',
            borderRadius: '999px',
            backgroundColor: 'var(--theme-error-100)',
            color: 'var(--theme-error-500)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
          title="These roles are no longer in Discord. Open the doc to remove and re-pair."
        >
          {missingCount} missing
        </span>
      )}
      {!liveAvailable && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-400)',
          }}
          title="Couldn't reach the Discord role service to verify."
        >
          (unverified)
        </span>
      )}
    </span>
  )
}

export default GameRolesCell
