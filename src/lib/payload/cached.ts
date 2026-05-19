import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Config } from '@/payload-types'

type GlobalSlug = keyof Config['globals']

// Thin generic wrapper preserves the slug → return type mapping through the
// React.cache boundary. The inner cached function uses a single GlobalSlug
// parameter so React.cache stores one shared dedup map keyed by slug.
const cachedFindGlobalImpl = cache(async (slug: GlobalSlug) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug })
})

/**
 * Per-request cached read of a Payload global. React.cache keys by argument,
 * so different slugs get independent entries while repeated calls for the
 * same slug within one render pass share a single Mongo query.
 *
 * Use this when a global is read from more than one place in a request —
 * e.g. `generateMetadata` + the page component both needing `staff-page`.
 */
export function cachedFindGlobal<S extends GlobalSlug>(
  slug: S,
): Promise<Config['globals'][S]> {
  return cachedFindGlobalImpl(slug) as Promise<Config['globals'][S]>
}
