'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { markdownComponents } from './markdownComponents'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Full-featured markdown renderer with GitHub Flavored Markdown support.
 *
 * Features:
 * - Tables, task lists, strikethrough, autolinks (via remark-gfm)
 * - Syntax highlighting with Shiki (tokyo-night theme)
 * - Mermaid diagram rendering
 * - Raw HTML passthrough (via rehype-raw)
 * - Cyberpunk-themed styling matching the site design
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
