'use client'

import { useState } from 'react'
import Image from 'next/image'
import { NoSignalPanel } from './NoSignalPanel'
import type { AccentName } from './accent'

interface ReaderHeroImageProps {
  /** Remote image URL. Nullable — when missing OR the request fails, the
   *  NoSignalPanel takes over. */
  src: string | null | undefined
  accent: AccentName
  /** Placeholder filename stamp (e.g. `IMG_7B2B`). Defaults to `IMG_NULL`. */
  fileNumber?: string
}

/**
 * Interior of the ReaderHeroFrame — owns the hero image plus the vignette
 * overlay that grounds the bottom metadata bar against bright photos. Marked
 * `'use client'` so it can wire `onError` and fall through to NoSignalPanel
 * when the URL is missing or fails to load.
 *
 * The parent frame (corner ticks, documentary plate, film-strip metadata
 * bar) stays server-rendered.
 */
export function ReaderHeroImage({ src, accent, fileNumber }: ReaderHeroImageProps) {
  const [errored, setErrored] = useState(false)
  const showPlaceholder = !src || errored

  if (showPlaceholder) {
    return (
      <div className="absolute inset-0">
        <NoSignalPanel
          accent={accent}
          fileNumber={fileNumber ?? 'IMG_NULL'}
          size="hero"
        />
      </div>
    )
  }

  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 60vw, (min-width: 1024px) 70vw, 100vw"
        onError={() => setErrored(true)}
        className="object-cover opacity-95"
      />
      {/* Vignette — anchors the bottom metadata bar against bright photos.
          Only painted when an image actually renders; the placeholder
          handles its own bottom contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-void/85 via-void/10 to-transparent"
      />
    </>
  )
}
