'use client'

import { useState, useEffect, useRef } from 'react'

interface UseScrollVisibilityOptions {
  enabled?: boolean
  threshold?: number // Minimum scroll distance before hiding
}

export function useScrollVisibility({
  enabled = true,
  threshold = 50,
}: UseScrollVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDelta = currentScrollY - lastScrollY.current

          // Show if scrolled to top
          if (currentScrollY < threshold) {
            setIsVisible(true)
          }
          // Hide when scrolling down past threshold
          else if (scrollDelta > 0 && currentScrollY > threshold) {
            setIsVisible(false)
          }
          // Show when scrolling up
          else if (scrollDelta < -5) {
            setIsVisible(true)
          }

          lastScrollY.current = currentScrollY
          ticking.current = false
        })

        ticking.current = true
      }
    }

    // Initialize scroll position
    lastScrollY.current = window.scrollY

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, threshold])

  return isVisible
}
