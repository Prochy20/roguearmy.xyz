'use client'

import { useState, useEffect } from 'react'
import type { ManifestoDocKey } from './types'
import { DOC_ORDER } from './types'


/**
 * Auto-tracks which sections have been scrolled past.
 * A section is marked "read" once its heading crosses above the viewport.
 */
export function useReadProgress(headingIds: string[]) {
  const [readSet, setReadSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Reset when headings change (doc switch)
    setReadSet(new Set())
  }, [headingIds])

  useEffect(() => {
    if (headingIds.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // When a heading scrolls above the viewport (not intersecting, above root)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            setReadSet((prev) => {
              if (prev.has(entry.target.id)) return prev
              const next = new Set(prev)
              next.add(entry.target.id)
              return next
            })
          }
        }
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0 },
    )

    for (const id of headingIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headingIds])

  return { readSet }
}

/**
 * Keyboard shortcuts for the manifesto page.
 * J/K: navigate sections, 1/2/3: switch doc, /: focus search, P: print.
 */
export function useKeyboardShortcuts({
  headingIds,
  activeSection,
  onSwitchDoc,
  searchInputRef,
  enableDocSwitch = true,
  onToggleDifficulty,
}: {
  headingIds: string[]
  activeSection: string | null
  onSwitchDoc?: (key: ManifestoDocKey) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  enableDocSwitch?: boolean
  onToggleDifficulty?: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (enableDocSwitch && onSwitchDoc) {
        if (e.key === '1') { onSwitchDoc('rules'); return }
        if (e.key === '2') { onSwitchDoc('privacy'); return }
        if (e.key === '3') { onSwitchDoc('terms'); return }
      }

      if (e.key.toLowerCase() === 'd' && onToggleDifficulty) {
        e.preventDefault()
        onToggleDifficulty()
        return
      }

      if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const idx = activeSection ? headingIds.indexOf(activeSection) : -1
        const nextIdx =
          e.key.toLowerCase() === 'j'
            ? Math.min(headingIds.length - 1, idx + 1)
            : Math.max(0, idx - 1)
        const el = document.getElementById(headingIds[nextIdx])
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        window.print()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [headingIds, activeSection, onSwitchDoc, searchInputRef, enableDocSwitch, onToggleDifficulty])
}

/**
 * Reads the initial document key from the URL hash.
 */
export function getDocKeyFromHash(): ManifestoDocKey {
  if (typeof window === 'undefined') return 'rules'
  const hash = window.location.hash.replace('#', '')
  if (DOC_ORDER.includes(hash as ManifestoDocKey)) return hash as ManifestoDocKey
  return 'rules'
}
