import { ArrowRight } from 'lucide-react'
import { CyberButton } from '@/components/members/CyberButton'
import { CyberTag } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { SectionHeader } from './SectionHeader'

const DISCORD_INVITE = 'https://dc.roguearmy.xyz'

const COPY = {
  kicker: '// RECRUITMENT ORDER · OPEN STANDING',
  heading: 'STAND THE WATCH',
  body:
    'The door stays open. Drop your platform and timezone in #intros once you’re in — that’s the whole onboarding.',
  eligibility: [
    { label: '25+', tone: 'green' as const },
    { label: 'SA · UK · EU', tone: 'cyan' as const },
    { label: 'NO SKILL FLOOR', tone: 'green' as const },
    { label: 'OPTIONAL ATTENDANCE', tone: 'cyan' as const },
    { label: '$0 · FOREVER', tone: 'magenta' as const },
  ],
  primaryButton: { label: 'ENLIST · DISCORD', href: DISCORD_INVITE },
  secondaryButton: { label: 'READ THE MANIFESTO', href: '/manifesto' },
  footer: '// ACCEPTING · STATUS LIVE',
} as const

export function JoinCTA() {
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

      {/* Faint scanline texture, low opacity — adds the HUD doc feel */}
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
          num="04"
          eyebrow="JOIN"
          kicker={COPY.kicker}
          title={COPY.heading}
          align="center"
        />

        <p className="max-w-2xl text-lg leading-relaxed text-text-primary sm:text-xl">
          {COPY.body}
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-3">
          {COPY.eligibility.map((item) => (
            <li key={item.label}>
              <CyberTag color={item.tone}>{item.label}</CyberTag>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:gap-5">
          <CyberButton
            href={COPY.primaryButton.href}
            external
            color="green"
            iconLeft={<DiscordIcon className="h-4 w-4" />}
            className="px-8 py-5"
          >
            {COPY.primaryButton.label}
          </CyberButton>
          <CyberButton
            href={COPY.secondaryButton.href}
            color="cyan"
            iconRight={<ArrowRight className="h-4 w-4" />}
            className="px-8 py-5"
          >
            {COPY.secondaryButton.label}
          </CyberButton>
        </div>

        <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-text-muted">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-[1px] bg-rga-green shadow-[0_0_8px_#00FF41] animate-pulse"
          />
          <span>{COPY.footer}</span>
        </div>
      </div>
    </section>
  )
}
