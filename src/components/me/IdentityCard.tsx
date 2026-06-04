import Image from 'next/image'
import Link from 'next/link'
import { CyberCorners } from '@/components/ui/CyberCorners'
import type { PrimaryBadge } from '@/lib/auth/badges'
import { AfkTicker } from '@/components/afk/AfkTicker'
import type { AfkRecord } from '@/components/afk/types'
import { MetaCell } from './MetaCell'
import { StatusPill } from './StatusPill'
import { UtcClock } from './UtcClock'

interface IdentityCardProps {
  /** Big H1 codename — typically the user's globalName or username, uppercased. */
  codename: string
  /** Handle shown in the meta grid (without the leading "@"). */
  handle: string
  /** Full 17-19 digit Discord snowflake. */
  discordId: string
  /** Pre-formatted join date (e.g. "MAR 14, 2020") or em-dash placeholder. */
  memberSince: string
  /** Absolute URL of the avatar to render via next/image. */
  avatarUrl: string
  /** Resolved primary badge from getMemberAuth. */
  badge: PrimaryBadge
  /** True only when BOOSTER decoration applies alongside a non-BOOSTER primary badge. */
  isBooster: boolean
  /** Active AFK record (null when active). */
  afkRecord?: AfkRecord | null
  /**
   * True when /api/afk/me failed but the symbolic-role snapshot says the
   * user is AFK. Drives a boolean-only "STATE UNRESOLVED" pill.
   */
  afkFallbackBoolean?: boolean
}

type BadgeKey = PrimaryBadge

type CornerColor = 'green' | 'cyan' | 'magenta' | 'gray' | 'dev'

const BADGE_THEME: Record<
  BadgeKey,
  { hex: string; glow: string; eyebrow: string; corner: CornerColor }
> = {
  DEVELOPER: {
    hex: '#CCFF00',
    glow: 'rgba(204,255,0,0.55)',
    eyebrow: 'TIER · CORE ENGINEERING',
    corner: 'dev',
  },
  STAFF: {
    hex: '#00FF41',
    glow: 'rgba(0,255,65,0.55)',
    eyebrow: 'TIER · COMMAND',
    corner: 'green',
  },
  BOOSTER: {
    hex: '#FF00FF',
    glow: 'rgba(255,0,255,0.55)',
    eyebrow: 'TIER · PATRON',
    corner: 'magenta',
  },
  MEMBER: {
    hex: '#9aa3a6',
    glow: 'rgba(154,163,166,0.4)',
    eyebrow: 'TIER · OPERATIVE',
    corner: 'gray',
  },
}

export function IdentityCard({
  codename,
  handle,
  discordId,
  memberSince,
  avatarUrl,
  badge,
  isBooster,
  afkRecord = null,
  afkFallbackBoolean = false,
}: IdentityCardProps) {
  const theme = BADGE_THEME[badge] ?? BADGE_THEME.MEMBER
  const refTail = discordId.slice(-6)
  const formCode = `CLR-${badge.slice(0, 3)}`

  return (
    <section data-screen-label="01 Identity" className="relative">
      <OperationalStrip refTail={refTail} />

      <div className="relative border border-[rgba(255,255,255,0.08)] bg-linear-to-b from-[rgba(255,255,255,0.018)] to-[rgba(0,0,0,0.35)]">
        <HatchedHeader themeHex={theme.hex} formCode={formCode} />

        <div className="grid grid-cols-1 gap-8 p-5 sm:p-7 lg:grid-cols-[236px_1fr] lg:gap-10 lg:p-10">
          <div className="flex flex-col gap-3">
            <CredentialAvatar src={avatarUrl} alt={codename} corner={theme.corner} />
            {isBooster && (
              <StatusPill label="BOOSTER" value="ACTIVE" tone="magenta" pulse={false} />
            )}
            <PresencePill
              afkRecord={afkRecord}
              afkFallbackBoolean={afkFallbackBoolean}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
                // CODENAME
              </div>
              <h1
                className="m-0 break-words font-display uppercase leading-[0.86] text-text-primary"
                style={{
                  fontSize: 'clamp(44px, 7vw, 104px)',
                  letterSpacing: '0.01em',
                  textShadow: `-1px 0 ${theme.hex}55, 1px 0 #FF00FF44, 0 0 20px rgba(0,255,65,0.1)`,
                }}
              >
                {codename}
              </h1>
            </div>

            <div className="flex min-w-0 flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                CLEARANCE
              </span>
              <span
                className="break-words font-display uppercase leading-none"
                style={{
                  fontSize: 'clamp(22px, 5vw, 46px)',
                  letterSpacing: '0.05em',
                  color: theme.hex,
                  textShadow: `0 0 18px ${theme.glow}`,
                }}
              >
                {badge}
              </span>
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                // {theme.eyebrow}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              <MetaCell label="DISCORD_ID" value={discordId} />
              <MetaCell label="MEMBER_SINCE" value={memberSince} />
              <MetaCell
                label="STATUS"
                value="ACTIVE"
                statusDot={{ tone: 'green', pulse: true }}
              />
              <MetaCell label="HANDLE" value={`@${handle}`} />
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

function PresencePill({
  afkRecord,
  afkFallbackBoolean,
}: {
  afkRecord: AfkRecord | null
  afkFallbackBoolean: boolean
}) {
  if (afkRecord) {
    return (
      <Link href="/afk" aria-label="Manage AFK status" className="flex flex-col gap-1.5">
        <StatusPill
          label="AFK"
          value={<AfkTicker createdAt={afkRecord.createdAt} variant="compact" />}
          tone="rose"
        />
        {afkRecord.reason && (
          <span
            className="truncate font-mono text-[11px] text-text-muted"
            title={afkRecord.reason}
          >
            &gt; &quot;{afkRecord.reason}&quot;
          </span>
        )}
      </Link>
    )
  }

  if (afkFallbackBoolean) {
    return (
      <Link href="/afk" aria-label="Manage AFK status">
        <StatusPill label="AFK" value="STATE UNRESOLVED" tone="rose" pulse={false} />
      </Link>
    )
  }

  return (
    <Link href="/afk" aria-label="Open status console">
      <StatusPill label="ACTIVE" value="OPEN CONSOLE →" tone="green" />
    </Link>
  )
}

function OperationalStrip({ refTail }: { refTail: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
      <span
        aria-hidden
        className="me-dot-pulse inline-block h-2 w-2 rounded-[1px]"
        style={{ background: '#00FF41', boxShadow: '0 0 8px #00FF41' }}
      />
      <span className="text-rga-green">ROGUE_ARMY</span>
      <span>/</span>
      <span className="text-text-primary">OPERATIVE FILE</span>
      <span
        aria-hidden
        className="hidden h-px flex-1 min-w-10 max-w-[320px] bg-linear-to-r from-rga-green/20 to-transparent sm:inline-block"
      />
      <span className="text-text-muted">REF · {refTail}</span>
      <UtcClock />
    </div>
  )
}

function HatchedHeader({ themeHex, formCode }: { themeHex: string; formCode: string }) {
  return (
    <div
      className="relative flex items-center justify-between gap-4 overflow-hidden border-b border-[rgba(255,255,255,0.08)] px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted sm:px-6"
      style={{
        background: `repeating-linear-gradient(135deg, ${themeHex}0a 0 10px, transparent 10px 20px)`,
      }}
    >
      <span style={{ color: themeHex }}>// IDENTITY CREDENTIAL · RGA-PERSONNEL</span>
      <span className="hidden sm:inline">FORM 01 / {formCode}</span>
    </div>
  )
}

function CredentialAvatar({
  src,
  alt,
  corner,
}: {
  src: string
  alt: string
  corner: CornerColor
}) {
  return (
    <CyberCorners color={corner} size="lg" glow>
      <div className="relative aspect-square w-full overflow-hidden border border-rga-green/30 shadow-[0_0_24px_rgba(0,255,65,0.18)]">
        <Image
          src={src}
          alt={alt}
          width={236}
          height={236}
          className="h-full w-full object-cover"
          unoptimized
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${HEX_BY_CORNER[corner]}1a 0%, transparent 60%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </CyberCorners>
  )
}

const HEX_BY_CORNER: Record<CornerColor, string> = {
  green: '#00FF41',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  gray: '#9aa3a6',
  dev: '#CCFF00',
}
