import Link from 'next/link'
import type { ContentSource } from '@/lib/division2/content.server'

const SOURCES: ContentSource[] = ['YOUTUBE', 'REDDIT', 'UBISOFT']

/**
 * Tailwind requires statically-analyzable class names — we cannot
 * interpolate `text-${color}` and expect JIT to pick it up. So source
 * accent classes are hard-coded per source.
 */
const SOURCE_CHIP_CLASSES: Record<
  ContentSource,
  { activeText: string; activeBorder: string; activeDot: string; label: string }
> = {
  YOUTUBE: {
    activeText: 'text-source-youtube',
    activeBorder: 'border-source-youtube/60',
    activeDot: 'bg-source-youtube',
    label: 'YOUTUBE',
  },
  REDDIT: {
    activeText: 'text-source-reddit',
    activeBorder: 'border-source-reddit/60',
    activeDot: 'bg-source-reddit',
    label: 'REDDIT',
  },
  UBISOFT: {
    activeText: 'text-source-ubisoft',
    activeBorder: 'border-source-ubisoft/60',
    activeDot: 'bg-source-ubisoft',
    label: 'UBISOFT',
  },
}

interface ContentFilterChipsProps {
  /** The active source, or undefined when "All" is selected. */
  active: ContentSource | undefined
  /** Section label above the chip row (CMS-driven). */
  sectionLabel: string
}

/**
 * Source filter chip row. Four chips: All / YouTube / Reddit / Ubisoft.
 * Each chip is a Next.js Link that toggles the `?source=` query param.
 * Active chip carries the source's accent color; inactive chips are muted
 * but clickable. URL is the source of truth — clicking a chip triggers a
 * full server navigation, which is intentional (see `force-dynamic` on
 * page.tsx).
 */
export function ContentFilterChips({ active, sectionLabel }: ContentFilterChipsProps) {
  return (
    <section className="flex flex-col gap-3 sm:gap-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-rga-mod">
        {sectionLabel}
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <FilterChip
          label="ALL"
          href="/division-2/content"
          active={active === undefined}
          activeText="text-text-primary"
          activeBorder="border-text-secondary/60"
          activeDot="bg-text-primary"
        />
        {SOURCES.map((src) => {
          const cls = SOURCE_CHIP_CLASSES[src]
          return (
            <FilterChip
              key={src}
              label={cls.label}
              href={`/division-2/content?source=${src}`}
              active={active === src}
              activeText={cls.activeText}
              activeBorder={cls.activeBorder}
              activeDot={cls.activeDot}
            />
          )
        })}
      </div>
    </section>
  )
}

interface FilterChipProps {
  label: string
  href: string
  active: boolean
  activeText: string
  activeBorder: string
  activeDot: string
}

function FilterChip({ label, href, active, activeText, activeBorder, activeDot }: FilterChipProps) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors',
        active
          ? `${activeBorder} ${activeText} bg-bg-elevated`
          : 'border-text-muted/30 text-text-secondary hover:border-text-secondary/60 hover:text-text-primary',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'inline-block h-1.5 w-1.5 rounded-[1px]',
          active ? activeDot : 'bg-text-muted/60',
        ].join(' ')}
      />
      <span>{label}</span>
    </Link>
  )
}
