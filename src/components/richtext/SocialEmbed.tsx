'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { parseSocialUrl, getPlatformLabel, getContentTypeLabel, type ParsedSocialUrl, type SocialPlatform } from '@/lib/social-embed'

// Lazy load embed components to avoid SSR issues
const TwitterEmbed = lazy(() =>
  import('react-social-media-embed').then((mod) => ({ default: mod.TwitterEmbed }))
)
const InstagramEmbed = lazy(() =>
  import('react-social-media-embed').then((mod) => ({ default: mod.InstagramEmbed }))
)
const TikTokEmbed = lazy(() =>
  import('react-social-media-embed').then((mod) => ({ default: mod.TikTokEmbed }))
)

interface SocialEmbedProps {
  url: string
  caption?: string | null
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
function PlatformIcon({ platform, className = 'w-3 h-3' }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * Get platform-specific accent color classes
 */
function getPlatformColors(platform: SocialPlatform): { bg: string; text: string; corner: string; containerBg: string } {
  const colors: Record<SocialPlatform, { bg: string; text: string; corner: string; containerBg: string }> = {
    twitter: {
      bg: 'bg-neutral-800',
      text: 'text-white',
      corner: 'text-neutral-500/40',
      containerBg: 'bg-neutral-900/5',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
      text: 'text-white',
      corner: 'text-pink-500/40',
      containerBg: 'bg-pink-500/5',
    },
    tiktok: {
      bg: 'bg-neutral-800',
      text: 'text-white',
      corner: 'text-neutral-500/40',
      containerBg: 'bg-neutral-900/5',
    },
  }
  return colors[platform]
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton({ platform }: { platform: SocialPlatform }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-rga-gray/50">
      <div className="animate-pulse">
        <PlatformIcon platform={platform} className="w-10 h-10" />
      </div>
      <div className="text-sm">Loading {getPlatformLabel(platform)} embed...</div>
    </div>
  )
}

/**
 * Error fallback component
 */
function ErrorFallback({ parsed }: { parsed: ParsedSocialUrl }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-rga-gray/30">
        <PlatformIcon platform={parsed.platform} className="w-8 h-8" />
      </div>
      <div className="text-center">
        <p className="text-sm text-rga-gray/70 mb-2">Unable to load embed</p>
        <a
          href={parsed.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-rga-cyan hover:text-rga-green transition-colors underline underline-offset-2"
        >
          View on {getPlatformLabel(parsed.platform)}
        </a>
      </div>
    </div>
  )
}

/**
 * Embed component wrapper with error boundary behavior
 */
function EmbedWrapper({ parsed }: { parsed: ParsedSocialUrl }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <ErrorFallback parsed={parsed} />
  }

  const handleError = () => setHasError(true)

  return (
    <Suspense fallback={<LoadingSkeleton platform={parsed.platform} />}>
      {/* Reset any margins from embed library */}
      <div className="[&>div]:!m-0 [&>div>div]:!m-0 w-full">
        {parsed.platform === 'twitter' && (
          <TwitterEmbed
            url={parsed.originalUrl}
            width="100%"
            onError={handleError}
            // @ts-expect-error - library types require tweetId but it's extracted from URL internally
            twitterTweetEmbedProps={{ options: { theme: 'dark' } }}
          />
        )}
        {parsed.platform === 'instagram' && (
          <InstagramEmbed
            url={parsed.originalUrl}
            width="100%"
            onError={handleError}
          />
        )}
        {parsed.platform === 'tiktok' && (
          <TikTokEmbed
            url={parsed.originalUrl}
            width="100%"
            onError={handleError}
          />
        )}
      </div>
    </Suspense>
  )
}

/**
 * Frontend social media embed renderer component.
 * Displays embedded social posts with themed styling matching the site design.
 */
export function SocialEmbed({ url, caption }: SocialEmbedProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Wait for client-side mount to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const parsed = parseSocialUrl(url)

  if (!parsed) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
        Unable to load social embed: Invalid URL
      </div>
    )
  }

  const platformLabel = getPlatformLabel(parsed.platform)
  const contentTypeLabel = getContentTypeLabel(parsed.contentType)
  const colors = getPlatformColors(parsed.platform)

  return (
    <div className={`relative my-10 py-5 px-4 ${colors.containerBg}`}>
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

      {/* Embed container - invisible, just for layout */}
      <div className="relative w-full mt-3 flex justify-center">
        <div className="w-full max-w-[550px]">
          {isMounted ? (
            <EmbedWrapper parsed={parsed} />
          ) : (
            <LoadingSkeleton platform={parsed.platform} />
          )}
        </div>
      </div>

      {/* Optional caption */}
      {caption && (
        <p className="mt-3 text-center text-sm text-rga-gray italic">
          {caption}
        </p>
      )}
    </div>
  )
}

export default SocialEmbed
