import type { DigestFrequency } from '@/lib/division2/digest.server'
import type { AccentName } from '@/components/content/reader/accent'

/**
 * Maps digest frequency to a reader-accent name. The digest detail surface
 * uses cyan for weekly intel and orange (the brand `rga-mod`) for daily ops.
 *
 * Lives next to the digest because the mapping policy is digest-specific —
 * the generic reader accent palette in `content/reader/accent.ts` doesn't
 * know what a frequency is.
 */
export function frequencyAccent(frequency: DigestFrequency): AccentName {
  return frequency === 'weekly' ? 'cyan' : 'orange'
}
