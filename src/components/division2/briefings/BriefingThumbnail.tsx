'use client'

import { useState } from 'react'
import { NoSignalPanel } from '@/components/content/reader/NoSignalPanel'

type Accent = 'cyan' | 'mod'

interface BriefingThumbnailProps {
  /** Remote thumbnail URL. When null/undefined OR the request fails at
   *  runtime, the NoSignal placeholder takes over. */
  src: string | null | undefined
  accent: Accent
  /** Used as the placeholder's `IMG_xxxx.bin` filename stamp. Falls back to
   *  `IMG_NULL` when omitted so we never render a dangling underscore. */
  fileNumber?: string
}

/**
 * Thumbnail slot for a BriefingCard. Renders the remote image when reachable
 * and swaps to the shared NoSignalPanel if the URL is missing OR fails to
 * load. Lives in a `'use client'` file solely so we can wire up `<img
 * onError>` — the placeholder itself is a server-component primitive in
 * `components/content/reader/NoSignalPanel.tsx`.
 */
export function BriefingThumbnail({ src, accent, fileNumber }: BriefingThumbnailProps) {
  const [errored, setErrored] = useState(false)
  const showPlaceholder = !src || errored
  // Map card accent → reader accent (cyan stays, mod → orange).
  const panelAccent = accent === 'cyan' ? 'cyan' : 'orange'

  if (showPlaceholder) {
    return (
      <NoSignalPanel
        accent={panelAccent}
        fileNumber={fileNumber ?? 'IMG_NULL'}
        size="card"
      />
    )
  }

  const tintClass =
    accent === 'cyan'
      ? 'bg-linear-to-tr from-rga-cyan/18 via-transparent to-transparent'
      : 'bg-linear-to-tr from-rga-mod/18 via-transparent to-transparent'

  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // Hide the broken-glyph immediately to avoid a single-frame flash
          // before React rerenders to the placeholder.
          e.currentTarget.style.visibility = 'hidden'
          setErrored(true)
        }}
        className="h-full w-full object-cover opacity-85 transition-all duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 mix-blend-screen ${tintClass}`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.18) 2px 3px)',
        }}
      />
    </>
  )
}
