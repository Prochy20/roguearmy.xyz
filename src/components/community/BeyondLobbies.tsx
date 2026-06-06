import { Check, X } from 'lucide-react'
import type { CommunityPage } from '@/payload-types'
import { SectionHeader } from './SectionHeader'

interface BeyondLobbiesProps {
  content: CommunityPage['beyondLobbies']
}

export function BeyondLobbies({ content }: BeyondLobbiesProps) {
  const rows = content?.rows ?? []

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
        <SectionHeader
          num={content?.sectionNum ?? '02'}
          eyebrow={content?.sectionEyebrow ?? 'DIFFERENTIATION'}
          kicker={content?.kicker ?? '// THE INVENTORY OF DIFFERENCES'}
          title={content?.sectionTitle ?? 'NOT YOUR AVERAGE LOBBY'}
        />

        {content?.intro && (
          <p className="mb-10 max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {content.intro}
          </p>
        )}

        {rows.length > 0 && (
          <div className="overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-1 border-b border-[rgba(255,255,255,0.08)] sm:grid-cols-[1fr_1fr]">
              <ColumnHeader label={content?.columnHeaderLeft ?? 'ELSEWHERE'} tone="magenta" />
              <ColumnHeader
                label={content?.columnHeaderRight ?? 'ROGUE ARMY'}
                tone="green"
                rightDivider={false}
              />
            </div>

            <ul>
              {rows.map((row, i) => (
                <li
                  key={row.id ?? `${row.elsewhere}-${row.here}`}
                  className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr] ${
                    i < rows.length - 1 ? 'border-b border-[rgba(255,255,255,0.06)]' : ''
                  }`}
                >
                  <ComparisonCell text={row.elsewhere} kind="elsewhere" />
                  <ComparisonCell text={row.here} kind="here" />
                </li>
              ))}
            </ul>
          </div>
        )}
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
  const textClass = isHere
    ? 'text-text-primary'
    : 'text-text-muted line-through decoration-[rgba(255,0,255,0.4)] decoration-1'

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
