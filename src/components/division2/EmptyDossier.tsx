import { CyberCorners } from '@/components/ui/CyberCorners'
import { CyberButton } from '@/components/ui/CyberButton'
import { DiscordIcon } from '@/components/ui/DiscordIcon'

const DISCORD_INVITE = 'https://dc.roguearmy.xyz'

type DossierKind =
  | 'ROLE_REQUIRED'
  | 'FEATURE_PENDING'
  | 'AWAITING_FIRST_SYNC'
  | 'NO_RECORD'
  | 'BOOSTER_REQUIRED'
  | 'NO_DIGEST_FOR_WEEK'

interface EmptyDossierProps {
  kind: DossierKind
  /** Used by NO_RECORD and NO_DIGEST_FOR_WEEK copy to surface the period. */
  weekStart?: string
}

interface DossierContent {
  pill: string
  heading: string
  body: string
  hint?: string
  color: 'cyan' | 'magenta' | 'green'
  cta?: { href: string; label: string; external?: boolean }
}

function resolve(kind: DossierKind, weekStart?: string): DossierContent {
  switch (kind) {
    case 'ROLE_REQUIRED':
      return {
        pill: '// CLEARANCE REQUIRED',
        heading: 'OPERATIVE TIER LOCKED',
        body: 'This section is restricted to members holding the Division 2 operator role. Self-serve role assignment runs through Discord — head to #help-roles and the reaction menu will sort you in seconds.',
        hint: '// REQUEST · #help-roles',
        color: 'cyan',
        cta: { href: DISCORD_INVITE, label: 'OPEN DISCORD', external: true },
      }
    case 'FEATURE_PENDING':
      return {
        pill: '// FEATURE PENDING',
        heading: 'OPERATOR CONFIG INCOMPLETE',
        body: 'This tool exists but the role gate hasn’t been wired up by leadership yet. Coordinate with an admin to finish setup — the page will come online once Settings has a game-roles entry assigned.',
        hint: '// AWAITING · ADMIN CONFIG',
        color: 'magenta',
      }
    case 'AWAITING_FIRST_SYNC':
      return {
        pill: '// AWAITING FIRST SYNC',
        heading: 'NO ESCALATION DATA YET',
        body: 'Upstream hasn’t published this week’s rotation, or our ingest hasn’t caught it. Check back after Tuesday’s reset — the page lights up the moment the first week lands.',
        hint: '// RETRY · NEXT CACHE TICK',
        color: 'green',
      }
    case 'NO_RECORD':
      return {
        pill: '// NO RECORD',
        heading: weekStart ? `WEEK OF ${weekStart}` : 'WEEK NOT FOUND',
        body: weekStart
          ? `No escalation data was ingested for the week of ${weekStart}. Either this Tuesday was missed by the sync, or the date isn’t a valid weekStart. Browse known weeks below.`
          : 'The requested week is not in the archive. Browse known weeks below.',
        hint: '// HISTORY · BELOW',
        color: 'magenta',
      }
    case 'BOOSTER_REQUIRED':
      return {
        pill: '// BOOSTER PERK',
        heading: 'DAILY BRIEFING LOCKED',
        body: 'Daily digests are a Rogue Army booster perk. Weekly roll-ups stay open to every operative — the daily AI briefings unlock when you boost the Discord server.',
        hint: '// PERK · DISCORD BOOSTER',
        color: 'magenta',
        cta: { href: DISCORD_INVITE, label: 'OPEN DISCORD', external: true },
      }
    case 'NO_DIGEST_FOR_WEEK':
      return {
        pill: '// NO DIGEST',
        heading: weekStart ? `WEEK OF ${weekStart}` : 'NO DIGEST YET',
        body: weekStart
          ? `No digest has been generated for the week of ${weekStart}. Either Ashley skipped the run or this date is outside the archive.`
          : 'No digests have been generated for this topic yet. Check back after the next scheduled run.',
        hint: '// RETRY · NEXT CACHE TICK',
        color: 'green',
      }
  }
}

export function EmptyDossier({ kind, weekStart }: EmptyDossierProps) {
  const content = resolve(kind, weekStart)
  const borderClass = {
    cyan: 'border-rga-cyan/25',
    magenta: 'border-rga-magenta/25',
    green: 'border-rga-green/25',
  }[content.color]
  const textClass = {
    cyan: 'text-rga-cyan',
    magenta: 'text-rga-magenta',
    green: 'text-rga-green',
  }[content.color]
  const headingShadow = {
    cyan: '0 0 32px rgba(0,255,255,0.25)',
    magenta: '0 0 32px rgba(255,0,255,0.25)',
    green: '0 0 32px rgba(0,255,65,0.25)',
  }[content.color]

  return (
    <CyberCorners color={content.color} size="lg" glow>
      <div
        className={`flex flex-col items-center gap-7 border ${borderClass} bg-[rgba(0,0,0,0.45)] px-8 py-20 text-center sm:px-12 sm:py-28`}
      >
        <div
          className={`font-mono text-[10px] tracking-[0.4em] uppercase ${textClass}`}
        >
          {content.pill}
        </div>
        <h3
          className="font-display uppercase leading-[0.9] text-text-primary"
          style={{ fontSize: 'clamp(32px, 6vw, 80px)', textShadow: headingShadow }}
        >
          {content.heading}
        </h3>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {content.body}
        </p>
        {content.hint && (
          <div className={`font-mono text-[9px] tracking-[0.35em] uppercase ${textClass} opacity-70`}>
            {content.hint}
          </div>
        )}
        {content.cta && (
          <CyberButton
            href={content.cta.href}
            external={content.cta.external}
            color={content.color}
            iconLeft={content.cta.external ? <DiscordIcon className="h-4 w-4" /> : undefined}
            className="px-8 py-5"
          >
            {content.cta.label}
          </CyberButton>
        )}
      </div>
    </CyberCorners>
  )
}
