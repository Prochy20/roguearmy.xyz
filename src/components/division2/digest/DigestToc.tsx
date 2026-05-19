'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ACCENT_TOKENS, type AccentName } from './accent'
import type { DigestSection } from '@/lib/division2/digest.server'

interface DigestTocProps {
  accent: AccentName
  sections: readonly DigestSection[]
}

/**
 * Sticky left-rail table of contents with search, read-ticks, and keyboard
 * shortcuts — modelled on the manifesto's TOC pattern.
 *
 * Three behaviors:
 *  - **Search** — typing in the input filters the visible section list by
 *    substring match against heading text. Non-matching entries dim to 25%
 *    rather than vanishing, so the structure stays legible.
 *  - **Active tracking** — IntersectionObserver bands the upper third of
 *    the viewport. The earliest visible heading is the "active" one.
 *  - **Read ticks** — a second observer marks a section as read once its
 *    heading scrolls past the top of the viewport. Once marked, sections
 *    stay marked until the page reloads.
 *
 * Keyboard shortcuts live here too (rather than a separate hook):
 *  - `J` / `K`: scroll to the next / previous section
 *  - `/`: focus the search input
 *  - `P`: window.print()
 * Handlers ignore keystrokes when the focus is inside an input or textarea
 * so typing in the search box doesn't trigger navigation.
 */
export function DigestToc({ accent, sections }: DigestTocProps) {
  const a = ACCENT_TOKENS[accent]
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const [readSet, setReadSet] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const visibleIdsRef = useRef<Set<string>>(new Set())

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections])

  // Active-section tracking — upper-third viewport band.
  useEffect(() => {
    if (sectionIds.length === 0) return
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const visible = visibleIdsRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const firstVisible = sectionIds.find((id) => visible.has(id))
        if (firstVisible) setActiveId(firstVisible)
      },
      { rootMargin: '-15% 0% -65% 0%', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sectionIds])

  // Read-tick tracking — mark section as read once its heading is above viewport.
  useEffect(() => {
    setReadSet(new Set())
  }, [sectionIds])

  useEffect(() => {
    if (sectionIds.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
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
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sectionIds])

  // Keyboard shortcuts.
  useEffect(() => {
    if (sectionIds.length === 0) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }
      const key = e.key.toLowerCase()
      if (key === 'j' || key === 'k') {
        e.preventDefault()
        const idx = activeId ? sectionIds.indexOf(activeId) : -1
        const nextIdx =
          key === 'j'
            ? Math.min(sectionIds.length - 1, idx + 1)
            : Math.max(0, idx - 1)
        const el = document.getElementById(sectionIds[nextIdx])
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (key === 'p') {
        e.preventDefault()
        if (typeof window !== 'undefined') window.print()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sectionIds, activeId])

  if (sections.length === 0) return null

  const matches = (section: DigestSection) =>
    !query ||
    section.text.toLowerCase().includes(query.toLowerCase()) ||
    section.numLabel.includes(query)

  return (
    <nav
      aria-label="Section contents"
      className="flex flex-col gap-3 border-l border-text-muted/15 pl-4"
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.35em] ${a.textSoft}`}
        style={{ textShadow: a.textGlow }}
      >
        // CONTENTS
      </span>

      {/* Search */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search sections…"
          aria-label="Search sections"
          className={`w-full border ${a.borderFaint} bg-void/40 py-2 pl-6 pr-2 font-mono text-[11px] text-text-primary outline-none transition-colors focus:${a.borderStrong} placeholder:text-text-muted/50`}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted"
        >
          /
        </span>
      </div>

      <ol className="flex flex-col gap-1.5">
        {sections.map((section) => {
          const active = section.id === activeId
          const read = readSet.has(section.id)
          const visible = matches(section)
          return (
            <li
              key={section.id}
              style={{
                opacity: visible ? 1 : 0.25,
                transition: 'opacity 150ms',
              }}
            >
              <a
                href={`#${section.id}`}
                data-toc-id={section.id}
                className={[
                  'group/toc flex items-start gap-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] leading-snug transition-colors',
                  active ? a.text : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
                style={active ? { textShadow: a.textGlow } : undefined}
                aria-current={active ? 'location' : undefined}
              >
                <span
                  aria-hidden
                  className={[
                    'inline-block w-2 shrink-0 transition-opacity',
                    active ? 'opacity-100' : 'opacity-30',
                  ].join(' ')}
                >
                  ▸
                </span>
                <span
                  className={`shrink-0 tabular-nums ${
                    active ? a.text : 'text-text-muted/60'
                  }`}
                >
                  {section.numLabel}
                </span>
                <span className="min-w-0 flex-1 break-words normal-case tracking-[0.05em]">
                  {section.text}
                </span>
                {read && (
                  <span
                    aria-label="Read"
                    className="shrink-0 font-mono text-[10px] text-rga-green"
                    style={{ textShadow: '0 0 6px rgba(0,255,65,0.6)' }}
                  >
                    ✓
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
