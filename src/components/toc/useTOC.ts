'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TOCHeading } from '@/lib/toc'

interface UseTOCOptions {
  headings: TOCHeading[]
  /**
   * Root margin for the Intersection Observer.
   * Default accounts for sticky header.
   */
  rootMargin?: string
}

interface UseTOCReturn {
  /** Currently active heading ID */
  activeId: string | null
  /** Scroll to a specific heading */
  scrollToHeading: (id: string) => void
}

/**
 * Hook to track which TOC section is currently in view.
 * Uses Intersection Observer to detect visible sections.
 */
export function useTOC({
  headings,
  rootMargin = '-80px 0px -70% 0px',
}: UseTOCOptions): UseTOCReturn {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map()
  )

  // Initialize with first heading if available
  useEffect(() => {
    if (headings.length > 0 && !activeId) {
      setActiveId(headings[0].id)
    }
  }, [headings, activeId])

  useEffect(() => {
    if (headings.length === 0) return

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const callback: IntersectionObserverCallback = (entries) => {
      // Update the map with new intersection states
      entries.forEach((entry) => {
        headingElementsRef.current.set(entry.target.id, entry)
      })

      // Find the first visible heading in document order
      const visibleHeadings = headings.filter((heading) => {
        const entry = headingElementsRef.current.get(heading.id)
        return entry?.isIntersecting
      })

      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0].id)
      } else {
        // If no headings are visible, find the one closest above viewport
        // by looking at which headings we've scrolled past
        const scrollY = window.scrollY
        let closestHeading: TOCHeading | null = null
        let closestDistance = Infinity

        for (const heading of headings) {
          const element = document.getElementById(heading.id)
          if (element) {
            const rect = element.getBoundingClientRect()
            const elementTop = rect.top + scrollY

            // If element is above current scroll position
            if (elementTop <= scrollY + 100) {
              const distance = scrollY - elementTop
              if (distance < closestDistance) {
                closestDistance = distance
                closestHeading = heading
              }
            }
          }
        }

        if (closestHeading) {
          setActiveId(closestHeading.id)
        }
      }
    }

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin,
      threshold: [0, 0.5, 1],
    })

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    // Capture refs for cleanup
    const observer = observerRef.current
    const headingElements = headingElementsRef.current

    return () => {
      observer?.disconnect()
      headingElements.clear()
    }
  }, [headings, rootMargin])

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Immediately set active to provide instant feedback
      setActiveId(id)
    }
  }, [])

  return { activeId, scrollToHeading }
}
