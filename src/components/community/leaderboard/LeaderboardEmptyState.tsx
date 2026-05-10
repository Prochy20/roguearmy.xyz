import { CyberCorners } from '@/components/ui/CyberCorners'
import { CyberButton } from '@/components/members/CyberButton'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

const DISCORD_INVITE = 'https://dc.roguearmy.xyz'

export function LeaderboardEmptyState() {
  return (
    <CyberCorners color="green" size="lg" glow>
      <div className="flex flex-col items-center gap-7 border border-rga-green/25 bg-[rgba(0,0,0,0.45)] px-8 py-20 text-center sm:px-12 sm:py-28">
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-rga-green">
          // BOARD UNINITIALIZED
        </div>
        <h3
          className="font-display uppercase leading-[0.9] text-text-primary"
          style={{ fontSize: 'clamp(40px, 7vw, 96px)', textShadow: '0 0 32px rgba(0,255,65,0.25)' }}
        >
          THE BOARD <br className="hidden sm:block" /> IS BLANK
        </h3>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Nobody has earned XP in this guild yet. Be the first to take the throne.
        </p>
        <CyberButton
          href={DISCORD_INVITE}
          external
          color="green"
          iconLeft={<DiscordIcon className="h-4 w-4" />}
          className="px-8 py-5"
        >
          DROP IN · CLAIM #01
        </CyberButton>
      </div>
    </CyberCorners>
  )
}
