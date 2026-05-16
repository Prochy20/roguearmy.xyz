import { cn } from '@/lib/utils'
import type { StaffAccent } from './types'
import { initialsOf } from './utils'

interface StaffPortraitProps {
  displayName: string
  avatarUrl: string | null
  accent: StaffAccent
  className?: string
}

const ACCENT_GRADIENT: Record<StaffAccent, string> = {
  green:
    'radial-gradient(ellipse 80% 70% at 30% 20%, rgba(0,255,65,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 90%, rgba(0,255,65,0.18) 0%, transparent 55%)',
  cyan: 'radial-gradient(ellipse 80% 70% at 30% 20%, rgba(0,255,255,0.32) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 90%, rgba(0,255,255,0.18) 0%, transparent 55%)',
  magenta:
    'radial-gradient(ellipse 80% 70% at 30% 20%, rgba(255,0,255,0.30) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 90%, rgba(255,0,255,0.18) 0%, transparent 55%)',
}

const ACCENT_TEXT: Record<StaffAccent, string> = {
  green: 'text-rga-green [text-shadow:0_0_24px_rgba(0,255,65,0.55)]',
  cyan: 'text-rga-cyan [text-shadow:0_0_24px_rgba(0,255,255,0.55)]',
  magenta: 'text-rga-magenta [text-shadow:0_0_24px_rgba(255,0,255,0.55)]',
}

const ACCENT_BORDER: Record<StaffAccent, string> = {
  green: 'border-rga-green/25',
  cyan: 'border-rga-cyan/25',
  magenta: 'border-rga-magenta/25',
}

/**
 * Tactical ID-portrait. Real Discord avatars would land here once Ashley sync
 * is wired up; until then (or when avatarUrl is null) we render a stylised
 * gradient + initials block that matches the page's HUD register. The dot
 * grid + crosshair + scanline overlay are pure CSS so the portrait reads as
 * a designed surface rather than a missing-asset placeholder.
 */
export function StaffPortrait({ displayName, avatarUrl, accent, className }: StaffPortraitProps) {
  const initials = initialsOf(displayName)

  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden border bg-[rgba(0,0,0,0.55)]',
        ACCENT_BORDER[accent],
        className,
      )}
    >
      {avatarUrl ? (
        // Real avatar path — wrapped in the same HUD frame so cards stay visually homogeneous
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {/* Atmospheric gradient */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: ACCENT_GRADIENT[accent] }}
          />

          {/* Dot grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.4) 0.5px, transparent 0.5px)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* Crosshair reticle, centered */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-24 w-24">
              <span className="absolute top-1/2 left-0 h-px w-full bg-white/10" />
              <span className="absolute top-0 left-1/2 h-full w-px bg-white/10" />
            </div>
          </div>

          {/* Initials */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'font-display leading-none uppercase tabular-nums',
                ACCENT_TEXT[accent],
              )}
              style={{
                fontSize: 'clamp(56px, 9vw, 96px)',
                letterSpacing: '0.04em',
              }}
            >
              {initials}
            </span>
          </div>
        </>
      )}

      {/* Scanline overlay — always present, ties to the global HUD vocabulary */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 2px,
            rgba(255,255,255,0.6) 2px,
            rgba(255,255,255,0.6) 3px
          )`,
        }}
      />

      {/* Vignette darkening edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Corner ID tag — top-left */}
      <div className="absolute top-0 left-0 flex items-center gap-1.5 border-r border-b border-white/10 bg-black/70 px-2 py-1 font-mono text-[9px] tracking-[0.3em] text-white/55 uppercase backdrop-blur-sm">
        <span
          aria-hidden
          className={cn(
            'inline-block h-1.5 w-1.5',
            accent === 'green'
              ? 'bg-rga-green shadow-[0_0_6px_#00FF41]'
              : accent === 'cyan'
                ? 'bg-rga-cyan shadow-[0_0_6px_#00FFFF]'
                : 'bg-rga-magenta shadow-[0_0_6px_#FF00FF]',
          )}
        />
        <span>ID</span>
      </div>
    </div>
  )
}
