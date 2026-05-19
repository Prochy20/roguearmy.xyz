import Link from 'next/link'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface DigestBreadcrumbProps {
  accent: AccentName
  designator: string
}

/**
 * Path-style breadcrumb that replaces the StatRibbon in the v1 detail shell.
 *
 * Visual model: read like a tty filesystem path — each segment is a step you
 * could `cd` into. Earlier segments are clickable back-links (DIVISION 2 →
 * landing, DIGEST → list). The leaf is the digest designator in accent color
 * and is not a link.
 */
export function DigestBreadcrumb({ accent, designator }: DigestBreadcrumbProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted"
    >
      <span aria-hidden className="text-text-muted/60 select-none">
        //
      </span>
      <Crumb href="/division-2">DIVISION 2</Crumb>
      <Separator />
      <Crumb href="/division-2/digest">BRIEFINGS</Crumb>
      <Separator />
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
