import { type ReactNode } from 'react'
import { ManifestoProgress } from '@/app/(frontend)/(with-chrome)/manifesto/ManifestoProgress'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface DigestPageShellProps {
  accent: AccentName
  /** Full-width chrome above the 3-col body (breadcrumb, tag row, title, hero). */
  header: ReactNode
  /** Left rail. Null hides it and stretches the body column. */
  toc: ReactNode | null
  /** Middle column — doc-strip, TL;DR, prose body, sources. */
  body: ReactNode
  /** Right rail. Hidden on mobile/tablet either way. */
  reading: ReactNode
  /** Full-width footer (back-to-week + prev/next). */
  footer: ReactNode
}

/**
 * Reader shell for the digest detail page.
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
 * A second ambient wash pulses the frequency accent down from the top edge so
 * the chrome reads as "tuned to the right channel" before the reader even
 * registers the tag pills.
 */
export function DigestPageShell({
  accent,
  header,
  toc,
  body,
  reading,
  footer,
}: DigestPageShellProps) {
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

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pt-20 pb-24 sm:px-8 sm:pt-24 sm:pb-28 lg:px-12 lg:pt-28 lg:pb-36">
        <div className="flex flex-col gap-12 sm:gap-14 lg:gap-16">
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
