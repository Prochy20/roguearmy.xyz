import 'server-only'

/**
 * Weekly-raid read helpers.
 *
 * The raid schedule lives on Discord — the Apollo bot posts an event embed
 * per raid to the `#events` channel with title, time, RSVP roster, and a
 * "Repeats weekly" footer. There is no Ashley endpoint mirroring those
 * events yet, so this module currently returns an empty list. When the
 * backend lands, swap `fetchUpcomingRaids` to call the real endpoint —
 * everything downstream (peek shape, panel rendering) is already wired.
 */

export type RaidRsvpStatus = 'accepted' | 'declined' | 'tentative'

export interface RaidRsvpBucket {
  count: number
  /** Max participants (e.g., 8). Undefined for buckets without a cap. */
  max?: number
  /** Display names of the RSVP'd users — empty until a backend supplies them. */
  users: string[]
}

export interface Raid {
  id: string
  title: string
  description: string
  /** ISO datetime for the start of the raid window. */
  startsAt: string
  /** ISO datetime for the end of the raid window. Optional. */
  endsAt?: string
  accepted: RaidRsvpBucket
  declined: RaidRsvpBucket
  tentative: RaidRsvpBucket
  /** Display name of the person who scheduled the raid. */
  createdBy: string
  /** "Repeats weekly" / "once" / etc. */
  recurrence: 'weekly' | 'monthly' | 'once' | null
  /** Hero image URL from the Apollo embed, if any. */
  imageUrl: string | null
  /** Discord deep link to the raid message — opens the RSVP UI in-app. */
  discordUrl: string
}

/**
 * Fetch upcoming raids. Stub for now — returns an empty list until an
 * Ashley endpoint or a Discord-bridge integration exists. The panel
 * renders a Discord-routing empty state in this case.
 */
export async function fetchUpcomingRaids(): Promise<Raid[]> {
  return []
}
