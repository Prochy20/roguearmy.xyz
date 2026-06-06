import { CyberCorners } from '@/components/ui/CyberCorners'
import type { StaffPage } from '@/payload-types'

interface StaffRosterEmptyProps {
  content: StaffPage['emptyState']
}

const FALLBACK = {
  pill: '// NO RECORDS ON FILE',
  heading: 'MANIFEST PENDING COMPILATION',
  body:
    'The roster sync is currently empty. New dossiers will appear here once the next cache refresh writes them. If this persists past the next visit, ping the moderators.',
  hint: '// RETRY · NEXT CACHE TICK',
} as const

/**
 * Empty state for the staff roster — reached when the Payload collection has
 * no rows. Kept inside the same SectionHeader frame above it, so the page
 * rhythm doesn't collapse when there is no data.
 */
export function StaffRosterEmpty({ content }: StaffRosterEmptyProps) {
  const pill = content?.pill ?? FALLBACK.pill
  const heading = content?.heading ?? FALLBACK.heading
  const body = content?.body ?? FALLBACK.body
  const hint = content?.hint ?? FALLBACK.hint

  return (
    <CyberCorners color="cyan" size="md" glow>
      <div className="relative flex flex-col items-start gap-5 border border-rga-cyan/20 bg-[rgba(0,0,0,0.4)] p-8 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent 0,
              transparent 3px,
              rgba(0,255,255,0.5) 3px,
              rgba(0,255,255,0.5) 4px
            )`,
          }}
        />

        <span className="inline-flex items-center gap-3 border border-rga-cyan/30 bg-black/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.4em] text-rga-cyan uppercase">
          <span
            aria-hidden
            className="inline-block h-2 w-2 bg-rga-cyan shadow-[0_0_8px_#00FFFF] animate-pulse"
          />
          {pill}
        </span>

        <h3
          className="font-display uppercase leading-[0.95] tracking-[0.005em] text-text-primary"
          style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}
        >
          {heading}
        </h3>

        <p className="max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
          {body}
        </p>

        <div className="font-mono text-[10px] tracking-[0.35em] text-text-muted uppercase">
          {hint}
        </div>
      </div>
    </CyberCorners>
  )
}
