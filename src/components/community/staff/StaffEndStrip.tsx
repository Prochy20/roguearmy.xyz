import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { StaffPage } from '@/payload-types'
import { formatSyncStamp } from './utils'

interface StaffEndStripProps {
  content: StaffPage['endStrip']
  recordCount: number
  lastSyncedAt: string | null
}

/**
 * Closing tactical strip — visually ends the manifest the way a stamped
 * cover page closes a paper file. Doubles as the only on-page back-link to
 * /community, kept low-key so it doesn't compete with the chrome.
 */
export function StaffEndStrip({ content, recordCount, lastSyncedAt }: StaffEndStripProps) {
  const backLabel = content?.backLinkLabel ?? 'RETURN · COMMUNITY'
  const endLabel = content?.endLabel ?? '// END_OF_MANIFEST'
  const compiledLabel = content?.compiledLabel ?? 'COMPILED'

  return (
    <section
      className="relative border-t border-[rgba(255,255,255,0.06)] px-4 py-10 sm:px-8 sm:py-12 lg:px-16"
      aria-label="manifest footer"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 3px,
            rgba(0,255,65,0.5) 3px,
            rgba(0,255,65,0.5) 4px
          )`,
        }}
      />

      <div className="mx-auto flex w-full max-w-[1480px] flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
        <Link
          href="/community"
          className="group/back inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.35em] text-text-muted uppercase transition-colors duration-200 hover:text-rga-cyan"
        >
          <ArrowLeft
            className="h-3 w-3 transition-transform duration-200 group-hover/back:-translate-x-1"
            aria-hidden
          />
          <span>{backLabel}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.35em] text-text-muted uppercase">
          <span>{endLabel}</span>
          <span className="h-3 w-px bg-white/10" aria-hidden />
          <span className="text-rga-green">
            {String(recordCount).padStart(2, '0')} RECORDS
          </span>
          <span className="h-3 w-px bg-white/10" aria-hidden />
          <span>
            {compiledLabel} · {formatSyncStamp(lastSyncedAt)}
          </span>
        </div>
      </div>
    </section>
  )
}
