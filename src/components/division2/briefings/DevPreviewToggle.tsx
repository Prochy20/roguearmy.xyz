'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface DevPreviewToggleProps {
  isPreviewingAsMember: boolean
}

/**
 * Localhost-only dev affordance for previewing the non-booster experience as
 * a real booster. Toggles `?as=member` on the current URL. The auth helper
 * `hasBriefingsAccess` already refuses to honor the override in production, but
 * the UI also disappears in prod for cleanliness — this component should be
 * mounted by the parent inside a `process.env.NODE_ENV !== 'production'` gate.
 */
export function DevPreviewToggle({ isPreviewingAsMember }: DevPreviewToggleProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const next = new URLSearchParams(searchParams.toString())
  if (isPreviewingAsMember) {
    next.delete('as')
  } else {
    next.set('as', 'member')
  }
  const query = next.toString()
  const href = query ? `${pathname}?${query}` : pathname

  return (
    <div className="inline-flex items-center gap-2 border border-dashed border-rga-magenta/40 bg-rga-magenta/5 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.25em] text-rga-magenta/80">
      <span aria-hidden className="inline-block h-1 w-1 rounded-[1px] bg-rga-magenta/70" />
      <span>// DEV</span>
      <Link
        href={href}
        scroll={false}
        prefetch={false}
        className="border-b border-rga-magenta/40 pb-px transition-colors hover:text-rga-magenta"
      >
        {isPreviewingAsMember ? 'RESTORE BOOSTER VIEW' : 'PREVIEW AS MEMBER'}
      </Link>
    </div>
  )
}
