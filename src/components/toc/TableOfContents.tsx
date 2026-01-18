'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TOCHeading } from '@/lib/toc'
import { useTOC } from './useTOC'
import { TOCItem } from './TOCItem'

interface TableOfContentsProps {
  headings: TOCHeading[]
  className?: string
  /** Ref to article element - TOC shows only when article is in viewport */
  articleRef?: React.RefObject<HTMLElement | null>
}

/**
 * Corner bracket decoration component (matches table/callout style)
 */
function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotations = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="text-rga-green/40"
      >
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * Desktop fixed table of contents with integrated back button.
 * Uses fixed positioning, visible only when article is in viewport.
 * Appears when scrolling into article, disappears when scrolling back to hero.
 * Matches the corner bracket + floating label style of tables and callouts.
 * Auto-scrolls to keep active heading visible.
 */
export function TableOfContents({ headings, className, articleRef }: TableOfContentsProps) {
  const { activeId, scrollToHeading } = useTOC({ headings })
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Show TOC only when article is in viewport (not during hero)
  useEffect(() => {
    const checkVisibility = () => {
      if (!articleRef?.current) {
        // Fallback: show after scrolling past 80% of viewport height
        setIsVisible(window.scrollY > window.innerHeight * 0.8)
        return
      }

      const article = articleRef.current
      const rect = article.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Show TOC when:
      // - Article top has scrolled above the viewport center (we're "in" the article)
      // - Article bottom is still below viewport top (article is still visible)
      const articleTopAboveCenter = rect.top < viewportHeight * 0.5
      const articleStillVisible = rect.bottom > 0

      setIsVisible(articleTopAboveCenter && articleStillVisible)
    }

    checkVisibility()
    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [articleRef])

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    if (!activeId || !scrollContainerRef.current) return

    const activeItem = itemRefs.current.get(activeId)
    if (!activeItem) return

    const container = scrollContainerRef.current

    // Use getBoundingClientRect for accurate position relative to scroll container
    // (offsetTop is relative to offsetParent which includes back button/separator)
    const itemRect = activeItem.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Calculate item's position relative to the scroll container's content
    const itemTopInContainer = itemRect.top - containerRect.top + container.scrollTop
    const itemHeight = activeItem.offsetHeight
    const containerHeight = container.clientHeight
    const scrollTop = container.scrollTop

    // Check if item is outside visible area
    if (itemTopInContainer < scrollTop) {
      // Item is above visible area - scroll up
      container.scrollTo({ top: Math.max(0, itemTopInContainer - 8), behavior: 'smooth' })
    } else if (itemTopInContainer + itemHeight > scrollTop + containerHeight) {
      // Item is below visible area - scroll down
      container.scrollTo({
        top: itemTopInContainer + itemHeight - containerHeight + 8,
        behavior: 'smooth',
      })
    }
  }, [activeId])

  // Register item ref
  const setItemRef = (id: string, el: HTMLButtonElement | null) => {
    if (el) {
      itemRefs.current.set(id, el)
    } else {
      itemRefs.current.delete(id)
    }
  }

  if (!isVisible) return null

  return (
    <nav
      className={cn(
        // Fixed positioning, centered in left column
        'fixed top-1/2 -translate-y-1/2 z-50 w-[200px] hidden lg:block',
        className
      )}
      style={{
        // Center horizontally in left column
        left: 'max(16px, calc((100vw - 720px) / 4 - 100px))',
      }}
      aria-label="Table of contents"
    >
      <div className="relative py-5 px-4">
        {/* Corner brackets */}
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Floating label (matches table/callout style) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-void">
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-rga-green/30">
            {headings.length > 0 ? 'Contents' : 'Navigation'}
          </span>
        </div>

        {/* Back button - inside the panel */}
        <Link
          href="/members"
          className="group flex items-center gap-2 text-rga-gray hover:text-rga-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-mono text-xs uppercase tracking-wider">Back to articles</span>
        </Link>

        {/* TOC items - only show if there are headings */}
        {headings.length > 0 && (
          <>
            {/* Separator */}
            <div className="my-3 h-px bg-rga-green/10" />

            {/* Scrollable TOC list */}
            <div
              ref={scrollContainerRef}
              className="max-h-[50vh] overflow-y-auto scrollbar-hide"
            >
              <div className="space-y-0.5">
                {headings.map((heading) => (
                  <TOCItem
                    key={heading.id}
                    ref={(el) => setItemRef(heading.id, el)}
                    heading={heading}
                    isActive={activeId === heading.id}
                    onClick={scrollToHeading}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
