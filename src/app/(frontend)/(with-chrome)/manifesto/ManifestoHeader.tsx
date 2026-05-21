'use client'

import Link from 'next/link'
import { StatRibbon } from '@/components/ui/StatRibbon'
import type { ManifestoDocument } from './types'
import { DOC_ORDER } from './types'

interface ManifestoHeaderProps {
  doc: ManifestoDocument
}

export function ManifestoHeader({ doc }: ManifestoHeaderProps) {
  const docPosition = DOC_ORDER.indexOf(doc.key) + 1

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
        <div className="mb-6">
          <StatRibbon
            prefix="// CHARTER"
            fields={[
              {
                label: '',
                value: (
                  <Link
                    href="/manifesto"
                    className="text-rga-green hover:text-white transition-colors no-underline [text-shadow:0_0_10px_rgba(0,255,65,0.5)]"
                  >
                    {doc.code}
                  </Link>
                ),
              },
              { label: 'VERSION', value: doc.version, accent: 'green' },
              { label: 'DOC', value: `${docPosition} OF ${DOC_ORDER.length}` },
            ]}
            pill={{ text: 'RATIFIED', ok: true }}
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
