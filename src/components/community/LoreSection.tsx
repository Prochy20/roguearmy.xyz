import { Shield, Users, Heart, type LucideIcon } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

type Tone = 'green' | 'cyan' | 'magenta'
type IconKey = 'shield' | 'users' | 'heart'

const ICONS: Record<IconKey, LucideIcon> = {
  shield: Shield,
  users: Users,
  heart: Heart,
}

const COPY = {
  kicker: '// FOUNDED ON A SHORT LIST',
  heading: 'WHY THIS EXISTS',
  leadParagraph:
    'Rogue Army is what happens when you take adult gamers seriously. We don’t recruit for headcount, we don’t farm engagement, and we don’t pretend the chat is family. It’s not. It’s a community of people who like games, run their own lives, and choose to show up here on the evenings and weekends they actually have free.',
  bodyParagraphs: [
    'Started in 2019 by a small group who couldn’t find a server that wasn’t either drama-soaked or recruiting like a corporate Slack — so they built one. The bar to enter is honest: be 25-ish or older, behave like an adult regardless of age, and be willing to log off when life calls.',
    'No vote-to-kick. No engagement bait. No bots monetizing your time. Levels exist — Newcomer through Paragon — but they’re recognition, not gates. Mods are members on rotation. The only metric that matters is whether the place still feels like ours.',
  ],
  values: [
    {
      iconKey: 'shield' as IconKey,
      title: 'DRAMA-FREE',
      description:
        'Harassment, gatekeeping, sweatlord energy: zero tolerance. Three warnings, then out. The mod log is public.',
      tone: 'green' as Tone,
    },
    {
      iconKey: 'users' as IconKey,
      title: 'ADULTS WITH LIVES',
      description:
        'Recommended 25+. Working hours respected. No attendance quotas, no daily-streak guilt-trips.',
      tone: 'cyan' as Tone,
    },
    {
      iconKey: 'heart' as IconKey,
      title: 'FRIENDSHIP FIRST',
      description:
        'Member count is not a metric. We measure success by whether the place still feels like ours.',
      tone: 'magenta' as Tone,
    },
  ],
  pullQuote: {
    text:
      'You don’t need an algorithm to tell you where you belong. You need a door, a handle, and a few good people who show up.',
    attribution: '// FOUNDING DOCTRINE',
  },
} as const

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

export function LoreSection() {
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
          num="03"
          eyebrow="DOCTRINE"
          kicker={COPY.kicker}
          title={COPY.heading}
        />

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-7">
            <p className="text-lg leading-relaxed text-text-primary sm:text-xl">
              {COPY.leadParagraph}
            </p>
            {COPY.bodyParagraphs.map((para) => (
              <p key={para} className="text-base leading-relaxed text-text-secondary sm:text-lg">
                {para}
              </p>
            ))}

            <blockquote className="mt-4 border-l-2 border-rga-green/60 bg-[rgba(0,255,65,0.03)] px-6 py-5">
              <p
                className="font-display uppercase leading-[1.05] text-text-primary"
                style={{ fontSize: 'clamp(20px, 2.4vw, 32px)' }}
              >
                {COPY.pullQuote.text}
              </p>
              <footer className="mt-3 font-mono text-[10px] tracking-[0.35em] text-rga-green uppercase">
                {COPY.pullQuote.attribution}
              </footer>
            </blockquote>
          </div>

          <ul className="flex flex-col gap-5">
            {COPY.values.map((v) => {
              const Icon = ICONS[v.iconKey]
              const theme = TONE_THEME[v.tone]
              return (
                <li
                  key={v.title}
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
        </div>
      </div>
    </section>
  )
}
