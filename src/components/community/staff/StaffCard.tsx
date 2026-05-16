import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { RichTextRenderer } from '@/components/richtext/RichTextRenderer'
import { StaffPortrait } from './StaffPortrait'
import type { StaffAccent, StaffProfile } from './types'
import { accentFor, formatMonthYear, operativeIdAt } from './utils'

interface StaffCardProps {
  profile: StaffProfile
  index: number
  /** When true, reveals the Discord handle + DM affordance row at the bottom. */
  showMemberSurface: boolean
}

const ACCENT_TEXT: Record<StaffAccent, string> = {
  green: 'text-rga-green',
  cyan: 'text-rga-cyan',
  magenta: 'text-rga-magenta',
  dev: 'text-rga-dev',
  admin: 'text-rga-admin',
  mod: 'text-rga-mod',
}

const ACCENT_FRAME: Record<StaffAccent, string> = {
  green: 'border-rga-green/15 group-hover/card:border-rga-green/40',
  cyan: 'border-rga-cyan/15 group-hover/card:border-rga-cyan/40',
  magenta: 'border-rga-magenta/15 group-hover/card:border-rga-magenta/40',
  dev: 'border-rga-dev/15 group-hover/card:border-rga-dev/40',
  admin: 'border-rga-admin/15 group-hover/card:border-rga-admin/40',
  mod: 'border-rga-mod/15 group-hover/card:border-rga-mod/40',
}

const ACCENT_GLOW_HOVER: Record<StaffAccent, string> = {
  green: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(0,255,65,0.55)]',
  cyan: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(0,255,255,0.55)]',
  magenta: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(255,0,255,0.55)]',
  dev: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(204,255,0,0.55)]',
  admin: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(255,0,102,0.55)]',
  mod: 'group-hover/card:shadow-[0_0_40px_-12px_rgba(255,128,0,0.55)]',
}

const ACCENT_TAPE_BG: Record<StaffAccent, string> = {
  green:
    'bg-linear-to-b from-rga-green/15 via-rga-green/30 to-rga-green/15 border-rga-green/30',
  cyan: 'bg-linear-to-b from-rga-cyan/15 via-rga-cyan/30 to-rga-cyan/15 border-rga-cyan/30',
  magenta:
    'bg-linear-to-b from-rga-magenta/15 via-rga-magenta/30 to-rga-magenta/15 border-rga-magenta/30',
  dev: 'bg-linear-to-b from-rga-dev/15 via-rga-dev/30 to-rga-dev/15 border-rga-dev/30',
  admin:
    'bg-linear-to-b from-rga-admin/15 via-rga-admin/30 to-rga-admin/15 border-rga-admin/30',
  mod: 'bg-linear-to-b from-rga-mod/15 via-rga-mod/30 to-rga-mod/15 border-rga-mod/30',
}

const ACCENT_TAPE_TEXT: Record<StaffAccent, string> = {
  green: 'text-rga-green',
  cyan: 'text-rga-cyan',
  magenta: 'text-rga-magenta',
  dev: 'text-rga-dev',
  admin: 'text-rga-admin',
  mod: 'text-rga-mod',
}

const ACCENT_DOT_BG: Record<StaffAccent, string> = {
  green: 'bg-rga-green',
  cyan: 'bg-rga-cyan',
  magenta: 'bg-rga-magenta',
  dev: 'bg-rga-dev',
  admin: 'bg-rga-admin',
  mod: 'bg-rga-mod',
}

const ACCENT_SCAN_GRADIENT: Record<StaffAccent, string> = {
  green: 'bg-linear-to-r from-transparent via-rga-green/80 to-transparent',
  cyan: 'bg-linear-to-r from-transparent via-rga-cyan/80 to-transparent',
  magenta: 'bg-linear-to-r from-transparent via-rga-magenta/80 to-transparent',
  dev: 'bg-linear-to-r from-transparent via-rga-dev/80 to-transparent',
  admin: 'bg-linear-to-r from-transparent via-rga-admin/80 to-transparent',
  mod: 'bg-linear-to-r from-transparent via-rga-mod/80 to-transparent',
}

const ACCENT_DASH_BORDER: Record<StaffAccent, string> = {
  green: 'border-rga-green/25',
  cyan: 'border-rga-cyan/25',
  magenta: 'border-rga-magenta/25',
  dev: 'border-rga-dev/25',
  admin: 'border-rga-admin/25',
  mod: 'border-rga-mod/25',
}

const ACCENT_DM_BUTTON: Record<StaffAccent, string> = {
  green:
    'border-rga-green/30 text-rga-green hover:border-rga-green hover:bg-rga-green/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,65,0.6)]',
  cyan: 'border-rga-cyan/30 text-rga-cyan hover:border-rga-cyan hover:bg-rga-cyan/10 hover:shadow-[0_0_16px_-4px_rgba(0,255,255,0.6)]',
  magenta:
    'border-rga-magenta/30 text-rga-magenta hover:border-rga-magenta hover:bg-rga-magenta/10 hover:shadow-[0_0_16px_-4px_rgba(255,0,255,0.6)]',
  dev: 'border-rga-dev/30 text-rga-dev hover:border-rga-dev hover:bg-rga-dev/10 hover:shadow-[0_0_16px_-4px_rgba(204,255,0,0.6)]',
  admin:
    'border-rga-admin/30 text-rga-admin hover:border-rga-admin hover:bg-rga-admin/10 hover:shadow-[0_0_16px_-4px_rgba(255,0,102,0.6)]',
  mod: 'border-rga-mod/30 text-rga-mod hover:border-rga-mod hover:bg-rga-mod/10 hover:shadow-[0_0_16px_-4px_rgba(255,128,0,0.6)]',
}

export function StaffCard({ profile, index, showMemberSurface }: StaffCardProps) {
  // Editorial accent wins; null falls back to the hash-derived default so
  // 'auto' rows still get visual variety across the roster.
  const accent = profile.accent ?? accentFor(profile.discordId)
  const operativeId = operativeIdAt(index)
  const discordUrl = `https://discord.com/users/${profile.discordId}`

  return (
    <article
      className={cn(
        'rga-staff-card group/card relative flex h-full w-full transition-all duration-300 ease-out',
        'hover:-translate-y-0.5',
      )}
      style={{ animationDelay: `${80 + index * 60}ms` }}
    >
      {/* Vertical tape strip — the unforgettable detail. A manila-folder label
          with operative ID rotated 90°, running the full height of the card. */}
      <aside
        className={cn(
          'relative flex w-7 shrink-0 items-center justify-center border-y border-l transition-colors duration-300',
          ACCENT_TAPE_BG[accent],
        )}
        aria-hidden
      >
        <div
          className={cn(
            'flex items-center gap-3 whitespace-nowrap font-mono text-[10px] uppercase',
            ACCENT_TAPE_TEXT[accent],
          )}
          style={{
            transform: 'rotate(-90deg)',
            letterSpacing: '0.5em',
          }}
        >
          <span
            aria-hidden
            className={cn('inline-block h-1.5 w-1.5 shrink-0', ACCENT_DOT_BG[accent])}
          />
          <span>{operativeId}</span>
          <span className="opacity-50">·</span>
          <span className="opacity-75">ACTIVE</span>
        </div>
      </aside>

      {/* Main card body */}
      <CyberCorners color={accent} size="sm" glow className="flex flex-1 flex-col">
        <div
          className={cn(
            'relative flex h-full min-h-[460px] flex-1 flex-col border bg-[rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300',
            ACCENT_FRAME[accent],
            ACCENT_GLOW_HOVER[accent],
          )}
        >
          {/* Single scanline sweep that travels top-to-bottom on hover — a
              transition rather than a keyframe loop so the gesture is one-shot
              and respects pointer-leave by reversing back to start. */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-10 h-px translate-y-0 opacity-0 transition-all duration-[900ms] ease-out group-hover/card:translate-y-[460px] group-hover/card:opacity-100',
              ACCENT_SCAN_GRADIENT[accent],
            )}
          />

          {/* Header band: avatar badge + name + role */}
          <div className="flex items-start gap-4 p-4 pb-3">
            <div className="w-24 shrink-0">
              <StaffPortrait
                displayName={profile.cached_displayName}
                avatarUrl={profile.cached_avatarUrl}
                accent={accent}
                size="badge"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h3
                className="font-display leading-[0.95] tracking-[0.01em] text-text-primary uppercase"
                style={{ fontSize: 'clamp(22px, 1.8vw, 28px)' }}
              >
                {profile.cached_displayName}
              </h3>
              <div
                className={cn(
                  'font-mono text-[10px] tracking-[0.3em] uppercase',
                  ACCENT_TEXT[accent],
                )}
              >
                // {profile.roleTitle}
              </div>
            </div>
          </div>

          {/* Separator + tenure data band */}
          <div className="mx-4 mb-3 border-t border-dashed border-white/10" />
          <ul
            className={cn(
              'mx-4 mb-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase',
            )}
          >
            <DataStat label="ENLISTED" value={formatMonthYear(profile.cached_joinedAt)} accent={accent} />
            <DataStat
              label="ON RECORD"
              value={formatMonthYear(profile.cached_accountCreatedAt)}
              accent={accent}
            />
          </ul>

          {/* Bio — Lexical richText. Descendant selectors apply card-level
              typography so links/lists/bold/italic render in the HUD palette. */}
          <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
            {profile.bio ? (
              <RichTextRenderer
                data={profile.bio}
                className="text-sm leading-relaxed text-text-secondary [&_a]:text-rga-cyan [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-rga-cyan/80 [&_strong]:text-text-primary [&_strong]:font-semibold [&_em]:italic [&_code]:rounded-sm [&_code]:bg-white/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-rga-cyan [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p+p]:mt-2 [&_p]:m-0"
              />
            ) : (
              <p className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
                // dossier pending
              </p>
            )}
          </div>

          {/* Member-only contact bar */}
          {showMemberSurface && (
            <div
              className={cn(
                'relative mx-4 mb-4 mt-2 flex items-center justify-between gap-3 border-t border-dashed pt-3',
                ACCENT_DASH_BORDER[accent],
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[9px] tracking-[0.35em] text-text-muted uppercase">
                  // direct line
                </span>
                <code
                  className={cn(
                    'truncate font-mono text-[11px] tracking-wide',
                    profile.cached_username ? ACCENT_TEXT[accent] : 'text-text-muted',
                  )}
                >
                  {profile.cached_username ? `@${profile.cached_username}` : '@ — syncing'}
                </code>
              </div>

              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group/dm relative inline-flex items-center gap-2 border bg-black/40 px-3 py-2 font-mono text-[10px] tracking-[0.3em] uppercase backdrop-blur-md transition-all duration-200',
                  ACCENT_DM_BUTTON[accent],
                )}
                aria-label={`DM ${profile.cached_displayName} on Discord`}
              >
                <DiscordIcon className="h-3 w-3 transition-transform duration-200 group-hover/dm:scale-110" />
                <MessageSquare className="h-3 w-3" aria-hidden />
                <span>DM</span>
              </a>
            </div>
          )}
        </div>
      </CyberCorners>
    </article>
  )
}

interface DataStatProps {
  label: string
  value: string
  accent: StaffAccent
}

/**
 * One row of the tenure data band: muted label + accent-colored value. Keeps
 * the cards' mono-label vocabulary (// PILL · VALUE) but pares it down to
 * scannable label/value pairs that read as personnel-record telemetry.
 */
function DataStat({ label, value, accent }: DataStatProps) {
  return (
    <li className="inline-flex items-baseline gap-2">
      <span className="text-text-muted">{label}</span>
      <span className={cn('text-text-primary', ACCENT_TEXT[accent])}>{value}</span>
    </li>
  )
}
