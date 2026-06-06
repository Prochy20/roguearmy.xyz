'use client'

import { useState } from 'react'

/**
 * Persistent collapsible explainer for the formation mechanic. Sits as the
 * first child inside the FormationBlock, above the POINT card. Collapsed by
 * default — one slim row. When expanded, reveals four sections inline.
 *
 * Available on every visit so returning users can re-check the mechanic
 * without re-triggering an onboarding flow. The toggle persists open/closed
 * state only within the page lifetime — we don't write to localStorage
 * because it's not worth the bytes for a UX preference.
 */
export function FormationDossier() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-rga-cyan/15 bg-[rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group/dos flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[rgba(0,255,255,0.03)] sm:px-5 sm:py-3"
      >
        <span className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan/80 transition-colors group-hover/dos:text-rga-cyan">
          <span aria-hidden className="inline-block h-1 w-3 bg-rga-cyan/70 shadow-[0_0_6px_rgba(0,255,255,0.5)]" />
          <span>// HOW THE FORMATION WORKS</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.4em] uppercase text-text-muted transition-colors group-hover/dos:text-rga-cyan/80">
          <span>{open ? 'HIDE' : 'READ'}</span>
          <span
            aria-hidden
            className={'inline-block transition-transform duration-300 ' + (open ? 'rotate-180' : '')}
          >
            ▾
          </span>
        </span>
      </button>

      {/* Expandable body */}
      <div
        className={
          'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ' +
          (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')
        }
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-rga-cyan/15 px-4 py-5 sm:px-5 sm:py-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7">
              <DossierSection eyebrow="WHAT IS A POINT" num="01">
                <p>
                  The operative directly above you in the formation. Your closest target — one
                  named person to catch, instead of staring at the full board.
                </p>
                <p className="text-text-muted">
                  Cooperative by default. You&apos;re catching teammates, not beating rivals — when
                  you pass them, they fall back so you can take point.
                </p>
              </DossierSection>

              <DossierSection eyebrow="THE LOOP" num="02">
                <ol className="flex flex-col gap-1.5">
                  <DossierStep n="1">
                    <span className="text-rga-cyan">DESIGNATE</span> — auto-suggested from the
                    closest above you. Or pick anyone via the roster.
                  </DossierStep>
                  <DossierStep n="2">
                    <span className="text-rga-cyan">PACE</span> — earn XP in Discord. Watch the
                    distance close across visits.
                  </DossierStep>
                  <DossierStep n="3">
                    <span className="text-rga-magenta">OVERTAKE</span> — your POINT is RELIEVED.
                    You step up, they fall back.
                  </DossierStep>
                  <DossierStep n="4">
                    <span className="text-rga-cyan">RE-DESIGNATE</span> — the next POINT
                    auto-suggests. Repeat.
                  </DossierStep>
                </ol>
              </DossierSection>

              <DossierSection eyebrow="STATS YOU SEE" num="03">
                <ul className="flex flex-col gap-1.5">
                  <DossierBullet>
                    <span className="text-rga-green">CLOSING DISTANCE</span> — XP between you and
                    your POINT.
                  </DossierBullet>
                  <DossierBullet>
                    <span className="text-rga-cyan">TIER</span> — your level band; fills as you
                    earn XP toward the next tier.
                  </DossierBullet>
                  <DossierBullet>
                    <span className="text-rga-green">LAST N DAYS</span> — your XP gain and rank
                    climb in the recent window.
                  </DossierBullet>
                </ul>
              </DossierSection>

              <DossierSection eyebrow="NOTES" num="04">
                <ul className="flex flex-col gap-1.5">
                  <DossierBullet>
                    <span className="text-text-primary">Stretch picks</span> — designate someone
                    far ahead as a long-range goal.
                  </DossierBullet>
                  <DossierBullet>
                    <span className="text-text-primary">On-device only</span> — your designation
                    lives in this browser. Switching devices resets it.
                  </DossierBullet>
                  <DossierBullet>
                    <span className="text-text-primary">No surveillance</span> — your POINT is
                    private. The operative you&apos;re pacing is never notified.
                  </DossierBullet>
                </ul>
              </DossierSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DossierSection({
  eyebrow,
  num,
  children,
}: {
  eyebrow: string
  num: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline gap-3 border-b border-[rgba(255,255,255,0.06)] pb-2">
        <span className="font-mono text-[10px] tracking-[0.35em] text-rga-cyan/70">{num}</span>
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-cyan [text-shadow:0_0_8px_rgba(0,255,255,0.35)]">
          {eyebrow}
        </span>
      </header>
      <div className="flex flex-col gap-2 font-mono text-xs leading-relaxed tracking-wide text-text-secondary">
        {children}
      </div>
    </section>
  )
}

function DossierStep({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="shrink-0 font-mono text-[10px] tracking-[0.35em] text-text-muted">
        {n}/
      </span>
      <span>{children}</span>
    </li>
  )
}

function DossierBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-2">
      <span aria-hidden className="shrink-0 text-rga-cyan/50">
        ·
      </span>
      <span>{children}</span>
    </li>
  )
}
