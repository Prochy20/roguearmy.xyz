import { HeroGlitch } from '@/components/effects/HeroGlitch'

interface BriefingHeroProps {
  /** Optional flavor/state qualifier. Location lives in the ribbon trail now. */
  kicker?: string
  title: string
  accent: string
  intro: string
}

/**
 * Hero header for the briefings list page. Same layout language as the content
 * and escalation pages — optional kicker + two-tone display headline + intro
 * paragraph. The kicker used to carry location ("// DIVISION 2 · WASHINGTON
 * BRIEFINGS") which now lives in the StatRibbon trail; it survives only as a
 * flavor slot for sibling pages (Content "LIVE INTEL", etc).
 */
export function BriefingHero({ kicker, title, accent, intro }: BriefingHeroProps) {
  return (
    <div className="flex min-w-0 flex-col gap-7">
      {kicker && (
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          {kicker}
        </div>
      )}

      <h1
        className="font-display uppercase leading-[0.85] tracking-[0.005em] text-balance break-words"
        style={{ fontSize: 'clamp(48px, 9vw, 144px)' }}
      >
        <HeroGlitch
          className="block"
          minInterval={4}
          maxInterval={10}
          intensity={8}
          dataCorruption
          scanlines
        >
          <span className="text-text-primary">{title}</span>
        </HeroGlitch>
        <HeroGlitch
          className="block"
          minInterval={5}
          maxInterval={12}
          intensity={7}
          dataCorruption={false}
          colors={['#ff8000', '#ffae42']}
        >
          <span
            className="text-rga-mod"
            style={{
              textShadow:
                '0 0 36px rgba(255,128,0,0.45), 0 0 80px rgba(255,128,0,0.18)',
            }}
          >
            {accent}
          </span>
        </HeroGlitch>
      </h1>

      {intro && (
        <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {intro}
        </p>
      )}
    </div>
  )
}
