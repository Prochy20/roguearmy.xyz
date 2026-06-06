import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { fetchAshleyService } from '@/lib/api/server'
import { cachedFindGlobal } from '@/lib/payload/cached'
import type { components } from '@/lib/api/schema'

type CommunityStats = components['schemas']['CommunityStatsDto']

// Cross-request ISR cache (6h). Tag enables on-demand revalidation via
// revalidateTag('community-stats') from a future admin button or webhook.
const fetchTotalMembersCached = unstable_cache(
  async (): Promise<number | null> => {
    const result = await fetchAshleyService<CommunityStats>((c) =>
      c.GET('/api/community/stats'),
    )
    return result.ok ? result.data.totalMembers : null
  },
  ['community-stats'],
  { revalidate: 21600, tags: ['community-stats'] },
)

// React.cache outer wrap — one execution per request even when called from
// both the layout (footer) and the homepage (StatsTicker). Inner Promise.all
// runs the Ashley ISR lookup and the Payload global read concurrently.
const getMemberCountImpl = cache(
  async (): Promise<{ count: number | null; floor: number }> => {
    const [count, chrome] = await Promise.all([
      fetchTotalMembersCached(),
      cachedFindGlobal('site-chrome'),
    ])
    // Payload defaultValue does not auto-persist into the doc on first read,
    // so a fresh install with no global doc needs a JS fallback.
    const floor = chrome?.memberCountFloor ?? 200
    return { count, floor }
  },
)

export function getMemberCount(): Promise<{ count: number | null; floor: number }> {
  return getMemberCountImpl()
}
