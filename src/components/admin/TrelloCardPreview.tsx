'use client'

import { useField } from '@payloadcms/ui'
import { parseTrelloUrl } from '@/lib/trello-card'

/**
 * Trello icon component
 */
function TrelloIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .795-.645 1.44-1.44 1.44h-4.44c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
  )
}

/**
 * Admin preview component for TrelloCard block.
 * Shows parsed card info and public board requirement.
 */
export function TrelloCardPreview() {
  const { value: url } = useField<string>({ path: 'url' })

  if (!url) {
    return null
  }

  const parsed = parseTrelloUrl(url)

  if (!parsed) {
    return (
      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--theme-error-100)',
          border: '1px solid var(--theme-error-500)',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: 'var(--theme-error-500)',
        }}
      >
        Unable to parse URL. Please use format: trello.com/c/&#123;cardId&#125;/&#123;optional-name&#125;
      </div>
    )
  }

  const { shortLink, slug } = parsed

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '1rem',
        backgroundColor: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
      }}
    >
      {/* Platform and Content Type Badges */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: '#0079BF',
            color: 'white',
            borderRadius: '4px',
          }}
        >
          <TrelloIcon />
          Trello
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: 'var(--theme-elevation-150)',
            color: 'var(--theme-text)',
            borderRadius: '4px',
          }}
        >
          Card
        </span>
      </div>

      {/* Card info */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-600)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div>
          Short Link: <code style={{ fontFamily: 'monospace' }}>{shortLink}</code>
        </div>
        {slug && (
          <div>
            Slug: <code style={{ fontFamily: 'monospace' }}>{slug}</code>
          </div>
        )}
      </div>

      {/* Public board note */}
      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--theme-warning-100)',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: 'var(--theme-warning-600)',
        }}
      >
        Note: Only cards from public boards can be embedded. Private board cards will show an error.
      </div>

      {/* Link to original */}
      <div style={{ marginTop: '0.75rem' }}>
        <a
          href={parsed.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: '#0079BF',
            textDecoration: 'underline',
          }}
        >
          Open in Trello
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default TrelloCardPreview
