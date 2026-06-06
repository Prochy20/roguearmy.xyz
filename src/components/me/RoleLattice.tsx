import type { DiscordRole } from '@/payload-types'
import {
  getCategory,
  resolveAccent,
  type LatticeAccent,
  type LatticeCategory,
  type ResolvedAccent,
} from './roleLatticeUtils'

const DISPLAY_CAP = 30

interface RoleLatticeProps {
  roles: DiscordRole[]
}

export function RoleLattice({ roles }: RoleLatticeProps) {
  if (roles.length === 0) {
    return (
      <div className="font-mono text-[12px] tracking-[0.25em] text-text-muted">
        // NO ASSIGNMENTS ON RECORD
      </div>
    )
  }

  const totalCount = roles.length
  const displayed = roles.slice(0, DISPLAY_CAP)
  const omittedCount = totalCount - displayed.length

  const primary = displayed.filter((r) => r.isPrimary && !r.managed)
  const rest = displayed.filter((r) => !(r.isPrimary && !r.managed))

  return (
    <div className="flex flex-col gap-6">
      {primary.length > 0 && <RoleGrid roles={primary} />}
      {rest.length > 0 && <RoleGrid roles={rest} />}

      <Footer
        total={totalCount}
        primaryCount={primary.length}
        omitted={omittedCount}
      />
    </div>
  )
}

// ─── RoleGrid ──────────────────────────────────────────────────────────────

function RoleGrid({ roles }: { roles: DiscordRole[] }) {
  return (
    <ul className="grid grid-cols-1 gap-px bg-rga-green/15 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => (
        <li key={role.id}>
          <RoleCell role={role} />
        </li>
      ))}
    </ul>
  )
}

// ─── RoleCell ──────────────────────────────────────────────────────────────

function RoleCell({ role }: { role: DiscordRole }) {
  const accent = resolveAccent(role)
  const category = getCategory(role)

  const containerStyle =
    category === 'primary' && accent.kind === 'hex'
      ? { backgroundImage: `linear-gradient(to right, ${withAlpha(accent.hex, 0.1)}, transparent)` }
      : undefined
  const containerGradientClass =
    category === 'primary' && accent.kind === 'token'
      ? `bg-linear-to-r ${ACCENT_TOKEN_CLASSES[accent.token].gradient}`
      : ''

  return (
    <div
      className={`relative flex h-full min-h-[88px] flex-col justify-between gap-3 bg-bg-primary px-5 py-4 ${containerGradientClass}`}
      style={containerStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AccentSwatch accent={accent} />
          <RoleGlyph role={role} />
          <span className="font-display text-[18px] font-bold uppercase leading-none tracking-wide text-text-primary">
            {role.name}
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
          POS_{String(role.position).padStart(2, '0')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <CategoryBadge
          label={(role.badgeLabel?.trim() || category).toUpperCase()}
          category={category}
          accent={accent}
        />
        {role.mentionable && (
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
            @MENTION
          </span>
        )}
      </div>
    </div>
  )
}

function AccentSwatch({ accent }: { accent: ResolvedAccent }) {
  if (accent.kind === 'hex') {
    return (
      <span
        aria-hidden
        className="inline-block size-3 shrink-0"
        style={{ backgroundColor: accent.hex }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={`inline-block size-3 shrink-0 ${ACCENT_TOKEN_CLASSES[accent.token].swatch}`}
    />
  )
}

function RoleGlyph({ role }: { role: DiscordRole }) {
  const iconUrls = role.iconUrls as Record<string, string> | null | undefined
  const iconUrl = iconUrls?.['64'] ?? iconUrls?.['128']

  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Discord CDN, not a candidate for next/image
      <img
        src={iconUrl}
        alt=""
        aria-hidden
        className="inline-block size-5 shrink-0 rounded-sm object-contain"
      />
    )
  }

  if (role.unicodeEmoji) {
    return (
      <span
        aria-hidden
        className="inline-flex size-5 shrink-0 items-center justify-center text-[16px] leading-none"
      >
        {role.unicodeEmoji}
      </span>
    )
  }

  return null
}

function CategoryBadge({
  label,
  category,
  accent,
}: {
  label: string
  category: LatticeCategory
  accent: ResolvedAccent
}) {
  const className = 'inline-block border px-2 py-0.5 font-mono text-[10px] tracking-[0.25em]'

  if (category === 'integration') {
    return (
      <span className={`${className} border-text-muted/40 text-text-muted`}>
        {label}
      </span>
    )
  }

  if (accent.kind === 'token' && accent.token === 'gray') {
    return (
      <span className={`${className} border-text-secondary/60 text-text-secondary`}>
        {label}
      </span>
    )
  }

  if (accent.kind === 'hex') {
    return (
      <span
        className={className}
        style={{ color: accent.hex, borderColor: accent.hex }}
      >
        {label}
      </span>
    )
  }

  const cfg = ACCENT_TOKEN_CLASSES[accent.token]
  return <span className={`${className} ${cfg.text} ${cfg.border}`}>{label}</span>
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer({
  total,
  primaryCount,
  omitted,
}: {
  total: number
  primaryCount: number
  omitted: number
}) {
  const omittedSegment =
    omitted > 0 ? ` · ${DISPLAY_CAP} DISPLAYED · ${omitted} OMITTED` : ''
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono text-[10px] tracking-[0.25em] text-text-muted">
      <span>// SORTED BY GUILD HIERARCHY · POS DESC</span>
      <span className="flex items-center gap-2">
        {primaryCount > 0 && (
          <>
            <span aria-hidden className="inline-block size-2 bg-rga-green" />
            <span>
              {primaryCount} PRIMARY · DISPLAYED SEPARATELY
              {omittedSegment && ` · ${total} TOTAL${omittedSegment}`}
            </span>
          </>
        )}
        {primaryCount === 0 && omitted > 0 && (
          <span>
            {total} TOTAL{omittedSegment}
          </span>
        )}
      </span>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

// ─── Accent token → Tailwind classes ───────────────────────────────────────
// Static map so Tailwind JIT sees every utility string. Discord hex colors
// bypass this and use inline style.

const ACCENT_TOKEN_CLASSES: Record<
  LatticeAccent,
  { swatch: string; text: string; border: string; gradient: string }
> = {
  green: {
    swatch: 'bg-rga-green',
    text: 'text-rga-green',
    border: 'border-rga-green',
    gradient: 'from-rga-green/10 to-transparent',
  },
  cyan: {
    swatch: 'bg-rga-cyan',
    text: 'text-rga-cyan',
    border: 'border-rga-cyan',
    gradient: 'from-rga-cyan/10 to-transparent',
  },
  magenta: {
    swatch: 'bg-rga-magenta',
    text: 'text-rga-magenta',
    border: 'border-rga-magenta',
    gradient: 'from-rga-magenta/10 to-transparent',
  },
  orange: {
    swatch: 'bg-rga-orange',
    text: 'text-rga-orange',
    border: 'border-rga-orange',
    gradient: 'from-rga-orange/10 to-transparent',
  },
  chartreuse: {
    swatch: 'bg-rga-chartreuse',
    text: 'text-rga-chartreuse',
    border: 'border-rga-chartreuse',
    gradient: 'from-rga-chartreuse/10 to-transparent',
  },
  yellow: {
    swatch: 'bg-rga-yellow',
    text: 'text-rga-yellow',
    border: 'border-rga-yellow',
    gradient: 'from-rga-yellow/10 to-transparent',
  },
  amber: {
    swatch: 'bg-rga-amber',
    text: 'text-rga-amber',
    border: 'border-rga-amber',
    gradient: 'from-rga-amber/10 to-transparent',
  },
  azure: {
    swatch: 'bg-rga-azure',
    text: 'text-rga-azure',
    border: 'border-rga-azure',
    gradient: 'from-rga-azure/10 to-transparent',
  },
  gold: {
    swatch: 'bg-rga-gold',
    text: 'text-rga-gold',
    border: 'border-rga-gold',
    gradient: 'from-rga-gold/10 to-transparent',
  },
  red: {
    swatch: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    gradient: 'from-red-500/10 to-transparent',
  },
  rose: {
    swatch: 'bg-rga-rose',
    text: 'text-rga-rose',
    border: 'border-rga-rose',
    gradient: 'from-rga-rose/10 to-transparent',
  },
  gray: {
    swatch: 'bg-text-muted',
    text: 'text-text-muted',
    border: 'border-text-muted/40',
    gradient: 'from-text-muted/5 to-transparent',
  },
}

