'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { RichTextRenderer } from '@/components/richtext/RichTextRenderer'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { DataStreamLoader } from '@/components/loading/DataStreamLoader'
import { extractHeadingsFromMarkdown, type TOCHeading } from '@/lib/toc'
import type { ArticleContentSource } from '@/lib/articles'

interface ArticleContentProps {
  contentSource: ArticleContentSource
  /** Callback to provide extracted headings to parent (for wiki content) */
  onHeadingsExtracted?: (headings: TOCHeading[]) => void
}

/**
 * Renders article content from either Payload Lexical richText or Wiki markdown.
 */
export function ArticleContent({
  contentSource,
  onHeadingsExtracted,
}: ArticleContentProps) {
  if (contentSource.type === 'wiki' && contentSource.outlineDocumentId) {
    return (
      <WikiContent
        documentId={contentSource.outlineDocumentId}
        onHeadingsExtracted={onHeadingsExtracted}
      />
    )
  }

  // Payload Lexical content
  if (contentSource.content?.content) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="article-content"
      >
        <RichTextRenderer data={contentSource.content.content} />
      </motion.div>
    )
  }

  // Fallback for empty content
  return (
    <div className="text-rga-gray text-center py-12">
      <p>No content available for this article.</p>
    </div>
  )
}

/**
 * Client component to fetch and render wiki markdown content.
 */
function WikiContent({
  documentId,
  onHeadingsExtracted,
}: {
  documentId: string
  onHeadingsExtracted?: (headings: TOCHeading[]) => void
}) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/outline/documents/${documentId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch wiki content')
        }

        const data = await response.json()
        setContent(data.content)

        // Extract and report headings for TOC
        if (onHeadingsExtracted && data.content) {
          const headings = extractHeadingsFromMarkdown(data.content)
          onHeadingsExtracted(headings)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [documentId, onHeadingsExtracted])

  if (isLoading) {
    return <DataStreamLoader statusMessage="RETRIEVING TRANSMISSION" />
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p>Failed to load content: {error}</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-rga-gray text-center py-12">
        <p>No content available for this article.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="article-content"
    >
      <MarkdownRenderer content={content} />
    </motion.div>
  )
}
