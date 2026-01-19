'use client'

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { jsxConverters } from './converters'

interface RichTextRendererProps {
  /** Lexical editor state data from Payload CMS */
  data: SerializedEditorState | null | undefined
  /** Optional className for the wrapper div */
  className?: string
}

/**
 * RichTextRenderer component for rendering Payload CMS Lexical rich text content.
 *
 * Uses custom JSX converters that match the styling from markdownComponents.tsx
 * for visual consistency between Wiki content and Payload articles.
 *
 * Features:
 * - Headings with font-display, glows, decorations, and IDs for TOC
 * - Green bullet points for lists
 * - Cyan links with external icon
 * - Tables with corner bracket decorations
 * - Code blocks with Shiki syntax highlighting
 * - Callout blocks (info, warning, tip, success, danger, error, note)
 * - Mermaid diagram support
 */
export function RichTextRenderer({ data, className }: RichTextRendererProps) {
  if (!data) {
    return null
  }

  return (
    <div className={className}>
      <RichText data={data} converters={jsxConverters} />
    </div>
  )
}
