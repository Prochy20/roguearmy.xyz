import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CyberCorners } from '@/components/ui/CyberCorners'
import { CLAN_ACCENTS, type ClanAccent } from './accent'
import { ClanLeaderSlot, type ClanLeader } from './ClanLeaderSlot'

interface ClanCardProps {
  name: string
  tag: string
  bannerUrl: string
  bannerAlt: string
  accent: ClanAccent
  /** Dossier index — `01`, `02`, `03`. Pads to two digits in the header chip. */
  index: number
  /** When undefined, the leader slot is skipped entirely (anonymous viewer). */
  leader?: ClanLeader | null
  /** Per-card load-stagger delay. */
  animationDelayMs?: number
  className?: string
}

/**
 * Single regimental-standard dossier card. Identical chassis across all
 * three clans — only the accent color, banner image, name, and tag vary.
 * The leader slot is server-side conditional: not rendered at all for
 * anonymous viewers or when no leader is assigned.
 */
export function ClanCard({
  name,
  tag,
  bannerUrl,
  bannerAlt,
  accent,
  index,
  leader,
  animationDelayMs = 0,
  className,
}: ClanCardProps) {
  const theme = CLAN_ACCENTS[accent]
  const dossierId = `DOSSIER-${tag.toUpperCase()} / ${String(index).padStart(3, '0')}`

  return (
    <article
      className={cn(
        'rga-clan-card group/clan relative flex flex-col',
        'bg-bg-elevated/70 backdrop-blur-sm',
        'transition-[transform,box-shadow] duration-300 ease-out',
        'hover:-translate-y-1',
        className,
      )}
      style={{
        animation: 'rga-clan-card-in 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        animationDelay: `${animationDelayMs}ms`,
      }}
    >
      {/* Left accent rail — the regimental colors. Slightly thickens on hover. */}
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1 transition-[width] duration-300 ease-out',
          'group-hover/clan:w-1.5',
          theme.rail,
        )}
        aria-hidden="true"
      />

      <CyberCorners color={theme.cyberColor} size="md" className="flex h-full flex-col">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 pt-4 pb-3">
          <p
            className="font-mono uppercase text-white/40"
            style={{ fontSize: 10, letterSpacing: '0.18em' }}
          >
            {dossierId}
          </p>
          <span
            className={cn(
              'flex items-center gap-1.5 font-mono uppercase',
              theme.text,
            )}
            style={{ fontSize: 10, letterSpacing: '0.18em' }}
          >
            <span
              className={cn('inline-block h-1.5 w-1.5 rotate-45', theme.rail)}
              aria-hidden="true"
            />
            ACTIVE
          </span>
        </div>

        {/* Banner — the centerpiece. Vertical pennant, soft accent halo behind. */}
        <div className="relative flex items-center justify-center px-5 pt-6 pb-4">
          {/* Halo gradient. Tied to accent via inline rgb so the brightness stays
              intentional — Tailwind opacity utilities round too aggressively. */}
          <span
            className="pointer-events-none absolute inset-x-8 top-4 bottom-2 rounded-full blur-3xl transition-opacity duration-500 ease-out opacity-30 group-hover/clan:opacity-55"
            style={{
              background: `radial-gradient(60% 60% at 50% 45%, rgba(${theme.haloRgb}, 0.55) 0%, rgba(${theme.haloRgb}, 0) 65%)`,
            }}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[260px] aspect-4/7">
            {/* Banners are static PNGs under /public/division2/img/clans/,
                referenced by path in the CMS — same pattern as the raids
                schedule. Local static assets pass through Next's optimizer
                without remotePatterns plumbing. */}
            <Image
              src={bannerUrl}
              alt={bannerAlt}
              fill
              sizes="(max-width: 1024px) 60vw, 260px"
              className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
              priority={index <= 3}
            />
            {/* Specular highlight along the banner top edge — cloth catching light. */}
            <span
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* In-game name + in-game tag — mirrors the Discord card labels so
            there's no ambiguity which token goes into the search box and which
            is the @-prefixed clan tag in chat. Two labeled columns; tag is the
            accent-colored pill on the right. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-1.5 px-5 pt-2 pb-5">
          <p
            className="font-mono uppercase text-white/35"
            style={{ fontSize: 10, letterSpacing: '0.22em' }}
          >
            CLAN NAME
          </p>
          <p
            className="font-mono uppercase text-white/35 text-right"
            style={{ fontSize: 10, letterSpacing: '0.22em' }}
          >
            CLAN TAG
          </p>

          <h3
            className="font-display text-white truncate"
            style={{ fontSize: 20, letterSpacing: '0.02em', lineHeight: 1.1 }}
            title={name}
          >
            {name}
          </h3>
          <span
            className={cn(
              'shrink-0 justify-self-end border px-2 py-0.5 font-mono uppercase',
              theme.border,
              theme.fill,
              theme.text,
            )}
            style={{ fontSize: 11, letterSpacing: '0.22em' }}
          >
            {tag}
          </span>
        </div>

        {/* Leader slot — members only. Rendered when leader is provided; absent
            (and the card terminates cleanly) for anonymous viewers. */}
        {leader && (
          <div className="mt-auto border-t border-white/8 px-5 pt-4 pb-5">
            <ClanLeaderSlot leader={leader} accent={accent} />
          </div>
        )}
      </CyberCorners>
    </article>
  )
}
