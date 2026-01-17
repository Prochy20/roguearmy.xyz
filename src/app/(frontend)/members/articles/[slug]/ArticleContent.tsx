'use client'

import { motion } from 'motion/react'

interface ArticleContentProps {
  content: string
}

/**
 * Renders article content with cyberpunk-styled typography.
 * Full-width breathing layout with dramatic headings.
 */
export function ArticleContent({ content }: ArticleContentProps) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType
      elements.push(
        <ListTag
          key={elements.length}
          className={
            listType === 'ul'
              ? 'space-y-3 text-text-secondary mb-8 pl-0'
              : 'space-y-3 text-text-secondary mb-8 pl-0'
          }
        >
          {listItems.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-base md:text-lg leading-relaxed"
            >
              <span className="text-rga-green mt-2 flex-shrink-0">
                {listType === 'ul' ? (
                  <span className="block w-1.5 h-1.5 bg-rga-green rounded-full" />
                ) : (
                  <span className="font-mono text-sm">{i + 1}.</span>
                )}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ListTag>
      )
      listItems = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      flushList()
      return
    }

    // H1 - Major section header
    if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(
        <h1
          key={index}
          className="relative font-display text-2xl md:text-3xl lg:text-4xl text-white mt-16 mb-8 first:mt-0"
        >
          {/* Accent line */}
          <span className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-rga-green to-transparent hidden lg:block" />
          <span className="text-glow-green">{trimmed.slice(2)}</span>
        </h1>
      )
      return
    }

    // H2 - Section header
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2
          key={index}
          className="font-display text-xl md:text-2xl text-rga-cyan mt-12 mb-5 flex items-center gap-3"
        >
          <span className="w-8 h-px bg-rga-cyan/50" />
          {trimmed.slice(3)}
        </h2>
      )
      return
    }

    // H3 - Subsection header
    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3
          key={index}
          className="font-bold text-lg md:text-xl text-white mt-8 mb-4 tracking-wide"
        >
          {trimmed.slice(4)}
        </h3>
      )
      return
    }

    // Unordered list item
    if (trimmed.startsWith('- ')) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(trimmed.slice(2))
      return
    }

    // Ordered list item
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(orderedMatch[2])
      return
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p
        key={index}
        className="text-text-secondary text-base md:text-lg leading-[1.8] mb-6"
      >
        {parseInlineMarkdown(trimmed)}
      </p>
    )
  })

  // Flush any remaining list
  flushList()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="article-content"
    >
      {elements}
    </motion.div>
  )
}

/**
 * Parse inline markdown like **bold** and `code`
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) {
        parts.push(<span key={key++}>{boldMatch[1]}</span>)
      }
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {boldMatch[2]}
        </strong>
      )
      remaining = boldMatch[3]
      continue
    }

    // Check for inline code `code`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) {
        parts.push(<span key={key++}>{codeMatch[1]}</span>)
      }
      parts.push(
        <code
          key={key++}
          className="px-2 py-1 bg-bg-surface/80 text-rga-magenta rounded border border-rga-magenta/20 text-sm font-mono"
        >
          {codeMatch[2]}
        </code>
      )
      remaining = codeMatch[3]
      continue
    }

    // No more matches, add remaining text
    parts.push(<span key={key++}>{remaining}</span>)
    break
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}
