import { ArrowRight } from 'lucide-react'
import { CyberButton } from '@/components/members/CyberButton'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'

const COPY = {
  kicker: '// MEMBERS-ONLY DOSSIER',
  heading: 'RISE THROUGH\nTHE RANKS',
  body:
    'Every message, every voice minute counts toward your XP. Sign in to see where you stand on the live leaderboard — top 20, your rank, your cohort.',
  bullets: [
    { label: 'LIVE XP RANKING', tone: 'green' as const },
    { label: 'TOP 20 + YOUR COHORT', tone: 'cyan' as const },
    { label: 'MEMBERS ONLY', tone: 'magenta' as const },
  ],
  cta: { label: 'VIEW LEADERBOARD', href: '/leaderboard' },
} as const

/**
 * Discoverability CTA on `/community` for the gated leaderboard page.
 * Logged-out clicks land on the auth screen (redirect handled by `/leaderboard`).
 */
export function LeaderboardTeaser() {
  return (
    <section
      id="sec-leaderboard"
      className="relative px-4 py-20 sm:px-8 sm:py-28 lg:px-16 lg:py-32"
      aria-labelledby="community-leaderboard-teaser"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 85% 20%, rgba(0,255,65,0.06) 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 15% 90%, rgba(0,255,255,0.05) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1480px]">
        <CyberCorners color="green" size="lg" glow>
          <div className="relative grid grid-cols-1 gap-10 border border-rga-green/20 bg-[rgba(0,0,0,0.55)] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:p-16">
            {/* Faint scanline texture — ties back to JoinCTA */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
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

            <div className="relative flex flex-col gap-5">
              <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-rga-green">
                {COPY.kicker}
              </div>
              <h2
                id="community-leaderboard-teaser"
                className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-primary"
                style={{
                  fontSize: 'clamp(36px, 5vw, 80px)',
                  textShadow: '0 0 36px rgba(0,255,65,0.25)',
                  whiteSpace: 'pre-line',
                }}
              >
                {COPY.heading}
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                {COPY.body}
              </p>
              <ul className="flex flex-wrap gap-3 pt-1">
                {COPY.bullets.map((b) => (
                  <li key={b.label}>
                    <CyberTag color={b.tone}>{b.label}</CyberTag>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex flex-col items-start gap-3 lg:items-end">
              <CyberButton
                href={COPY.cta.href}
                color="green"
                iconRight={<ArrowRight className="h-4 w-4" />}
                className="px-8 py-5"
              >
                {COPY.cta.label}
              </CyberButton>
              <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
                // SIGN-IN REQUIRED
              </div>
            </div>
          </div>
        </CyberCorners>
      </div>
    </section>
  )
}
