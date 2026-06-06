import type { MetadataRoute } from 'next'
import { buildSitemap } from '@/lib/seo/sitemap.server'

// ISR — sitemap is regenerated at most once per hour. Underlying Ashley
// reads have their own `unstable_cache` (HOT_TTL = 10 min) on the
// `briefing-list` tag, so a future webhook can `revalidateTag('briefing-list')
// + revalidatePath('/sitemap.xml')` and update this in seconds without
// changing the route.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap()
}
