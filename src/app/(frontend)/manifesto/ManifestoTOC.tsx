'use client'

import { useState, useEffect, useRef } from 'react'
import type { TOCHeading } from '@/lib/toc'

interface ManifestoTOCProps {
  headings: TOCHeading[]
  activeId: string | null
  readSet: Set<string>
  searchQuery: string
  onSearchChange: (q: string) => void
  onScrollTo: (id: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  docCode: string
}

export function ManifestoTOC({
  headings,
  activeId,
  readSet,
  searchQuery,
  onSearchChange,
  onScrollTo,
  searchInputRef,
  docCode,
}: ManifestoTOCProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Keep the active TOC item visible within the scrollable sidebar
  useEffect(() => {
    if (!activeId || !scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const activeEl = container.querySelector(`[data-toc-id="${activeId}"]`) as HTMLElement | null
    if (!activeEl) return

    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    // Only scroll if the active item is outside the visible area
    if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  const matches = (h: TOCHeading) =>
    !searchQuery || h.text.toLowerCase().includes(searchQuery.toLowerCase())

  const content = (
    <nav aria-label="Table of contents" className="font-mono">
      <div className="text-[10px] tracking-[0.35em] text-rga-green mb-3.5">
        // CONTENTS
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="search sections…"
          className="w-full bg-black/40 border border-rga-green/[0.12] text-white px-3 py-2.5 pl-7 font-mono text-xs tracking-[0.05em] outline-none focus:border-rga-green/30 transition-colors"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">
          /
        </span>
      </div>

      {/* Heading list */}
      <ol className="list-none p-0 m-0">
        {headings.map((h, i) => {
          const isActive = h.id === activeId
          const isRead = readSet.has(h.id)
          const visible = matches(h)
          // Extract section number from heading text or use index
          const num = String(i + 1).padStart(2, '0')

          return (
            <li
              key={h.id}
              style={{ opacity: visible ? 1 : 0.25, transition: 'opacity 0.15s' }}
            >
              <a
                data-toc-id={h.id}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onScrollTo(h.id)
                  setMobileOpen(false)
                }}
                className={`
                  flex gap-3 items-baseline py-2
                  text-[12.5px] leading-snug tracking-[0.02em]
                  no-underline transition-colors duration-150
                  ${isActive
                    ? 'text-white'
                    : 'text-text-muted hover:text-text-secondary'
                  }
                `}
              >
                <span
                  className={`text-[10px] tracking-[0.25em] shrink-0 w-5 ${
                    isActive ? 'text-rga-green text-glow-green' : 'text-text-muted'
                  }`}
                >
                  {num}
                </span>
                <span className="flex-1">{h.text}</span>
                {isRead && (
                  <span className="text-rga-green text-[10px]" aria-hidden="true">
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

  return (
    <>
      {/* Desktop: sticky sidebar, scrollable when content overflows */}
      <div ref={scrollContainerRef} className="hidden lg:block sticky top-7 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-on-hover">
        {content}
      </div>

      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border border-rga-green/[0.12] bg-black/40 font-mono text-xs tracking-[0.2em] uppercase text-text-secondary cursor-pointer"
        >
          <span>
            <span className="text-rga-green mr-2">{docCode}</span>
            Contents ({headings.length})
          </span>
          <span>{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div className="border border-t-0 border-rga-green/[0.12] bg-black/40 p-4">
            {content}
          </div>
        )}
      </div>
    </>
  )
}
