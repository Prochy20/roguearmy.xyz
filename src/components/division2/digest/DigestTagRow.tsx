import { CyberTag } from '@/components/ui/CyberCorners'
import { type AccentName } from './accent'
import type { DigestFrequency } from '@/lib/division2/digest.server'

interface DigestTagRowProps {
  accent: AccentName
  frequency: DigestFrequency
  /** True when the digest requires a booster badge to read (daily). */
  isMembersOnly: boolean
}

/**
 * Three derived classification pills above the headline.
 *
 *  - FREQUENCY in accent color (cyan for weekly, mod for daily) — the same
 *    signal driving the whole page chrome, anchored visually up front.
 *  - DIVISION 2 in gray — topic constant for this entire surface.
 *  - MEMBERS ONLY in magenta when gated, PUBLIC in green when open. Magenta is
 *    reserved across the site for access/auth signals (it's the same color the
 *    failure StatusPill uses), so the meaning carries.
 */
export function DigestTagRow({
  accent,
  frequency,
  isMembersOnly,
}: DigestTagRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <CyberTag color={accent}>{frequency.toUpperCase()}</CyberTag>
      <CyberTag color="gray">DIVISION 2</CyberTag>
      {isMembersOnly ? (
        <CyberTag color="magenta">MEMBERS ONLY</CyberTag>
      ) : (
        <CyberTag color="green">PUBLIC</CyberTag>
      )}
    </div>
  )
}
