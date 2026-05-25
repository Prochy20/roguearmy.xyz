import Link from 'next/link'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface ReaderBreadcrumbProps {
  accent: AccentName
  /** Crumb segments rendered as back-links. First → leftmost. */
  trail: ReadonlyArray<{ href: string; label: string }>
  /** Leaf segment — rendered as accent-colored, non-link text. */
  designator: string
}

/**
 * Path-style breadcrumb. Reads like a tty filesystem path — each segment is
 * a step you could `cd` into. Earlier segments are clickable back-links;
 * the leaf is the document's designator in accent color (not a link).
 *
 * Trail is generic: digest passes `[DIVISION 2, BRIEFINGS]`, article passes
 * `[BLOG, <topic name>]`.
 */
export function ReaderBreadcrumb({
  accent,
  trail,
  designator,
}: ReaderBreadcrumbProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted"
    >
      <span aria-hidden className="text-text-muted/60 select-none">
        //
      </span>
      {trail.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-x-2">
          <Crumb href={crumb.href}>{crumb.label}</Crumb>
          {i < trail.length - 1 || trail.length > 0 ? <Separator /> : null}
        </span>
      ))}
      <span
        className={`${a.text} tabular-nums`}
        style={{ textShadow: a.textGlow }}
      >
        {designator}
      </span>
    </nav>
  )
}

function Crumb({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="text-text-muted transition-colors hover:text-text-primary"
    >
      {children}
    </Link>
  )
}

function Separator() {
  return (
    <span aria-hidden className="select-none text-text-muted/40">
      /
    </span>
  )
}
