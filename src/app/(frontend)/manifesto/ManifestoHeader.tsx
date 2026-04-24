'use client'

import Link from 'next/link'
import type { ManifestoDocument } from './types'

interface ManifestoHeaderProps {
  doc: ManifestoDocument
}

export function ManifestoHeader({ doc }: ManifestoHeaderProps) {
  return (
    <header className="relative px-6 md:px-12 lg:px-16 pt-16 md:pt-20 pb-8 max-w-[1480px] mx-auto">
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 70% 10%, rgba(0,255,65,0.08) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 20% 30%, rgba(0,255,255,0.05) 0%, transparent 55%)',
        }}
      />

      <div className="relative">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] uppercase text-text-muted mb-4">
          <span
            className="inline-block w-2 h-2 rounded-sm bg-rga-green"
            style={{ boxShadow: '0 0 8px #00FF41' }}
            aria-hidden="true"
          />
          <Link href="/" className="text-rga-green no-underline hover:text-glow-green transition-colors">ROGUE_ARMY</Link>
          <span>/</span>
          <Link href="/manifesto" className="text-text-secondary no-underline hover:text-white transition-colors">MANIFESTO</Link>
          <span>/</span>
          <span className="text-white">{doc.code}</span>
          <span
            className="flex-1 max-w-80 h-px"
            style={{
              background: 'linear-gradient(90deg, rgba(0,255,65,0.33), transparent)',
            }}
          />
        </div>

        {/* Kicker */}
        {doc.kicker && (
          <div className="font-mono text-[13px] text-rga-green tracking-[0.25em] uppercase mb-4">
            {doc.kicker}
          </div>
        )}

        {/* Title */}
        <h1
          className="font-display text-[clamp(64px,10vw,168px)] leading-[0.86] tracking-[-0.005em] uppercase text-white m-0"
          style={{
            textShadow: '-2px 0 rgba(0,255,255,0.33), 2px 0 rgba(255,0,255,0.33)',
          }}
        >
          {doc.title}
        </h1>

        {/* Subtitle */}
        {doc.subtitle && (
          <p className="font-body text-xl text-text-secondary max-w-3xl mt-6 leading-relaxed">
            {doc.subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
