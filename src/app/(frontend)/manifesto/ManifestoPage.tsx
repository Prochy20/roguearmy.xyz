'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { useTOC } from '@/components/toc/useTOC'
import type { ManifestoDocument, ManifestoDocKey } from './types'
import { DOC_ORDER } from './types'
import {
  useScrollProgress,
  useReadProgress,
  useKeyboardShortcuts,
  getDocKeyFromHash,
} from './useManifesto'
import { ManifestoHeader } from './ManifestoHeader'
import { DocTabs } from './DocTabs'
import { ManifestoTOC } from './ManifestoTOC'
import { ManifestoContent } from './ManifestoContent'
import { ManifestoMeta } from './ManifestoMeta'
import { ManifestoProgress } from './ManifestoProgress'

interface ManifestoPageProps {
  docs: Record<ManifestoDocKey, ManifestoDocument>
  /** When set, only show this document (standalone route, no tabs) */
  singleDoc?: ManifestoDocKey
}

export function ManifestoPage({ docs, singleDoc }: ManifestoPageProps) {
  const [activeKey, setActiveKey] = useState<ManifestoDocKey>(
    singleDoc ?? getDocKeyFromHash,
  )

  const doc = docs[activeKey]
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Scroll progress
  const scrollProgress = useScrollProgress()

  // Heading IDs for keyboard navigation + read tracking
  const headingIds = useMemo(
    () => doc.headings.map((h) => h.id),
    [doc.headings],
  )

  // Auto-tracks sections scrolled past (session only, not persisted)
  const { readSet } = useReadProgress(headingIds)

  // Scrollspy
  const { activeId, scrollToHeading } = useTOC({
    headings: doc.headings,
    rootMargin: '-120px 0px -70% 0px',
  })

  // Tab switching handler
  const switchDoc = useCallback(
    (key: ManifestoDocKey) => {
      if (singleDoc) return // can't switch in standalone mode
      setActiveKey(key)
      setSearchQuery('')
      window.scrollTo({ top: 0, behavior: 'auto' })
      history.replaceState(null, '', `#${key}`)
    },
    [singleDoc],
  )

  // Keyboard shortcuts
  useKeyboardShortcuts({
    headingIds,
    activeSection: activeId,
    onSwitchDoc: singleDoc ? undefined : switchDoc,
    searchInputRef,
    enableDocSwitch: !singleDoc,
  })

  const readCount = useMemo(
    () =>
      doc.headings.filter((h) => readSet.has(h.id)).length,
    [doc.headings, readSet],
  )

  return (
    <div className="relative min-h-screen">
      {/* Fixed top progress bar */}
      <ManifestoProgress progress={scrollProgress} />

      {/* Header */}
      <ManifestoHeader doc={doc} />

      {/* Tabs (only on /manifesto, not standalone) */}
      {!singleDoc && (
        <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16">
          <DocTabs docs={docs} active={activeKey} onSelect={switchDoc} />
        </div>
      )}

      {/* 3-column layout */}
      <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-10 lg:grid lg:grid-cols-[220px_1fr_260px] lg:gap-12 items-start">
        {/* Left: TOC */}
        <ManifestoTOC
          headings={doc.headings}
          activeId={activeId}
          readSet={readSet}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onScrollTo={scrollToHeading}
          searchInputRef={searchInputRef}
          docCode={doc.code}
        />

        {/* Center: Content */}
        <div>
          <ManifestoContent doc={doc} />
        </div>

        {/* Right: Meta rail */}
        <ManifestoMeta
          doc={doc}
          progress={scrollProgress}
          readCount={readCount}
          totalSections={doc.headings.length}
          enableDocSwitch={!singleDoc}
        />
      </div>
    </div>
  )
}
