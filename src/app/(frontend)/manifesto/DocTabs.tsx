'use client'

import type { ManifestoDocument, ManifestoDocKey } from './types'
import { DOC_ORDER } from './types'

interface DocTabsProps {
  docs: Record<ManifestoDocKey, ManifestoDocument>
  active: ManifestoDocKey
  onSelect: (key: ManifestoDocKey) => void
}

export function DocTabs({ docs, active, onSelect }: DocTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Policy documents"
      className="flex border-t border-b border-rga-green/[0.12] bg-black/40"
    >
      {DOC_ORDER.map((key) => {
        const doc = docs[key]
        const isActive = key === active
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(key)}
            className={`
              relative flex-1 flex items-center gap-3 md:gap-4 px-4 md:px-7 py-5
              text-left border-r border-rga-green/[0.12] last:border-r-0
              transition-colors cursor-pointer
              ${isActive ? 'bg-rga-green/[0.06] text-white' : 'bg-transparent text-text-muted hover:bg-rga-green/[0.03]'}
            `}
          >
            {/* Active left indicator */}
            {isActive && (
              <span
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-rga-green"
                style={{ boxShadow: '0 0 10px #00FF41' }}
                aria-hidden="true"
              />
            )}

            <span
              className={`font-mono text-[11px] tracking-[0.3em] hidden sm:inline ${
                isActive ? 'text-rga-green' : 'text-text-muted'
              }`}
            >
              {doc.code}
            </span>

            <span className="font-display text-base md:text-xl tracking-[0.02em] uppercase">
              {doc.title}
            </span>

            <span className="flex-1" />

            <span className="font-mono text-[10px] text-text-muted tracking-[0.2em] hidden md:inline">
              v{doc.version}
            </span>
          </button>
        )
      })}
    </div>
  )
}
