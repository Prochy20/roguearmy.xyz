'use client'

import { useEffect } from 'react'

export function HashScrollHandler() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash
      if (!hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const id = decodeURIComponent(hash.slice(1))
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (window.location.hash) {
      requestAnimationFrame(scrollToHash)
    }

    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  return null
}
