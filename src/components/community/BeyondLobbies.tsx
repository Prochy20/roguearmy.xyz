import { Check, X } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

interface ComparisonRow {
  /** Pain-point in random Discord servers / generic communities. */
  elsewhere: string
  /** What RGA does instead. */
  here: string
}

const COPY = {
  kicker: '// THE INVENTORY OF DIFFERENCES',
  heading: 'NOT YOUR AVERAGE LOBBY',
  intro:
    'Most Discord servers are chat rooms with a member count. We’ve all been in them. Here’s the short list of things we did on purpose differently.',
  rows: [
    {
      elsewhere: 'Skill gates and tryouts',
      here: 'Mixed skill — show up, jump in',
    },
    {
      elsewhere: 'Engagement-bait pings',
      here: 'Game roles · opt in to what you play',
    },
    {
      elsewhere: 'Toxic randos drowning the chat',
      here: 'Mature 25+ regulars · zero tolerance for hate',
    },
    {
      elsewhere: '"Active 24/7" promises',
      here: 'Working adults · evenings and weekends',
    },
    {
      elsewhere: 'Algorithmic feed · ad-supported',
      here: 'Volunteer-run · $0, forever',
    },
    {
      elsewhere: 'Single-title gatekeeping',
      here: 'Game-agnostic · Division 2 to Sea of Thieves',
    },
    {
      elsewhere: 'Member-count flexing',
      here: 'Quality over quantity · friendship first',
    },
  ] as readonly ComparisonRow[],
} as const

export function BeyondLobbies() {
  return (
    <section
      id="sec-02"
      className="relative px-4 py-24 sm:px-8 sm:py-32 lg:px-16 lg:py-36"
      aria-labelledby="community-differences-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 15% 80%, rgba(255,0,255,0.04) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader num="02" eyebrow="DIFFERENTIATION" kicker={COPY.kicker} title={COPY.heading} />

        <p className="mb-10 max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {COPY.intro}
        </p>

        <div className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-1 border-b border-[rgba(255,255,255,0.08)] sm:grid-cols-[1fr_1fr]">
            <ColumnHeader label="ELSEWHERE" tone="magenta" />
            <ColumnHeader label="ROGUE ARMY" tone="green" rightDivider={false} />
          </div>

          <ul>
            {COPY.rows.map((row, i) => (
              <li
                key={row.here}
                className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr] ${
                  i < COPY.rows.length - 1
                    ? 'border-b border-[rgba(255,255,255,0.06)]'
                    : ''
                }`}
              >
                <ComparisonCell text={row.elsewhere} kind="elsewhere" />
                <ComparisonCell text={row.here} kind="here" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function ColumnHeader({
  label,
  tone,
  rightDivider = true,
}: {
  label: string
  tone: 'green' | 'magenta'
  rightDivider?: boolean
}) {
  const toneClass =
    tone === 'green'
      ? 'text-rga-green [text-shadow:0_0_18px_rgba(0,255,65,0.45)]'
      : 'text-rga-magenta [text-shadow:0_0_18px_rgba(255,0,255,0.45)]'
  return (
    <div
      className={`px-5 py-4 font-mono text-[11px] tracking-[0.35em] uppercase ${toneClass} ${
        rightDivider ? 'border-b border-[rgba(255,255,255,0.06)] sm:border-b-0 sm:border-r' : ''
      }`}
    >
      {`// ${label}`}
    </div>
  )
}

function ComparisonCell({ text, kind }: { text: string; kind: 'elsewhere' | 'here' }) {
  const isHere = kind === 'here'
  const Icon = isHere ? Check : X
  const iconClass = isHere
    ? 'text-rga-green [filter:drop-shadow(0_0_6px_rgba(0,255,65,0.6))]'
    : 'text-rga-magenta [filter:drop-shadow(0_0_6px_rgba(255,0,255,0.6))]'
  const textClass = isHere ? 'text-text-primary' : 'text-text-muted line-through decoration-[rgba(255,0,255,0.4)] decoration-1'

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 ${
        isHere
          ? 'sm:border-l sm:border-[rgba(255,255,255,0.06)]'
          : 'border-b border-[rgba(255,255,255,0.04)] sm:border-b-0'
      }`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} aria-hidden />
      <span className={`text-sm leading-relaxed sm:text-base ${textClass}`}>{text}</span>
    </div>
  )
}
