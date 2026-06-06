import {
  Shield,
  Users,
  Heart,
  Target,
  Flag,
  Swords,
  Compass,
  Crown,
  Zap,
  Radio,
  type LucideIcon,
} from 'lucide-react'
import type { CommunityPage } from '@/payload-types'
import { SectionHeader } from './SectionHeader'

type Tone = 'green' | 'cyan' | 'magenta'
type IconKey = NonNullable<NonNullable<CommunityPage['lore']>['values']>[number]['iconKey']

interface LoreSectionProps {
  content: CommunityPage['lore']
}

const ICONS: Record<IconKey, LucideIcon> = {
  shield: Shield,
  users: Users,
  heart: Heart,
  target: Target,
  flag: Flag,
  swords: Swords,
  compass: Compass,
  crown: Crown,
  zap: Zap,
  radio: Radio,
}

const TONE_THEME: Record<Tone, { icon: string; ring: string; glow: string }> = {
  green: {
    icon: 'text-rga-green',
    ring: 'border-rga-green/30',
    glow: 'group-hover/v:shadow-[0_0_24px_rgba(0,255,65,0.45)]',
  },
  cyan: {
    icon: 'text-rga-cyan',
    ring: 'border-rga-cyan/30',
    glow: 'group-hover/v:shadow-[0_0_24px_rgba(0,255,255,0.45)]',
  },
  magenta: {
    icon: 'text-rga-magenta',
    ring: 'border-rga-magenta/30',
    glow: 'group-hover/v:shadow-[0_0_24px_rgba(255,0,255,0.45)]',
  },
}

export function LoreSection({ content }: LoreSectionProps) {
  const bodyParagraphs = content?.bodyParagraphs ?? []
  const values = content?.values ?? []

  return (
    <section
      id="sec-03"
      className="relative px-4 py-24 sm:px-8 sm:py-32 lg:px-16 lg:py-36"
      aria-labelledby="community-lore-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 80% 20%, rgba(0,255,255,0.05) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader
          num={content?.sectionNum ?? '03'}
          eyebrow={content?.sectionEyebrow ?? 'DOCTRINE'}
          kicker={content?.kicker ?? '// FOUNDED ON A SHORT LIST'}
          title={content?.sectionTitle ?? 'WHY THIS EXISTS'}
        />

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-7">
            {content?.leadParagraph && (
              <p className="text-lg leading-relaxed text-text-primary sm:text-xl">
                {content.leadParagraph}
              </p>
            )}
            {bodyParagraphs.map((p) => (
              <p
                key={p.id ?? p.text}
                className="text-base leading-relaxed text-text-secondary sm:text-lg"
              >
                {p.text}
              </p>
            ))}

            {content?.pullQuoteText && (
              <blockquote className="mt-4 border-l-2 border-rga-green/60 bg-[rgba(0,255,65,0.03)] px-6 py-5">
                <p
                  className="font-display uppercase leading-[1.05] text-text-primary"
                  style={{ fontSize: 'clamp(20px, 2.4vw, 32px)' }}
                >
                  {content.pullQuoteText}
                </p>
                {content.pullQuoteAttribution && (
                  <footer className="mt-3 font-mono text-[10px] tracking-[0.35em] text-rga-green uppercase">
                    {content.pullQuoteAttribution}
                  </footer>
                )}
              </blockquote>
            )}
          </div>

          {values.length > 0 && (
            <ul className="flex flex-col gap-5">
              {values.map((v) => {
                const Icon = ICONS[v.iconKey]
                const theme = TONE_THEME[v.tone]
                return (
                  <li
                    key={v.id ?? v.title}
                    className={`group/v flex gap-5 border bg-[rgba(0,0,0,0.35)] p-6 transition-shadow duration-300 ${theme.ring} ${theme.glow}`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center border ${theme.ring} bg-bg-elevated`}
                    >
                      <Icon className={`h-6 w-6 ${theme.icon}`} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display text-xl uppercase tracking-wide text-text-primary">
                        {v.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-secondary">{v.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
