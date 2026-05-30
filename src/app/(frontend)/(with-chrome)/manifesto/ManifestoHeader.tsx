'use client'

import { StatRibbon } from '@/components/ui/StatRibbon'
import { RGA_ROOT, MANIFESTO_ROOT } from '@/components/ui/trail-roots'
import type { ManifestoDocument } from './types'
import { DOC_ORDER } from './types'

interface ManifestoHeaderProps {
  doc: ManifestoDocument
}

export function ManifestoHeader({ doc }: ManifestoHeaderProps) {
  const docPosition = DOC_ORDER.indexOf(doc.key) + 1

  return (
    <>
      {/* Page chrome — at <lg inline, from lg+ sticks at MENU's vertical
          center. Trail: RGA › Manifesto › <doc-code>. The doc code (e.g.
          M-001) used to be a clickable field in the ribbon; it's now the
          trail leaf with the green accent that distinguishes ratified docs. */}
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-28 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[
            RGA_ROOT,
            MANIFESTO_ROOT,
            { label: doc.code, accent: 'green' },
          ]}
          fields={[
            { label: 'VERSION', value: doc.version, accent: 'green' },
            { label: 'DOC', value: `${docPosition} OF ${DOC_ORDER.length}` },
          ]}
          pill={{ text: 'RATIFIED', ok: true }}
        />
      </div>

      <header className="relative px-6 md:px-12 lg:px-16 pt-7 md:pt-9 pb-8 max-w-[1480px] mx-auto">
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
          {/* Kicker — demoted from text-rga-green/13px to muted 10px to defer
              to the trail above. */}
          {doc.kicker && (
            <div className="font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
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
    </>
  )
}
