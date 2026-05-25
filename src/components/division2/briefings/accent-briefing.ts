import type { BriefingFrequency } from '@/lib/division2/briefing.server'
import type { AccentName } from '@/components/content/reader/accent'

/**
 * Maps briefing frequency to a reader-accent name. The briefing detail surface
 * uses cyan for weekly intel and orange (the brand `rga-mod`) for daily ops.
 *
 * Lives next to the briefing because the mapping policy is briefing-specific —
 * the generic reader accent palette in `content/reader/accent.ts` doesn't
 * know what a frequency is.
 */
export function frequencyAccent(frequency: BriefingFrequency): AccentName {
  return frequency === 'weekly' ? 'cyan' : 'orange'
}
