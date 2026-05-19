import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import { fetchAshleyUser, type AshleyResult } from '@/lib/api/server'
import { FailRow } from '@/components/shared/FailRow'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { CountUp } from '@/components/shared/CountUp'
import { TierBand } from '@/components/community/leaderboard/formation/TierBand'
import type { PrimaryBadge } from '@/lib/auth/badges'

export const metadata = {
  title: 'Operative File | Rogue Army',
  description: 'Your personal RGA operative dossier.',
}

type AshleyMe = {
  user: {
    discordId: string
    avatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    serverAvatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    discordRoles: Array<{ id: string; name: string; color: string | null; managed: boolean }>
    joinedAt: string | null
  }
}

type AshleyLevel = {
  level: number
  /** Optional configured label for the current level (e.g. "VETERAN"). */
  levelLabel?: unknown
  xp: number
  progress: number
  nextLevel?: {
    level: number
    xpRequired: number
    /** Optional configured label for the next level (e.g. "ELITE"). */
    label?: unknown
  } | null
  xpToNextLevel?: unknown
}

export default async function MePage() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    redirect('/auth/login?returnTo=/me')
  }

  const accessToken = await getAshleyAccessCookie()
  // Local member fields (joinedDiscordAt, joinedAt) ride along on `auth.member`
  // from getMemberAuth — no second findByID needed for the MEMBER_SINCE fallback.
  const [ashleyMe, ashleyLevel] = await Promise.all([
    fetchAshleyUser<AshleyMe>(accessToken, (c) => c.GET('/api/auth/me')),
    fetchAshleyUser<AshleyLevel>(accessToken, (c) => c.GET('/api/leveling/me')),
  ])

  const displayName = (auth.member.globalName ?? auth.member.username).toUpperCase()
  const avatarUrl =
    ashleyMe.ok && (ashleyMe.data.user.serverAvatarUrls?.['256'] ?? ashleyMe.data.user.avatarUrls?.['256'])
      ? (ashleyMe.data.user.serverAvatarUrls?.['256'] ?? ashleyMe.data.user.avatarUrls!['256'])
      : getDiscordAvatarUrl(auth.member.discordId, auth.member.avatar)

  const ashleyOnline = ashleyMe.ok || ashleyLevel.ok

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-28">
      {/* SEC_01 — IDENTITY + PROGRESSION */}
      <section className="me-fade me-fade--01">
        <SectionHeader
          num="01"
          eyebrow="PERSONNEL FILE"
          kicker={
            ashleyOnline
              ? '// active operative — clearance verified'
              : '// upstream offline — auxiliary data only'
          }
          title={displayName}
        />

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[256px_1fr] lg:gap-14">
          <Avatar src={avatarUrl} alt={displayName} />
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
            <ClearanceInsignia badge={auth.primaryBadge} booster={auth.isBooster} />
            <MetaGrid
              rows={[
                ['DISCORD_ID', auth.member.discordId],
                ['MEMBER_SINCE', formatJoined(ashleyMe, auth.member)],
                ['STATUS', auth.status === 'active' ? 'ACTIVE' : (auth.status ?? 'UNKNOWN')],
                ['CODENAME', auth.member.username],
              ]}
              statusActive={auth.status === 'active'}
            />
            <ProgressionBand level={ashleyLevel} />
          </div>
        </div>
      </section>

      {/* SEC_02 — ROLE LATTICE */}
      <section className="me-fade me-fade--02 mt-14 sm:mt-24 lg:mt-40">
        <SectionHeader
          num="02"
          eyebrow="ROLE LATTICE"
          kicker={
            ashleyMe.ok
              ? '// resolved from upstream'
              : ashleyMe.error.code === 'unauthenticated'
                ? '// session not established'
                : '// resolution failed'
          }
          title="ASSIGNMENTS"
        />
        <RoleStrip ashleyMe={ashleyMe} />
      </section>

      {/* CSS-only motion. Keeps the whole page a server component. */}
      <style>{ME_STYLES}</style>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// SectionHeader — direct port of design_handoff/component-library.jsx:140
// ─────────────────────────────────────────────────────────────────────────

function SectionHeader({
  num,
  eyebrow,
  kicker,
  title,
}: {
  num: string
  eyebrow: string
  kicker: string
  title: string
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b border-[rgba(255,255,255,0.08)] pb-6 sm:mb-9 sm:grid sm:grid-cols-[120px_1fr] sm:items-baseline sm:gap-8 sm:pb-7">
      <div className="flex items-baseline gap-3 sm:block">
        <div className="font-mono text-[11px] tracking-[0.35em] text-rga-green">SEC_{num}</div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-text-muted sm:mt-2.5">
          {eyebrow}
        </div>
      </div>
      <div className="min-w-0">
        <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.3em] text-text-secondary">
          {kicker}
        </div>
        <h2 className="font-display text-[clamp(28px,7vw,88px)] uppercase leading-[0.92] tracking-[0.005em] text-balance break-words">
          {title}
        </h2>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Clearance insignia — promoted-rank visual; treats badge as primary identity
// rather than a metadata row. BOOSTER decorator only renders when there's a
// competing functional badge (DEV/STAFF), per pickPrimaryBadge precedence.
// ─────────────────────────────────────────────────────────────────────────

const BADGE_THEME: Record<
  PrimaryBadge,
  { color: string; glow: string; eyebrow: string }
> = {
  DEVELOPER: { color: '#00FFFF', glow: 'rgba(0,255,255,0.55)', eyebrow: 'TIER · CORE ENGINEERING' },
  STAFF: { color: '#00FF41', glow: 'rgba(0,255,65,0.55)', eyebrow: 'TIER · COMMAND' },
  BOOSTER: { color: '#FF00FF', glow: 'rgba(255,0,255,0.55)', eyebrow: 'TIER · PATRON' },
  MEMBER: { color: '#9aa3a6', glow: 'rgba(154,163,166,0.4)', eyebrow: 'TIER · OPERATIVE' },
}

function ClearanceInsignia({ badge, booster }: { badge: PrimaryBadge; booster: boolean }) {
  const theme = BADGE_THEME[badge] ?? BADGE_THEME.MEMBER
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[rgba(255,255,255,0.08)] pb-5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">CLEARANCE</span>
        <span
          className="font-display uppercase leading-none break-words"
          style={{
            fontSize: 'clamp(22px,5vw,52px)',
            letterSpacing: '0.05em',
            color: theme.color,
            textShadow: `0 0 18px ${theme.glow}`,
          }}
        >
          [ {badge} ]
        </span>
        <span
          className="font-mono uppercase mt-1 break-words"
          style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)' }}
        >
          // {theme.eyebrow}
        </span>
      </div>

      {booster && (
        <div className="flex items-center gap-2 border border-rga-magenta/40 bg-[rgba(255,0,255,0.05)] px-3 py-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-[1px]"
            style={{
              background: '#FF00FF',
              boxShadow: '0 0 8px #FF00FF',
            }}
          />
          <span
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.25em', color: '#FF00FF' }}
          >
            BOOSTER · ACTIVE
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Identity block primitives
// ─────────────────────────────────────────────────────────────────────────

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full max-w-[256px]">
      <CyberCorners color="green" size="lg" glow>
        <div className="relative aspect-square w-full overflow-hidden border border-rga-green/30 shadow-[0_0_24px_rgba(0,255,65,0.18)]">
          <Image
            src={src}
            alt={alt}
            width={256}
            height={256}
            className="h-full w-full object-cover"
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(0,255,65,0.06)_0%,transparent_60%)]" />
        </div>
      </CyberCorners>
    </div>
  )
}

function MetaGrid({
  rows,
  statusActive,
}: {
  rows: ReadonlyArray<readonly [string, string]>
  statusActive: boolean
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1.5">
          <dt className="font-mono text-[10px] tracking-[0.3em] text-text-muted">{label}</dt>
          <dd className="flex items-center gap-2 font-mono text-sm text-text-primary">
            {label === 'STATUS' && (
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-[1px]"
                style={{
                  background: statusActive ? '#00FF41' : '#FF00FF',
                  boxShadow: `0 0 8px ${statusActive ? '#00FF41' : '#FF00FF'}`,
                  animation: statusActive ? 'me-dot-pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            )}
            <span className={label === 'STATUS' && !statusActive ? 'text-rga-magenta' : ''}>
              {value}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Progression band (XP / level) — fail-state aware
// ─────────────────────────────────────────────────────────────────────────

function ProgressionBand({ level }: { level: AshleyResult<AshleyLevel> }) {
  if (!level.ok) {
    return (
      <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] pt-8">
        <div className="font-mono text-[10px] tracking-[0.3em] text-text-muted">PROGRESSION</div>
        <FailRow code={level.error.code} status={level.error.status} returnTo="/me" />
      </div>
    )
  }

  const data = level.data
  const xpToNext = extractXpToNext(data.xpToNextLevel)
  const levelLabel = normalizeLabel(data.levelLabel)
  const nextLevelLabel = normalizeLabel(data.nextLevel?.label)

  return (
    <div className="flex flex-col gap-5 border-t border-[rgba(255,255,255,0.08)] pt-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-text-muted">CURRENT LEVEL</div>
          <div className="mt-1 font-display text-[clamp(48px,7vw,96px)] leading-none tabular-nums text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.35)]">
            <CountUp value={data.level} duration={900} delay={250} padZeros={4} reveal="glitch" />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-[0.3em] text-text-muted">TOTAL XP</div>
          <div className="mt-1 font-mono text-2xl tabular-nums text-text-primary">
            <CountUp value={data.xp} duration={1100} delay={250} locale reveal="glitch" />
          </div>
        </div>
      </div>

      <TierBand
        compact
        level={data.level}
        levelLabel={levelLabel}
        progress={data.progress}
        xpToNextLevel={xpToNext}
        nextLevel={data.nextLevel?.level ?? null}
        nextLevelLabel={nextLevelLabel}
      />
    </div>
  )
}

// xpToNextLevel arrives as either a raw number or a boxed { value } object —
// the schema is opaque (Record<string, never>) so we accept both shapes.
function extractXpToNext(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const n = Number((value as { value: unknown }).value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function normalizeLabel(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  return null
}

// ─────────────────────────────────────────────────────────────────────────
// Role strip — fail-state aware
// ─────────────────────────────────────────────────────────────────────────

function RoleStrip({ ashleyMe }: { ashleyMe: AshleyResult<AshleyMe> }) {
  if (!ashleyMe.ok) {
    return <FailRow code={ashleyMe.error.code} status={ashleyMe.error.status} returnTo="/me" />
  }

  const roles = ashleyMe.data.user.discordRoles
    .filter((r) => r.name !== '@everyone')
    .slice(0, 24)

  if (roles.length === 0) {
    return (
      <div className="font-mono text-[12px] tracking-[0.25em] text-text-muted">
        // NO ASSIGNMENTS ON RECORD
      </div>
    )
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {roles.map((role) => (
        <li key={role.id}>
          <CyberTag color={pickRoleAccent(role.color)}>
            <span className="flex items-center gap-2">
              <span>{role.name}</span>
              {role.managed && (
                <span className="text-[9px] tracking-[0.3em] opacity-60">SYS</span>
              )}
            </span>
          </CyberTag>
        </li>
      ))}
    </ul>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

// Prefer Ashley's freshly-resolved guild join date when available; fall back
// to the local Payload mirror (already loaded by getMemberAuth) so
// MEMBER_SINCE still shows real data when /api/auth/me 500s.
function formatJoined(
  ashleyMe: AshleyResult<AshleyMe>,
  member: { joinedDiscordAt: string | null; joinedAt: string | null },
): string {
  const iso =
    (ashleyMe.ok ? ashleyMe.data.user.joinedAt : null) ??
    member.joinedDiscordAt ??
    member.joinedAt ??
    null
  if (!iso) return '— · ——'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '— · ——'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

// Map an arbitrary Discord role color to one of CyberTag's six accent buckets,
// so role chips stay in voice (gradient + brackets + glow) while still hinting
// at the role's identity. Roles without a color or near-grey collapse to gray.
type CyberTagColor = 'green' | 'cyan' | 'magenta' | 'orange' | 'red' | 'gray'

function pickRoleAccent(hex: string | null): CyberTagColor {
  if (!hex || hex === '#000000') return 'green'
  const m = hex.replace('#', '')
  if (m.length !== 6) return 'green'
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  if (Math.max(r, g, b) - Math.min(r, g, b) < 30) return 'gray'
  if (g > r && g > b) return 'green'
  if (b > r && b > g) return 'cyan'
  if (r >= g && r >= b && b > g) return 'magenta'
  if (r >= g && r >= b && g >= b) return r > 200 && g < 120 ? 'red' : 'orange'
  return 'green'
}

const ME_STYLES = `
  @keyframes me-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes me-dot-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  .me-fade {
    opacity: 0;
    animation: me-fade-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }
  .me-fade--01 { animation-delay: 0.05s; }
  .me-fade--02 { animation-delay: 0.20s; }
  @media (prefers-reduced-motion: reduce) {
    .me-fade { animation: none !important; opacity: 1 !important; }
  }
`
