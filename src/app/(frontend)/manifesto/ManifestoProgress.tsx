'use client'

import { useEffect, useRef } from 'react'

/**
 * Fixed top progress bar driven entirely via ref + rAF.
 * Bypasses React re-renders for smooth 60fps scroll tracking.
 */
export function ManifestoProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0

    const update = () => {
      const doc = document.documentElement
      const scrolled = doc.scrollTop
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(1, scrolled / max) : 0

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        style={{
          height: '100%',
          width: '100%',
          transformOrigin: 'left',
          transform: 'scaleX(0)',
          willChange: 'transform',
          background: 'linear-gradient(90deg, #00FF41, #00FFFF, #FF00FF)',
          boxShadow: '0 0 10px #00FF41',
        }}
      />
    </div>
  )
}
