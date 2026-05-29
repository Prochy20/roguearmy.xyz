import Image from 'next/image'
import Link from 'next/link'
import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { PanelHeader } from '@/components/division2/landing/PanelHeader'
import { formatDayShort, weekdayShort } from '@/lib/division2/format'
import type { Raid } from '@/lib/division2/raids.server'

export interface RaidsScheduleEntry {
  /** Day pill copy (e.g., `SATURDAY`). */
  day: string
  /** Raid name (e.g., `IRON HORSE`). */
  title: string
  /** Resting hero image (absolute URL or `/public`-relative path). */
  imagePrimary?: string | null
  /** Hover-reveal image. Falls back to `imagePrimary` if absent. */
  imageSecondary?: string | null
}

interface RaidsPanelProps {
  /** Upcoming raids from a future backend. Empty for now — panel falls back
   *  to the recurring-rotation list. */
  raids: Raid[]
  /** Section headline — white first word. */
  headlineTitle: string
  /** Section headline — green accent second word. */
  headlineAccent: string
  /** Body paragraph under the headline. */
  blurb: string
  /** Mono caption above the recurring-rotation list. */
  rotationLabel: string
  /** Recurring weekly raids displayed when no live raid data exists. */
  schedule: RaidsScheduleEntry[]
  /** Deep link to the Discord #events channel. */
  discordUrl: string
  /** CTA button copy (e.g., `OPEN #EVENTS`). */
  ctaLabel: string
}

/**
 * Weekly-raids peek. Surfaces upcoming raids that the Apollo bot has
 * scheduled in the Discord #events channel — title, time, RSVP fill, and
 * a direct deep link into the Discord message so the user can accept,
 * decline, or mark tentative without leaving the flow.
 *
 * When `raids` is empty (current default — no backend wired), falls back
 * to a CMS-driven recurring-rotation list (Iron Horse Saturdays, Dark
 * Hours Sundays, etc.) rendered as image-backed RaidCards. The fallback
 * IS the section for now — every string and image path is admin-editable.
 */
export function RaidsPanel({
  raids,
  headlineTitle,
  headlineAccent,
  blurb,
  rotationLabel,
  schedule,
  discordUrl,
  ctaLabel,
}: RaidsPanelProps) {
  const upcoming = raids.slice(0, 4)
  const ctaHref = discordUrl?.trim() || 'https://discord.com/'

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h2
          className="font-display uppercase leading-[0.9] tracking-[0.005em] text-balance"
          style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
        >
          <span className="text-text-primary">{headlineTitle} </span>
          <span
            className="text-rga-green"
            style={{
              textShadow:
                '0 0 24px rgba(0,255,65,0.32), 0 0 56px rgba(0,255,65,0.14)',
            }}
          >
            {headlineAccent}
          </span>
        </h2>
        <PanelHeader
          code="SEC_04"
          label="// SCHEDULE · DISCORD #EVENTS"
          meta={
            upcoming.length > 0
              ? `${upcoming.length} UPCOMING`
              : 'OPEN CHANNEL TO RSVP'
          }
          cta={{ href: ctaHref, label: `${ctaLabel} →` }}
          accent="green"
          external
        />
      </div>

      {blurb && (
        <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
          {blurb}
        </p>
      )}

      {upcoming.length === 0 ? (
        <RaidsRotation
          rotationLabel={rotationLabel}
          schedule={schedule}
          discordUrl={ctaHref}
          ctaLabel={ctaLabel}
        />
      ) : (
        <CyberCorners color="green" size="md">
          <ul className="flex flex-col border border-rga-green/20 bg-[rgba(0,0,0,0.5)]">
            {upcoming.map((raid, idx) => (
              <li
                key={raid.id}
                className={idx > 0 ? 'border-t border-rga-green/10' : ''}
              >
                <RaidRow raid={raid} />
              </li>
            ))}
          </ul>
        </CyberCorners>
      )}
    </section>
  )
}

/**
 * One live-raid row — title + time + RSVP fill + RSVP link. The whole row
 * links out to the Apollo bot's Discord message so accepting/declining
 * happens in the native Discord UI (we don't try to mirror Apollo's
 * RSVP backend).
 */
function RaidRow({ raid }: { raid: Raid }) {
  const start = new Date(raid.startsAt)
  const validStart = !Number.isNaN(start.getTime())
  const day = validStart ? start.toISOString().slice(0, 10) : ''
  const timeLabel = validStart
    ? `${weekdayShort(day)} · ${formatDayShort(day)} · ${formatTime(start)}`
    : 'TIME TBD'
  const fillLabel = raid.accepted.max
    ? `${raid.accepted.count}/${raid.accepted.max} ACCEPTED`
    : `${raid.accepted.count} ACCEPTED`

  return (
    <a
      href={raid.discordUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group/raid grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-rga-green/5"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <span className="break-words font-display text-lg uppercase leading-tight text-text-primary transition-colors group-hover/raid:text-rga-green sm:text-xl">
          {raid.title}
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted tabular-nums">
          <span className="text-rga-green/85">{timeLabel}</span>
          <span className="text-text-muted/80">· {fillLabel}</span>
          {raid.recurrence && (
            <span className="text-text-muted/60">· {raid.recurrence}</span>
          )}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-rga-green opacity-80 transition-opacity group-hover/raid:opacity-100">
        RSVP →
      </span>
    </a>
  )
}

/**
 * Recurring-rotation block — what shows when no live raid feed is wired.
 * Every string + image here flows from the CMS `landingPage.raids` group,
 * so adding a new weekly raid (Wednesdays · Heroic Manhunt, etc.) needs
 * zero code changes — drop two images under /public/division2/img/raids/
 * and reference them in the admin schedule rows.
 */
function RaidsRotation({
  rotationLabel,
  schedule,
  discordUrl,
  ctaLabel,
}: {
  rotationLabel: string
  schedule: RaidsScheduleEntry[]
  discordUrl: string
  ctaLabel: string
}) {
  return (
    <div className="flex flex-col gap-6">
      {rotationLabel && (
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-rga-green">
          {rotationLabel}
        </span>
      )}

      {schedule.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {schedule.map((entry, idx) => (
            <li key={`${entry.day}-${entry.title}-${idx}`}>
              <RaidCard
                day={entry.day}
                title={entry.title}
                imagePrimary={entry.imagePrimary?.trim() || null}
                imageSecondary={entry.imageSecondary?.trim() || null}
                discordUrl={discordUrl}
                ctaLabel={ctaLabel}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-start">
        <Link
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 border border-rga-green/40 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-rga-green transition-colors hover:bg-rga-green/10"
        >
          {ctaLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}

/**
 * Image-backed raid tile. Two-image treatment: `imagePrimary` is the
 * resting hero; on hover, `imageSecondary` snaps in via a left-to-right
 * clip-path sweep with a 1px scanline at the leading edge — reads as a
 * tactical overlay locking onto the target.
 *
 * Composition:
 *   • full-bleed Image (primary), grayscale-30 desaturation when idle
 *   • Image (secondary) layered above, clipped to inset(0 100% 0 0) at
 *     rest, expanding to inset(0 0 0 0) on hover (GPU-friendly)
 *   • vertical gradient scrim from bottom for legibility
 *   • CyberCorners outer frame, day pill top-left, RSVP chip bottom-right
 *
 * No `secondary` image? The hover sweep is skipped; the card still gets
 * the scale + glow on hover so the interaction feels intentional.
 */
function RaidCard({
  day,
  title,
  imagePrimary,
  imageSecondary,
  discordUrl,
  ctaLabel,
}: {
  day: string
  title: string
  imagePrimary: string | null
  imageSecondary: string | null
  discordUrl: string
  ctaLabel: string
}) {
  const hasPrimary = Boolean(imagePrimary)
  const hasSecondary = Boolean(imageSecondary && imageSecondary !== imagePrimary)

  return (
    <CyberCorners color="green" size="md">
      <Link
        href={discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${day} · ${title} — RSVP on Discord`}
        className="group/raid relative block aspect-4/3 overflow-hidden border border-rga-green/25 bg-[rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-rga-green/70 hover:shadow-[0_0_44px_rgba(0,255,65,0.22)] sm:aspect-3/2"
      >
        {hasPrimary ? (
          <Image
            src={imagePrimary as string}
            alt=""
            fill
            priority={false}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transform-gpu [will-change:transform] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/raid:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-rga-green/15 via-black to-black" />
        )}

        {hasSecondary && (
          <div
            className="absolute inset-0 [clip-path:inset(0_100%_0_0)] [will-change:clip-path] transition-[clip-path] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/raid:[clip-path:inset(0_0_0_0)]"
            aria-hidden
          >
            <Image
              src={imageSecondary as string}
              alt=""
              fill
              priority={false}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover scale-[1.04] transform-gpu [will-change:transform] transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/raid:scale-100"
            />
            {/* Leading-edge scanline — 1px green seam sweeps with the reveal */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-rga-green opacity-0 shadow-[0_0_22px_rgba(0,255,65,0.95)] transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/raid:opacity-100" />
          </div>
        )}

        {/* Bottom legibility scrim — title & chip sit on this */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden
        />

        {/* Top-edge tactical scan line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-rga-green/70 to-transparent opacity-60"
          aria-hidden
        />

        {/* Day pill — top-left */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <CyberTag color="green">{day}</CyberTag>
        </div>

        {/* Title + RSVP chip — bottom row */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
          <h3
            className="font-display text-2xl uppercase leading-[0.95] tracking-[0.005em] text-text-primary sm:text-3xl lg:text-4xl"
            style={{
              textShadow:
                '0 2px 14px rgba(0,0,0,0.85), 0 0 22px rgba(0,255,65,0.25)',
            }}
          >
            {title}
          </h3>
          <span className="shrink-0 border border-rga-green/40 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-rga-green transition-colors group-hover/raid:border-rga-green group-hover/raid:bg-rga-green/15">
            {ctaLabel} →
          </span>
        </div>
      </Link>
    </CyberCorners>
  )
}

function formatTime(d: Date): string {
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} UTC`
}

