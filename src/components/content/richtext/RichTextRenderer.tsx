'use client'

import { useMemo } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { buildConverters, jsxConverters } from './converters'
import type { AccentName } from '@/components/content/reader/accent'

interface RichTextRendererProps {
  /** Lexical editor state data from Payload CMS */
  data: SerializedEditorState | null | undefined
  /** Optional className for the wrapper div */
  className?: string
  /**
   * Reader page accent. Threads through to the converters so headings,
   * frames, callout quotes, and list bullets all paint in the page channel.
   * When omitted, falls back to the default (green) converter set — keeps
   * existing callers that don't yet pass an accent working unchanged.
   */
  accent?: AccentName
  /**
   * Slugified-id → ordinal-label map. When provided, h2/h3 headings get
   * stamped with `data-sec-num` and render with the reader's display
   * ordinal chrome (matching the markdown body's h2 styling).
   */
  sectionMap?: ReadonlyMap<string, string>
}

/**
 * Renders Payload Lexical rich-text content. Accepts an optional `accent` +
 * `sectionMap` so the reader pipeline can match the markdown body's visual
 * identity — ordinal headings, framed images, accent-driven callouts.
 *
 * Without those props, falls back to the legacy default-green converters
 * for back-compat with non-reader callers.
 */
export function RichTextRenderer({
  data,
  className,
  accent,
  sectionMap,
}: RichTextRendererProps) {
  const converters = useMemo(() => {
    if (!accent && !sectionMap) return jsxConverters
    return buildConverters({ accent, sectionMap })
  }, [accent, sectionMap])

  if (!data) {
    return null
  }

  return (
    <div className={className}>
      <RichText data={data} converters={converters} />
    </div>
  )
}
