'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { useTOC } from '@/components/toc/useTOC'
import type { ManifestoDocument, ManifestoDocKey, DifficultyMode } from './types'
import { DOC_ORDER } from './types'
import {
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
import { DifficultyToggle } from './DifficultyToggle'

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

  // Difficulty mode (rules only) — read initial mode from URL
  const [difficulty, setDifficulty] = useState<DifficultyMode>(() => {
    if (typeof window === 'undefined') return 'casual'
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'hardcore' ? 'hardcore' : 'casual'
  })
  const [glitchPhase, setGlitchPhase] = useState<'idle' | 'out' | 'in'>('idle')

  const hasSimplifiedContent = activeKey === 'rules' &&
    Boolean(doc.simplifiedContent || doc.simplifiedMarkdownContent)

  const toggleDifficulty = useCallback(() => {
    if (glitchPhase !== 'idle') return

    const fireGlitch = () => {
      setGlitchPhase('out')
      setTimeout(() => {
        setDifficulty((prev) => {
          const nextMode = prev === 'casual' ? 'hardcore' : 'casual'
          // Update URL with mode
          const url = new URL(window.location.href)
          if (nextMode === 'hardcore') {
            url.searchParams.set('mode', 'hardcore')
          } else {
            url.searchParams.delete('mode')
          }
          history.replaceState(null, '', url.toString())
          return nextMode
        })
        setGlitchPhase('in')
        setTimeout(() => setGlitchPhase('idle'), 200)
      }, 180)
    }

    // If already at top, glitch immediately
    if (window.scrollY < 10) {
      fireGlitch()
      return
    }

    // Smooth scroll up, then fire glitch once scroll finishes
    window.scrollTo({ top: 0, behavior: 'smooth' })
    let raf: number
    const check = () => {
      if (window.scrollY < 10) {
        fireGlitch()
      } else {
        raf = requestAnimationFrame(check)
      }
    }
    raf = requestAnimationFrame(check)
    // Safety timeout — fire anyway after 2s in case scroll gets stuck
    setTimeout(() => { cancelAnimationFrame(raf); if (window.scrollY >= 10) fireGlitch() }, 2000)
  }, [glitchPhase])

  // Compute effective document based on difficulty mode
  const effectiveDoc = useMemo(() => {
    if (activeKey !== 'rules' || difficulty === 'hardcore') return doc
    if (!doc.simplifiedContent && !doc.simplifiedMarkdownContent) return doc
    return {
      ...doc,
      contentSource: doc.simplifiedContentSource ?? doc.contentSource,
      content: doc.simplifiedContentSource !== 'wiki' ? doc.simplifiedContent : undefined,
      markdownContent: doc.simplifiedContentSource === 'wiki' ? doc.simplifiedMarkdownContent : undefined,
      headings: doc.simplifiedHeadings ?? doc.headings,
    }
  }, [doc, activeKey, difficulty])

  // Heading IDs for keyboard navigation + read tracking
  const headingIds = useMemo(
    () => effectiveDoc.headings.map((h) => h.id),
    [effectiveDoc.headings],
  )

  // Auto-tracks sections scrolled past (session only, not persisted)
  const { readSet } = useReadProgress(headingIds)

  // Scrollspy
  const { activeId, scrollToHeading } = useTOC({
    headings: effectiveDoc.headings,
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
    onToggleDifficulty: hasSimplifiedContent ? toggleDifficulty : undefined,
  })

  const readCount = useMemo(
    () =>
      effectiveDoc.headings.filter((h) => readSet.has(h.id)).length,
    [effectiveDoc.headings, readSet],
  )

  return (
    <div className="relative min-h-screen">
      {/* Fixed top progress bar */}
      <ManifestoProgress />

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
          headings={effectiveDoc.headings}
          activeId={activeId}
          readSet={readSet}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onScrollTo={scrollToHeading}
          searchInputRef={searchInputRef}
          docCode={effectiveDoc.code}
        />

        {/* Center: Content */}
        <div>
          {/* Mobile-only difficulty toggle */}
          {hasSimplifiedContent && (
            <div className="lg:hidden mb-6">
              <DifficultyToggle mode={difficulty} onToggle={toggleDifficulty} />
            </div>
          )}
          <ManifestoContent doc={effectiveDoc} glitchPhase={glitchPhase} />
        </div>

        {/* Right: Meta rail */}
        <ManifestoMeta
          doc={effectiveDoc}
          readCount={readCount}
          totalSections={effectiveDoc.headings.length}
          enableDocSwitch={!singleDoc}
          difficulty={difficulty}
          onToggleDifficulty={toggleDifficulty}
          showDifficultyToggle={hasSimplifiedContent}
        />
      </div>
    </div>
  )
}
