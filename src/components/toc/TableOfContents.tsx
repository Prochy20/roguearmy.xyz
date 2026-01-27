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
 * Uses fixed positioning, tethered to article start position.
 * TOC follows article top as it scrolls up, but parks at viewport center.
 * When scrolling back up, TOC follows the content back down.
 * Matches the corner bracket + floating label style of tables and callouts.
 * Auto-scrolls to keep active heading visible.
 */
export function TableOfContents({ headings, className, articleRef }: TableOfContentsProps) {
  const { activeId, scrollToHeading } = useTOC({ headings })
  const [tocState, setTocState] = useState<{ visible: boolean; top: number }>({
    visible: false,
    top: 50, // percentage
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // TOC positioning: tethered to article start, but stops at center of viewport
  useEffect(() => {
    const updatePosition = () => {
      if (!articleRef?.current) {
        // Fallback: simple visibility after scrolling
        const visible = window.scrollY > window.innerHeight * 0.8
        setTocState({ visible, top: 50 })
        return
      }

      const article = articleRef.current
      const rect = article.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Hide if article is completely out of view
      if (rect.bottom <= 0) {
        setTocState((prev) => ({ ...prev, visible: false }))
        return
      }

      // The article element IS the content area (hero is separate)
      // Add small offset for article padding (py-12 lg:py-16 = ~48-64px)
      const contentTop = rect.top + 64

      // The "parked" position - TOC top sits near top of viewport with some margin
      const parkedTop = viewportHeight * 0.15

      // TOC follows content position, but can't go above parked position
      const tocTop = Math.max(contentTop, parkedTop)

      // Only show TOC when its position is actually on screen
      if (tocTop >= viewportHeight) {
        setTocState((prev) => ({ ...prev, visible: false }))
        return
      }

      // Convert to viewport percentage for consistent positioning
      const tocTopPercent = (tocTop / viewportHeight) * 100

      setTocState({
        visible: true,
        top: tocTopPercent,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
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

  return (
    <nav
      className={cn(
        // Fixed positioning in left column, top-aligned
        'fixed z-50 w-[200px] hidden lg:block',
        className
      )}
      style={{
        // Center horizontally in left column
        left: 'max(16px, calc((100vw - 720px) / 4 - 100px))',
        // Dynamic vertical position - follows article, parks at center
        top: `${tocState.top}%`,
        // Hide without unmounting to avoid blink
        opacity: tocState.visible ? 1 : 0,
        pointerEvents: tocState.visible ? 'auto' : 'none',
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
          href="/blog"
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
