'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { MarkdownRenderer } from '@/components/markdown'
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
        className="article-content prose prose-invert prose-lg max-w-none
          prose-headings:font-display prose-headings:text-white
          prose-h1:text-2xl prose-h1:md:text-3xl prose-h1:lg:text-4xl prose-h1:mt-16 prose-h1:mb-8 prose-h1:first:mt-0
          prose-h2:text-xl prose-h2:md:text-2xl prose-h2:text-rga-cyan prose-h2:mt-12 prose-h2:mb-5
          prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6
          prose-strong:text-white prose-strong:font-semibold
          prose-code:px-2 prose-code:py-1 prose-code:bg-bg-surface/80 prose-code:text-rga-magenta prose-code:rounded prose-code:border prose-code:border-rga-magenta/20 prose-code:text-sm prose-code:font-mono
          prose-ul:space-y-3 prose-ul:text-text-secondary prose-ul:mb-8 prose-ul:pl-0
          prose-ol:space-y-3 prose-ol:text-text-secondary prose-ol:mb-8 prose-ol:pl-0
          prose-li:text-base prose-li:md:text-lg prose-li:leading-relaxed
          prose-a:text-rga-cyan prose-a:hover:text-rga-green prose-a:transition-colors
          prose-blockquote:border-l-rga-green prose-blockquote:bg-bg-surface/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-rga-gray prose-blockquote:italic
          prose-img:rounded-lg prose-img:border prose-img:border-rga-green/20
        "
      >
        <RichText data={contentSource.content.content} />
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
