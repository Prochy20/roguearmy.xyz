import { type ReactNode } from 'react'
import { ManifestoProgress } from '@/app/(frontend)/(with-chrome)/manifesto/ManifestoProgress'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface ReaderPageShellProps {
  accent: AccentName
  /**
   * Optional sticky chrome row (typically a StatRibbon) rendered above the
   * header. Clears the fixed Header via mt-20 on first paint, then sticks at
   * the MENU-button vertical center (top:18) on scroll. When omitted, the
   * header slot picks up the usual pt-20 clearance instead.
   */
  stickyChrome?: ReactNode
  /** Full-width chrome above the 3-col body (breadcrumb, tag row, title, hero). */
  header: ReactNode
  /** Left rail. Null hides it and stretches the body column. */
  toc: ReactNode | null
  /** Middle column — doc-strip, TL;DR, prose body, sources, related. */
  body: ReactNode
  /** Right rail. Hidden on mobile/tablet either way. */
  reading: ReactNode
  /** Full-width footer (back link + prev/next). */
  footer: ReactNode
}

/**
 * Layout primitive for the reader surface.
 *
 * Layout strategy:
 *  - lg+ (1024px+): three columns — `[ToC] [body] [reading]`. Rails are
 *    sticky with a top offset that clears the fixed nav and gives breathing
 *    room.
 *  - Below lg: single column, body only. ToC and reading widget hide entirely
 *    rather than reflow into the body — they're desktop enhancements, not
 *    load-bearing for comprehension.
 *
 * The frame sits inside a subtle scanline overlay (1px horizontal stripe at
 * ~3.5% opacity) that gives the surface a CRT-tinted feel without screaming.
 * A second ambient wash pulses the page accent down from the top edge so the
 * chrome reads as "tuned to the right channel" before the reader even
 * registers the tag pills.
 */
export function ReaderPageShell({
  accent,
  stickyChrome,
  header,
  toc,
  body,
  reading,
  footer,
}: ReaderPageShellProps) {
  const a = ACCENT_TOKENS[accent]
  const hasToc = toc !== null

  const gridClass = hasToc
    ? 'flex flex-col gap-y-14 lg:grid lg:grid-cols-[180px_minmax(0,1fr)_220px] lg:gap-x-10 lg:gap-y-0 xl:grid-cols-[200px_minmax(0,1fr)_240px] xl:gap-x-14'
    : 'flex flex-col gap-y-14 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-x-10 lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_240px] xl:gap-x-14'

  return (
    <div className="relative">
      {/* Fixed top reading-progress bar — same component as the manifesto. */}
      <ManifestoProgress />

      {/* Scanline overlay — pure CSS, no JS impact. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* Ambient accent wash — top of the page only, fades down. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(${a.rgb},0.07) 0%, rgba(0,0,0,0) 60%)`,
        }}
      />

      {/* Sticky chrome lives OUTSIDE the max-w-[1440px] body column so its
          right edge can reach close to the fixed Header's MENU button instead
          of being inset by the body grid. At <lg it renders inline (no stick)
          to save vertical space on small screens. From lg+ it sticks at MENU's
          vertical center (top:21) and stretches almost to MENU's left bracket
          (pr:140 = MENU footprint ~132 + 8px gap). */}
      {stickyChrome && (
        <div className="mx-auto w-full max-w-[1440px] mt-20 sm:mt-24 lg:mt-28 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-12 lg:pr-[140px]">
          {stickyChrome}
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-24 sm:px-8 sm:pb-28 lg:px-12 lg:pb-36">
        <div
          className={`flex flex-col gap-12 sm:gap-14 lg:gap-16 ${stickyChrome ? 'pt-7 sm:pt-9 lg:pt-10' : 'pt-20 sm:pt-24 lg:pt-28'}`}
        >
          {/* Full-width chrome (breadcrumb, tag row, title, byline, hero). */}
          <div className="flex flex-col gap-7 sm:gap-9 lg:gap-10">{header}</div>

          {/* 3-col body */}
          <div className={gridClass}>
            {hasToc && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">{toc}</div>
              </aside>
            )}

            <div className="min-w-0">{body}</div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">{reading}</div>
            </aside>
          </div>

          {/* Full-width footer */}
          <div>{footer}</div>
        </div>
      </div>
    </div>
  )
}
