'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeRaw from 'rehype-raw'
import { markdownComponents } from './markdownComponents'
import { remarkCallouts } from './remarkCallouts'

interface MarkdownRendererProps {
  content: string
  className?: string
  /** Per-surface component overrides merged on top of the shared map. */
  componentsOverride?: Partial<Components>
}

/**
 * Full-featured markdown renderer with GitHub Flavored Markdown support.
 *
 * Features:
 * - Tables, task lists, strikethrough, autolinks (via remark-gfm)
 * - Callouts/admonitions (:::info, :::warning, etc.)
 * - Syntax highlighting with Shiki (tokyo-night theme)
 * - Mermaid diagram rendering
 * - Raw HTML passthrough (via rehype-raw)
 * - Cyberpunk-themed styling matching the site design
 *
 * Pass `componentsOverride` to swap individual element renderers for a single
 * surface without forking the shared map — used by the briefing detail to
 * supply its own h2 / aside / img treatments.
 */
export function MarkdownRenderer({
  content,
  className,
  componentsOverride,
}: MarkdownRendererProps) {
  const components = componentsOverride
    ? { ...markdownComponents, ...componentsOverride }
    : markdownComponents
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCallouts]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
