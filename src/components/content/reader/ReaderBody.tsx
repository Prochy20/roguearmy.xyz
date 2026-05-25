'use client'

import { useMemo } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { MarkdownRenderer } from '@/components/content/markdown/MarkdownRenderer'
import { RichTextRenderer } from '@/components/content/richtext/RichTextRenderer'
import { createReaderMarkdownComponents } from './readerMarkdownComponents'
import type { AccentName } from './accent'
import type { ReaderSection } from '@/lib/content/markdown-sections'

/**
 * Discriminated source for the reader body. Markdown sources get the
 * server-side promote/enumerate/inject pipeline before they hit this layer;
 * Lexical sources arrive as their serialized editor state and render through
 * the accent-threaded converters.
 */
export type ReaderBodySource =
  | { type: 'markdown'; content: string }
  | { type: 'lexical'; data: SerializedEditorState }

interface ReaderBodyProps {
  /** Frequency-driven or topic-driven accent. Threaded into markdown
   * overrides AND the Lexical converters so both renderers paint the same
   * picture. */
  accent: AccentName
  source: ReaderBodySource
  /**
   * Pre-computed section list (also fed to the ToC). For Lexical content
   * the converters look up each heading's slugified id in this map to
   * decide whether to stamp `data-sec-num` and render the ordinal chrome.
   */
  sections?: readonly ReaderSection[]
}

/**
 * Reader body renderer. Dispatches between markdown (with reader-local
 * component overrides) and Lexical (with accent-threaded converters) based
 * on the source discriminator.
 *
 * For markdown sources, the body is already two transforms deep by the time
 * it arrives here:
 *  1. Citation transform (briefing only) — `(ref:UUID)` → `<sup>[N]</sup>` (server)
 *  2. Section anchoring — `## Title` → `<h2 id="sec-NN" data-sec-num="NN">Title</h2>` (server)
 *
 * For Lexical sources, the heading converter receives a section map keyed
 * by slugified heading text — no server-side rewriting required.
 *
 * Carries the same `manifesto-content` hook alongside `reader-body`. Pinning
 * `font-body text-text-secondary leading-[1.8]` on the wrapper is defensive —
 * every prose child sets these themselves, but it closes the door on any
 * subtle parent-chain inheritance that could pull a child toward `font-mono`
 * or a different color/leading via some surrounding chrome class.
 */
export function ReaderBody({ accent, source, sections }: ReaderBodyProps) {
  const markdownComponents = useMemo(
    () => createReaderMarkdownComponents(accent),
    [accent],
  )

  const sectionMap = useMemo(() => {
    if (!sections || sections.length === 0) return undefined
    return new Map(sections.map((s) => [s.id, s.numLabel]))
  }, [sections])

  return (
    <div className="reader-body manifesto-content mt-8 font-body text-text-secondary leading-[1.8]">
      {source.type === 'markdown' ? (
        <MarkdownRenderer
          content={source.content}
          componentsOverride={markdownComponents}
        />
      ) : (
        <RichTextRenderer
          data={source.data}
          accent={accent}
          sectionMap={sectionMap}
        />
      )}
    </div>
  )
}
