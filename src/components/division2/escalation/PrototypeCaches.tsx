import { CyberCorners } from '@/components/ui/CyberCorners'
import { GlitchOnChange } from '@/components/effects/GlitchOnChange'
import { LootIcon } from './LootIcon'
import { SpecimenFrame } from './SpecimenFrame'
import type {
  EscalationPrototypeCache,
  EscalationLootTypeRef,
} from '@/lib/division2/escalation.server'

interface PrototypeCachesProps {
  caches: EscalationPrototypeCache | null | undefined
  /** Mono label rendered next to SEC_02. Sourced from the Division 2 global. */
  sectionLabel?: string
  /** Body paragraph under the section header describing the vendor + location. */
  blurb?: string
  /** Optional day key. Changing it fires the inner glitch transition. */
  glitchKey?: string
}

/**
 * Two prototype-cache cards (gear + weapon). Asymmetric layout: a large
 * specimen frame holding the loot icon on the left, dossier-style spec
 * sheet on the right. The vendor sells one gear-slot cache and one
 * weapon-class cache per day, independent of mission/loot pairings.
 */
export function PrototypeCaches({
  caches,
  sectionLabel,
  blurb,
  glitchKey,
}: PrototypeCachesProps) {
  const label =
    sectionLabel?.trim() || '// ESCALATION VENDOR · PROTOTYPE CACHES'
  const blurbText = blurb?.trim() ?? ''

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.4em] text-rga-cyan">SEC_02</span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
              {label}
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-70">
            2 ON SALE
          </span>
        </div>
        {blurbText && (
          <p className="max-w-2xl text-xs leading-relaxed text-text-secondary sm:text-sm">
            {blurbText}
          </p>
        )}
      </header>
      <GlitchOnChange triggerKey={glitchKey ?? ''}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CacheCard kind="GEAR" loot={caches?.gear ?? null} />
          <CacheCard kind="WEAPON" loot={caches?.weapon ?? null} />
        </div>
      </GlitchOnChange>
    </section>
  )
}

function CacheCard({ kind, loot }: { kind: 'GEAR' | 'WEAPON'; loot: EscalationLootTypeRef | null }) {
  return (
    <CyberCorners color="cyan" size="md" className="h-full">
      <div className="flex h-full min-w-0 gap-5 border border-rga-cyan/15 bg-[rgba(0,0,0,0.5)] p-5">
        <div className="w-[120px] shrink-0 sm:w-[140px] lg:w-[160px]">
          <SpecimenFrame color="cyan" pending={!loot} padPx={18}>
            {loot && <LootIcon slug={loot.slug} name={loot.name} size={88} />}
          </SpecimenFrame>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[9px] tracking-[0.3em] text-rga-cyan">
              CACHE_{kind === 'GEAR' ? '01' : '02'}
            </span>
            <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted opacity-60">
              {kind}
            </span>
          </div>

          {loot ? (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[8px] tracking-[0.35em] text-text-muted">
                // SOLD TODAY
              </span>
              <span
                className="break-words font-display text-3xl uppercase leading-[0.95] text-text-primary sm:text-4xl"
                style={{ textShadow: '0 0 20px rgba(0,255,255,0.25)' }}
              >
                {loot.name}
              </span>
            </div>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted opacity-70">
              UPSTREAM DID NOT PUBLISH
            </span>
          )}

          <div className="flex flex-col gap-1.5 border-t border-rga-cyan/10 pt-3">
            <span className="font-mono text-[8px] tracking-[0.35em] text-text-muted">
              // SOURCE
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-rga-cyan/80">
              ESCALATION VENDOR · WHITE HOUSE BoO
            </span>
          </div>
        </div>
      </div>
    </CyberCorners>
  )
}
