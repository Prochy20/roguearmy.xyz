import { ArrowRight } from 'lucide-react'
import type { CommunityPage } from '@/payload-types'
import { CyberButton } from '@/components/ui/CyberButton'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'

interface LeaderboardTeaserProps {
  content: CommunityPage['leaderboardTeaser']
}

/**
 * Discoverability CTA on `/community` for the gated leaderboard page.
 * Logged-out clicks land on the auth screen (redirect handled by `/leaderboard`).
 */
export function LeaderboardTeaser({ content }: LeaderboardTeaserProps) {
  const { cta } = content
  const external = cta.href.startsWith('http')

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
              {content.kicker && (
                <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-rga-green">
                  {content.kicker}
                </div>
              )}
              {content.heading && (
                <h2
                  id="community-leaderboard-teaser"
                  className="font-display uppercase leading-[0.92] tracking-[0.005em] text-text-primary"
                  style={{
                    fontSize: 'clamp(36px, 5vw, 80px)',
                    textShadow: '0 0 36px rgba(0,255,65,0.25)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {content.heading}
                </h2>
              )}
              {content.body && (
                <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                  {content.body}
                </p>
              )}
              {content.bullets && content.bullets.length > 0 && (
                <ul className="flex flex-wrap gap-3 pt-1">
                  {content.bullets.map((b) => (
                    <li key={b.id ?? b.label}>
                      <CyberTag color={b.tone}>{b.label}</CyberTag>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative flex flex-col items-start gap-3 lg:items-end">
              <CyberButton
                href={cta.href}
                external={external}
                color="green"
                iconRight={<ArrowRight className="h-4 w-4" />}
                className="px-8 py-5"
              >
                {cta.label}
              </CyberButton>
              {content.footer && (
                <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-text-muted">
                  {content.footer}
                </div>
              )}
            </div>
          </div>
        </CyberCorners>
      </div>
    </section>
  )
}
