'use client'

import { useField } from '@payloadcms/ui'
import { parseVideoUrl, getPlatformLabel, getContentTypeLabel } from '@/lib/video-embed'

/**
 * Admin preview component for VideoEmbed block.
 * Shows live thumbnail preview and platform detection.
 */
export function VideoEmbedPreview() {
  const { value: url } = useField<string>({ path: 'url' })

  if (!url) {
    return null
  }

  const parsed = parseVideoUrl(url)

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
        Unable to parse URL. Please check the URL format.
      </div>
    )
  }

  const { platform, contentType, id, thumbnailUrl } = parsed

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
            backgroundColor: getPlatformColor(platform),
            color: 'white',
            borderRadius: '4px',
          }}
        >
          {getPlatformIcon(platform)}
          {getPlatformLabel(platform)}
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
          {getContentTypeLabel(contentType)}
        </span>
      </div>

      {/* ID */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-600)',
          marginBottom: thumbnailUrl ? '0.75rem' : 0,
        }}
      >
        ID: <code style={{ fontFamily: 'monospace' }}>{id}</code>
      </div>

      {/* Thumbnail Preview */}
      {thumbnailUrl && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px',
            aspectRatio: '16/9',
            backgroundColor: 'var(--theme-elevation-100)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Hide broken image
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Play button overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    youtube: '#FF0000',
    vimeo: '#1AB7EA',
    twitch: '#9146FF',
    kick: '#53FC18',
  }
  return colors[platform] || '#666'
}

function getPlatformIcon(platform: string): React.ReactNode {
  switch (platform) {
    case 'youtube':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'vimeo':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
        </svg>
      )
    case 'twitch':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
      )
    case 'kick':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.143 0v24h8.571v-8.571L18.286 24h5.571L13.714 12 24 0h-6L8.571 9.429V0z" />
        </svg>
      )
    default:
      return null
  }
}

export default VideoEmbedPreview
