'use client'

import { useState, useCallback, useRef } from 'react'
import { TableOfContents, MobileTOC } from '@/components/toc'
import type { TOCHeading } from '@/lib/toc'
import type { ArticleContentSource } from '@/lib/articles'
import { ArticleContent } from './ArticleContent'

interface ArticleWithTOCProps {
  contentSource: ArticleContentSource
  initialHeadings: TOCHeading[]
  children?: React.ReactNode
}

/**
 * Client wrapper that manages TOC state and passes headings callback to ArticleContent.
 * For Payload content, uses initialHeadings directly.
 * For Wiki content, waits for headings to be extracted client-side.
 */
export function ArticleWithTOC({
  contentSource,
  initialHeadings,
  children,
}: ArticleWithTOCProps) {
  // For Payload content, use initial headings
  // For Wiki content, this will be updated via callback
  const [headings, setHeadings] = useState<TOCHeading[]>(initialHeadings)
  const articleRef = useRef<HTMLElement>(null)

  const handleHeadingsExtracted = useCallback((extractedHeadings: TOCHeading[]) => {
    setHeadings(extractedHeadings)
  }, [])

  return (
    <>
      {/* Fixed TOC - passes article ref to constrain visibility to article bounds */}
      <TableOfContents headings={headings} articleRef={articleRef} />

      <article ref={articleRef} className="py-12 lg:py-16">
        {/* Mobile TOC - only on mobile/tablet */}
        <MobileTOC headings={headings} className="mb-8" />

        {/* Article content */}
        <ArticleContent
          contentSource={contentSource}
          onHeadingsExtracted={handleHeadingsExtracted}
        />

        {/* Additional content passed from parent (series nav, footer) */}
        {children}
      </article>
    </>
  )
}
