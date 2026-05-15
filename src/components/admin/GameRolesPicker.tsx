'use client'

import { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import type { components } from '@/lib/api/schema'

type DiscordRole = components['schemas']['DiscordRoleDto']

type RoleSnapshot = {
  id: string
  name: string
  color: string | null
}

type ProxyResponse =
  | { ok: true; data: DiscordRole[] }
  | { ok: false; error: { code: string; message?: string } }

function failureMessage(code: string): string {
  switch (code) {
    case 'unavailable':
      return 'Cannot reach the Discord role service right now. Try again in a minute.'
    case 'unauthenticated':
    case 'unauthorized':
      return 'Your admin session expired. Reload the page and log in again.'
    case 'forbidden':
      return 'This admin user is not authorized to load Discord roles.'
    default:
      return 'Failed to load Discord roles.'
  }
}

export const GameRolesPicker: JSONFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<RoleSnapshot[]>({ path })
  const selected: RoleSnapshot[] = Array.isArray(value) ? value : []

  const [liveRoles, setLiveRoles] = useState<DiscordRole[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorCode(null)
      try {
        const res = await fetch('/api/admin/discord-roles', { credentials: 'same-origin' })
        const body = (await res.json()) as ProxyResponse
        if (cancelled) return
        if (!body.ok) {
          setErrorCode(body.error.code || 'unknown')
          return
        }
        setLiveRoles(body.data)
      } catch {
        if (!cancelled) setErrorCode('unavailable')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedIds = useMemo(() => new Set(selected.map((r) => r.id)), [selected])

  const filteredRoles = useMemo(() => {
    const list = liveRoles ?? []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((r) => r.name.toLowerCase().includes(q))
  }, [liveRoles, search])

  const orphanedSelections = useMemo(() => {
    if (!liveRoles) return []
    const liveIds = new Set(liveRoles.map((r) => r.id))
    return selected.filter((r) => !liveIds.has(r.id))
  }, [liveRoles, selected])

  function toggleRole(role: DiscordRole) {
    if (selectedIds.has(role.id)) {
      setValue(selected.filter((r) => r.id !== role.id))
    } else {
      setValue([...selected, { id: role.id, name: role.name, color: role.color }])
    }
  }

  function removeRole(id: string) {
    setValue(selected.filter((r) => r.id !== id))
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {typeof field.label === 'string' ? field.label : 'Discord Roles'}
        {field.required && <span style={{ color: 'var(--theme-error-500)' }}> *</span>}
      </label>

      {field.admin?.description && typeof field.admin.description === 'string' && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-600)',
            marginBottom: '0.5rem',
            marginTop: 0,
          }}
        >
          {field.admin.description}
        </p>
      )}

      {errorCode && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--theme-error-100)',
            color: 'var(--theme-error-500)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          {failureMessage(errorCode)}
        </div>
      )}

      {selected.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.375rem',
            marginBottom: '0.75rem',
          }}
        >
          {selected.map((r) => {
            const orphaned = orphanedSelections.some((o) => o.id === r.id)
            return (
              <span
                key={r.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.5rem 0.25rem 0.75rem',
                  backgroundColor: 'var(--theme-elevation-100)',
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  opacity: orphaned ? 0.7 : 1,
                }}
                title={orphaned ? 'This role is no longer in Discord' : undefined}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: r.color || 'var(--theme-elevation-400)',
                  }}
                />
                <span>{r.name || r.id}</span>
                {orphaned && <span style={{ fontSize: '0.7rem', color: 'var(--theme-error-500)' }}>(missing)</span>}
                <button
                  type="button"
                  onClick={() => removeRole(r.id)}
                  aria-label={`Remove ${r.name || r.id}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '0 0.25rem',
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                >
                  &times;
                </button>
              </span>
            )
          })}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--theme-elevation-150)', paddingTop: '0.75rem' }}>
        <input
          type="text"
          placeholder={loading ? 'Loading Discord roles...' : 'Search roles...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading || !!errorCode}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            backgroundColor: 'var(--theme-elevation-50)',
            color: 'inherit',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        />

        {!loading && !errorCode && (
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-elevation-0)',
            }}
          >
            {filteredRoles.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'var(--theme-elevation-400)',
                  fontSize: '0.875rem',
                }}
              >
                No roles match your search.
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = selectedIds.has(role.id)
                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--theme-elevation-100)' : 'transparent',
                      borderBottom: '1px solid var(--theme-elevation-100)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                    />
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: role.color || 'var(--theme-elevation-400)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: isSelected ? 500 : 400 }}>{role.name}</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameRolesPicker
