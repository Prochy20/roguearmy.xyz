'use client'

import { useMemo } from 'react'
import { MarkdownRenderer } from '@/components/content/markdown/MarkdownRenderer'
import { createDigestMarkdownComponents } from './digestMarkdownComponents'
import type { AccentName } from './accent'

interface DigestBriefingProps {
  /** Markdown body with citation markers AND section anchors already injected. */
  content: string
  /** Frequency-driven accent — flips h2 ordinals, callouts, frame ticks. */
  accent: AccentName
}

/**
 * Digest body renderer. Builds a per-page component override map from the
 * accent prop and hands it to the shared `MarkdownRenderer`. The override
 * map is memoized against accent so the renderer's component identity stays
 * stable across re-renders within the same digest.
 *
 * The body is already two transforms deep by the time it arrives here:
 *  1. Citation transform — `(ref:UUID)` → `<sup>[N]</sup>` (server)
 *  2. Section anchoring — `## Title` → `<h2 id="sec-NN" data-sec-num="NN">Title</h2>` (server)
 *
 * Both shape the AST so that this client renderer just maps elements to
 * their digest-local visual treatments.
 */
export function DigestBriefing({ content, accent }: DigestBriefingProps) {
  const components = useMemo(
    () => createDigestMarkdownComponents(accent),
    [accent],
  )

  // Carries the same `manifesto-content` hook alongside `digest-briefing`,
  // matching `mt-8` spacing parity with the manifesto's content wrapper. The
  // shared `MarkdownRenderer` already gives both surfaces the same
  // paragraph / strong / em / blockquote / list defaults via
  // `markdownComponents.tsx`; only headings, images, callouts, and external
  // links diverge through the digest-local override map below.
  //
  // Explicit `font-body text-text-secondary leading-[1.8]` on the wrapper is
  // defensive — every prose child sets these themselves, but pinning them at
  // the wrapper closes the door on any subtle parent-chain inheritance that
  // could pull a child toward `font-mono` or a different color/leading via
  // some surrounding chrome class.
  return (
    <div className="digest-briefing manifesto-content mt-8 font-body text-text-secondary leading-[1.8]">
      <MarkdownRenderer content={content} componentsOverride={components} />
    </div>
  )
}
