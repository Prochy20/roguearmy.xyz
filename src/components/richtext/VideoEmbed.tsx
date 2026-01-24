'use client'

import { useEffect, useState } from 'react'
import { parseVideoUrl, getPlatformLabel, getContentTypeLabel, type ParsedVideoUrl } from '@/lib/video-embed'

interface VideoEmbedProps {
  url: string
  title?: string | null
}

/**
 * Corner bracket decoration component (matches existing theme)
 */
function Corner({
  position,
  colorClass = 'text-rga-cyan/40',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  colorClass?: string
}) {
  const rotations = { tl: '', tr: 'rotate-90', bl: '-rotate-90', br: 'rotate-180' }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={colorClass}>
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * Platform icon components
 */
function PlatformIcon({ platform, className = 'w-3 h-3' }: { platform: string; className?: string }) {

  switch (platform) {
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'vimeo':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
        </svg>
      )
    case 'twitch':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
      )
    case 'kick':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.143 0v24h8.571v-8.571L18.286 24h5.571L13.714 12 24 0h-6L8.571 9.429V0z" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * Get embed URL with dynamic parent domain for Twitch
 */
function getEmbedUrl(parsed: ParsedVideoUrl, parentDomain: string): string {
  if (parsed.platform === 'twitch') {
    return parsed.embedUrl.replace('PARENT_DOMAIN', parentDomain)
  }
  return parsed.embedUrl
}

/**
 * Get platform-specific accent color classes
 */
function getPlatformColors(platform: string): { bg: string; text: string; border: string; corner: string; containerBg: string } {
  const colors: Record<string, { bg: string; text: string; border: string; corner: string; containerBg: string }> = {
    youtube: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      corner: 'text-red-500/40',
      containerBg: 'bg-red-500/5',
    },
    vimeo: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      border: 'border-sky-500/20',
      corner: 'text-sky-500/40',
      containerBg: 'bg-sky-500/5',
    },
    twitch: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500/20',
      corner: 'text-purple-500/40',
      containerBg: 'bg-purple-500/5',
    },
    kick: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      corner: 'text-green-500/40',
      containerBg: 'bg-green-500/5',
    },
  }
  return colors[platform] || { bg: 'bg-rga-cyan/10', text: 'text-rga-cyan', border: 'border-rga-cyan/20', corner: 'text-rga-cyan/40', containerBg: 'bg-rga-cyan/5' }
}

/**
 * Frontend video embed renderer component.
 * Displays embedded videos with themed styling matching the site design.
 */
export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const [parentDomain, setParentDomain] = useState<string | null>(null)

  // Get parent domain for Twitch/Kick embeds (must wait for client-side)
  useEffect(() => {
    setParentDomain(window.location.hostname)
  }, [])

  const parsed = parseVideoUrl(url)

  // Twitch and Kick require the parent domain - wait for client-side hydration
  const needsParentDomain = parsed?.platform === 'twitch' || parsed?.platform === 'kick'
  const isReady = !needsParentDomain || parentDomain !== null

  if (!parsed) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
        Unable to load video: Invalid URL
      </div>
    )
  }

  const embedUrl = getEmbedUrl(parsed, parentDomain || 'localhost')
  const platformLabel = getPlatformLabel(parsed.platform)
  const contentTypeLabel = getContentTypeLabel(parsed.contentType)
  const colors = getPlatformColors(parsed.platform)
  const iframeTitle = title || `${platformLabel} ${contentTypeLabel}`

  return (
    <div className={`relative my-10 py-5 px-4 group ${colors.containerBg}`}>
      {/* Corner brackets */}
      <Corner position="tl" colorClass={colors.corner} />
      <Corner position="tr" colorClass={colors.corner} />
      <Corner position="bl" colorClass={colors.corner} />
      <Corner position="br" colorClass={colors.corner} />

      {/* Platform badge */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1 bg-bg-primary">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] rounded ${colors.bg} ${colors.text}`}
          >
            <PlatformIcon platform={parsed.platform} />
            {platformLabel}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-rga-gray/50">
            {contentTypeLabel}
          </span>
        </div>
      </div>

      {/* Video container - 16:9 aspect ratio */}
      <div className="relative w-full mt-3 aspect-video bg-bg-surface rounded-lg overflow-hidden border border-rga-green/10">
        {isReady ? (
          <iframe
            src={embedUrl}
            title={iframeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-pulse ${colors.text}`}>
              <PlatformIcon platform={parsed.platform} className="w-8 h-8" />
            </div>
          </div>
        )}
      </div>

      {/* Optional title caption */}
      {title && (
        <p className="mt-3 text-center text-sm text-rga-gray italic">
          {title}
        </p>
      )}
    </div>
  )
}

export default VideoEmbed
