import Link from 'next/link'

export type PanelHeaderAccent = 'green' | 'cyan' | 'mod'

const ACCENT_TEXT: Record<PanelHeaderAccent, string> = {
  green: 'text-rga-green',
  cyan: 'text-rga-cyan',
  mod: 'text-game-d2',
}

interface PanelHeaderProps {
  /** Mono section designator (e.g., `SEC_03`). */
  code: string
  /** Mono label (e.g., `// LATEST · WEEKLY BRIEFING`). */
  label: string
  /** Optional right-side meta chip (e.g., `TOP 6`, `MON 12 MAY`). */
  meta?: string
  /** Right-aligned CTA link. `external` swaps Next `<Link>` for an `<a target="_blank">`. */
  cta: { href: string; label: string }
  /** Accent token — drives the code-span and CTA color. */
  accent: PanelHeaderAccent
  /** When true, render the CTA as `<a target="_blank" rel="noopener noreferrer">` for external URLs. */
  external?: boolean
}

/**
 * Shared header strip used by every section panel on the Division 2 landing
 * page. Layout: left side carries the mono designator + label + optional meta
 * chip; right side carries the CTA link.
 *
 * Internal CTAs (e.g. `/division-2/content`) render as Next `<Link>` for SPA
 * navigation; external CTAs (e.g. Discord deep links) opt-in via `external`
 * to render as a target=_blank anchor. URL-prefix sniffing is intentionally
 * avoided — CMS-driven hrefs can arrive as either bare host or full URL, and
 * a misclassified external link would silently break the back button.
 */
export function PanelHeader({
  code,
  label,
  meta,
  cta,
  accent,
  external = false,
}: PanelHeaderProps) {
  const accentClass = ACCENT_TEXT[accent]
  const ctaClass = `font-mono text-[10px] uppercase tracking-[0.3em] ${accentClass} transition-colors hover:text-text-primary`

  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-text-muted/15 pb-3">
      <div className="flex flex-wrap items-baseline gap-3 font-mono">
        <span className={`text-[10px] tracking-[0.4em] ${accentClass}`}>{code}</span>
        <span className="text-[10px] tracking-[0.3em] text-text-muted">{label}</span>
        {meta && (
          <span className="text-[9px] tracking-[0.3em] text-text-muted/70">{meta}</span>
        )}
      </div>
      {external ? (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClass}
        >
          {cta.label}
        </a>
      ) : (
        <Link href={cta.href} className={ctaClass}>
          {cta.label}
        </Link>
      )}
    </header>
  )
}
