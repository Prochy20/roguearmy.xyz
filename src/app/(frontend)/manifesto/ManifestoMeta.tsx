'use client'

import { memo, useEffect, useRef } from 'react'
import type { ManifestoDocument, DifficultyMode } from './types'
import { DifficultyToggle } from './DifficultyToggle'

interface ManifestoMetaProps {
  doc: ManifestoDocument
  readCount: number
  totalSections: number
  enableDocSwitch?: boolean
  difficulty?: DifficultyMode
  onToggleDifficulty?: () => void
  showDifficultyToggle?: boolean
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-[11.5px]">
      <span className="text-text-muted tracking-[0.18em] uppercase">{label}</span>
      <span className={`text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <span className="font-mono text-[10px] px-1.5 py-0.5 border border-rga-green/[0.12] text-text-secondary tracking-[0.12em] uppercase rounded-sm">
      {children}
    </span>
  )
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-[11px]">
      <span className="inline-flex gap-1">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
      <span className="text-text-muted">{label}</span>
    </div>
  )
}

export const ManifestoMeta = memo(function ManifestoMeta({
  doc,
  readCount,
  totalSections,
  enableDocSwitch = true,
  difficulty,
  onToggleDifficulty,
  showDifficultyToggle,
}: ManifestoMetaProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const pct = max > 0 ? Math.round(Math.min(1, el.scrollTop / max) * 100) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`
      if (pctRef.current) pctRef.current.textContent = `${pct}% SCROLLED`
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  return (
    <aside className="hidden lg:flex sticky top-7 self-start flex-col gap-5 font-mono">
      {/* Document info card */}
      <div className="border border-rga-green/[0.12] bg-black/40 p-4">
        <div className="text-[10px] tracking-[0.35em] text-rga-green mb-3">
          // DOCUMENT
        </div>
        <MetaRow label="Code" value={doc.code} mono />
        <MetaRow label="Version" value={`v${doc.version}`} mono />
        {doc.updatedAt && (
          <MetaRow
            label="Updated"
            value={new Date(doc.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          />
        )}
        <MetaRow label="Sections" value={String(totalSections).padStart(2, '0')} mono />
      </div>

      {/* Difficulty toggle (rules only) */}
      {showDifficultyToggle && difficulty && onToggleDifficulty && (
        <DifficultyToggle mode={difficulty} onToggle={onToggleDifficulty} />
      )}

      {/* Progress card */}
      <div className="border border-rga-green/[0.12] bg-black/40 p-4">
        <div className="flex justify-between items-baseline mb-2.5">
          <span className="text-[10px] tracking-[0.35em] text-rga-green">// PROGRESS</span>
          <span className="text-[10px] text-text-muted tracking-[0.15em]">
            {readCount}/{totalSections} READ
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-rga-green/[0.12] relative overflow-hidden mb-2.5">
          <div
            ref={barRef}
            className="absolute inset-0"
            style={{
              transformOrigin: 'left',
              transform: 'scaleX(0)',
              background: 'linear-gradient(90deg, #00FF41, #00FFFF)',
              boxShadow: '0 0 10px #00FF41',
            }}
          />
        </div>

        <span ref={pctRef} className="text-[10px] text-text-muted tracking-[0.2em]">
          0% SCROLLED
        </span>

      </div>

      {/* Shortcuts card */}
      <div className="border border-rga-green/[0.12] bg-black/40 p-4">
        <div className="text-[10px] tracking-[0.35em] text-rga-green mb-3">
          // SHORTCUTS
        </div>
        <ShortcutRow keys={['J', 'K']} label="Next / prev section" />
        {enableDocSwitch && <ShortcutRow keys={['1', '2', '3']} label="Switch document" />}
        {showDifficultyToggle && <ShortcutRow keys={['D']} label="Toggle difficulty" />}
        <ShortcutRow keys={['/']} label="Focus search" />
        <ShortcutRow keys={['P']} label="Print document" />
      </div>
    </aside>
  )
})
