'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useTOC } from '@/components/content/toc/useTOC'
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

  // Resync on same-page nav: 'manifesto:switch' for footer clicks, 'hashchange' for back/forward.
  const activeKeyRef = useRef(activeKey)
  activeKeyRef.current = activeKey

  useEffect(() => {
    if (singleDoc) return

    const initial = getDocKeyFromHash()
    if (initial !== activeKeyRef.current) {
      setActiveKey(initial)
    }

    const apply = (key: ManifestoDocKey) => {
      if (activeKeyRef.current === key) return
      setActiveKey(key)
      setSearchQuery('')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    const onHashChange = () => apply(getDocKeyFromHash())
    const onSwitch = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail
      if (DOC_ORDER.includes(detail?.key as ManifestoDocKey)) {
        apply(detail.key as ManifestoDocKey)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('manifesto:switch', onSwitch)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('manifesto:switch', onSwitch)
    }
  }, [singleDoc])

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
        const nextMode: DifficultyMode = difficulty === 'casual' ? 'hardcore' : 'casual'
        const url = new URL(window.location.href)
        if (nextMode === 'hardcore') {
          url.searchParams.set('mode', 'hardcore')
        } else {
          url.searchParams.delete('mode')
        }
        history.replaceState(null, '', url.toString())
        setDifficulty(nextMode)
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
  }, [glitchPhase, difficulty])

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

  // Only show H1 and H2 in the TOC, scrollspy, and read tracking
  const tocHeadings = useMemo(
    () => effectiveDoc.headings.filter((h) => h.level <= 2),
    [effectiveDoc.headings],
  )

  // Heading IDs for keyboard navigation + read tracking
  const headingIds = useMemo(
    () => tocHeadings.map((h) => h.id),
    [tocHeadings],
  )

  // Auto-tracks sections scrolled past (session only, not persisted)
  const { readSet } = useReadProgress(headingIds)

  const { activeId, scrollToHeading } = useTOC({
    headings: tocHeadings,
    rootMargin: '-120px 0px -70% 0px',
  })

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

  useKeyboardShortcuts({
    headingIds,
    activeSection: activeId,
    onSwitchDoc: singleDoc ? undefined : switchDoc,
    searchInputRef,
    enableDocSwitch: !singleDoc,
    onToggleDifficulty: hasSimplifiedContent ? toggleDifficulty : undefined,
  })

  const readCount = useMemo(
    () => tocHeadings.filter((h) => readSet.has(h.id)).length,
    [tocHeadings, readSet],
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
          headings={tocHeadings}
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
          totalSections={tocHeadings.length}
          enableDocSwitch={!singleDoc}
          difficulty={difficulty}
          onToggleDifficulty={toggleDifficulty}
          showDifficultyToggle={hasSimplifiedContent}
        />
      </div>
    </div>
  )
}
