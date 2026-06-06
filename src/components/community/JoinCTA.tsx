import { ArrowRight } from 'lucide-react'
import type { CommunityPage } from '@/payload-types'
import { CyberButton } from '@/components/ui/CyberButton'
import { CyberTag } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/ui/DiscordIcon'
import { SectionHeader } from './SectionHeader'

interface JoinCTAProps {
  content: CommunityPage['joinCta']
}

export function JoinCTA({ content }: JoinCTAProps) {
  const eligibility = content.eligibility ?? []
  const primary = content.primaryButton
  const secondary = content.secondaryButton
  const primaryExternal = primary.href.startsWith('http')
  const secondaryExternal = secondary.href.startsWith('http')

  return (
    <section
      id="sec-04"
      className="relative overflow-hidden border-t border-[rgba(255,255,255,0.06)] px-4 py-28 sm:px-8 sm:py-36 lg:px-16 lg:py-44"
      aria-labelledby="community-join-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,255,65,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 30% 40% at 50% 0%, rgba(255,0,255,0.06) 0%, transparent 50%)
          `,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 3px,
            rgba(0,255,65,0.6) 3px,
            rgba(0,255,65,0.6) 4px
          )`,
        }}
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 text-center">
        <SectionHeader
          num={content.sectionNum ?? '04'}
          eyebrow={content.sectionEyebrow ?? 'JOIN'}
          kicker={content.kicker ?? '// RECRUITMENT ORDER · OPEN STANDING'}
          title={content.sectionTitle ?? 'STAND THE WATCH'}
          align="center"
        />

        {content.body && (
          <p className="max-w-2xl text-lg leading-relaxed text-text-primary sm:text-xl">
            {content.body}
          </p>
        )}

        {eligibility.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {eligibility.map((item) => (
              <li key={item.id ?? item.label}>
                <CyberTag color={item.tone}>{item.label}</CyberTag>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:gap-5">
          <CyberButton
            href={primary.href}
            external={primaryExternal}
            color="green"
            iconLeft={<DiscordIcon className="h-4 w-4" />}
            className="px-8 py-5"
          >
            {primary.label}
          </CyberButton>
          <CyberButton
            href={secondary.href}
            external={secondaryExternal}
            color="cyan"
            iconRight={<ArrowRight className="h-4 w-4" />}
            className="px-8 py-5"
          >
            {secondary.label}
          </CyberButton>
        </div>

        {content.footer && (
          <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-text-muted">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-[1px] bg-rga-green shadow-[0_0_8px_#00FF41] animate-pulse"
            />
            <span>{content.footer}</span>
          </div>
        )}
      </div>
    </section>
  )
}
