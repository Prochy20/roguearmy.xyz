'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

interface SlimMember {
  discordId: string
  displayName: string
  avatar: string | null
}

interface ApiOk {
  ok: true
  data: SlimMember[]
}

interface ApiErr {
  ok: false
  error: { code?: string; status?: number }
}

const SEARCH_DEBOUNCE_MS = 250
const MIN_QUERY_LEN = 2

const StaffDiscordPicker: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SlimMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [hydrating, setHydrating] = useState(false)
  const [selected, setSelected] = useState<SlimMember | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hydrate the currently-stored discordId on mount so we can show the
  // selected member's name/avatar instead of just the snowflake. Skipped
  // when the field is empty (new row) or when the chip is already showing
  // the correct member (re-running on every render would loop).
  const selectedDiscordId = selected?.discordId ?? null
  useEffect(() => {
    if (!value || selectedDiscordId === value) return
    setHydrating(true)
    const ac = new AbortController()
    fetch(`/api/admin/staff-members-autocomplete?ids=${encodeURIComponent(value)}&limit=1`, {
      signal: ac.signal,
    })
      .then((r) => r.json() as Promise<ApiOk | ApiErr>)
      .then((data) => {
        if (data.ok && data.data[0]) {
          setSelected(data.data[0])
        }
      })
      .catch(() => {
        /* ignore — keep selected as-is */
      })
      .finally(() => setHydrating(false))
    return () => ac.abort()
  }, [value, selectedDiscordId])

  // Debounced search whenever the query changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (query.trim().length < MIN_QUERY_LEN) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      const ac = new AbortController()
      abortRef.current = ac
      try {
        const res = await fetch(
          `/api/admin/staff-members-autocomplete?q=${encodeURIComponent(query.trim())}&limit=20`,
          { signal: ac.signal },
        )
        const data = (await res.json()) as ApiOk | ApiErr
        if (!data.ok) {
          setError(`Ashley returned ${data.error.code ?? 'an error'}`)
          setResults([])
          return
        }
        setResults(data.data)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError('Network error reaching Ashley')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handlePick = useCallback(
    (member: SlimMember) => {
      setValue(member.discordId)
      setSelected(member)
      setOpen(false)
      setQuery('')
      setResults([])
    },
    [setValue],
  )

  const handleClear = useCallback(() => {
    setValue('')
    setSelected(null)
    setQuery('')
  }, [setValue])

  const fieldLabel = useMemo(
    () => (typeof field.label === 'string' ? field.label : 'Discord Operative'),
    [field.label],
  )

  const description =
    typeof field.admin?.description === 'string' ? field.admin.description : undefined

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
        {fieldLabel}
        {field.required && <span style={{ color: 'var(--theme-error-500)' }}> *</span>}
      </label>

      {description && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-600)',
            marginBottom: '0.5rem',
            marginTop: 0,
          }}
        >
          {description}
        </p>
      )}

      {error && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--theme-error-100)',
            color: 'var(--theme-error-500)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: '0.8125rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Selected operative chip + clear button */}
      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
          }}
        >
          {selected?.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.avatar}
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: '50%', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>
              {hydrating
                ? 'Loading…'
                : selected?.displayName ?? '(unknown — member may have left)'}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--theme-elevation-500)',
                marginTop: '2px',
              }}
            >
              {value}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: '1px solid var(--theme-elevation-200)',
              color: 'var(--theme-elevation-600)',
              padding: '0.25rem 0.625rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {/* Search input — always shown so editors can replace a selection */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={value ? 'Search to replace…' : 'Search by name…'}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            color: 'inherit',
            fontSize: '0.875rem',
          }}
        />

        {open && (query.trim().length >= MIN_QUERY_LEN || loading) && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              marginTop: '4px',
              zIndex: 100,
              maxHeight: '320px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'var(--theme-elevation-500)',
                  fontSize: '0.875rem',
                }}
              >
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'var(--theme-elevation-500)',
                  fontSize: '0.875rem',
                }}
              >
                No matches for “{query.trim()}”
              </div>
            ) : (
              results.map((m) => (
                <div
                  key={m.discordId}
                  onClick={() => handlePick(m)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                  }}
                >
                  {m.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.avatar}
                      alt=""
                      width={28}
                      height={28}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'var(--theme-elevation-150)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{m.displayName}</div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'var(--theme-elevation-500)',
                        marginTop: '2px',
                      }}
                    >
                      {m.discordId}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Click-outside catcher */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
        />
      )}
    </div>
  )
}

export default StaffDiscordPicker
