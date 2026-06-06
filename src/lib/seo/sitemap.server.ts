import 'server-only'
import type { MetadataRoute } from 'next'
import { getPayload, type CollectionSlug } from 'payload'
import config from '@payload-config'
import { absoluteUrl } from './siteUrl'
import { fetchAllBriefings } from '@/lib/division2/briefing.server'

type SitemapEntry = MetadataRoute.Sitemap[number]

/* ── Date helpers ────────────────────────────────────────────────────────── */

/**
 * Today at 00:00 UTC. Used as `lastModified` for pages whose content is a live
 * aggregate of external data (Ashley) with no stable CMS edit timestamp.
 *
 * Stable per UTC day → Google trusts it as a real `lastmod`. Switching to
 * `new Date()` here would flap per request/build and Google would start
 * ignoring the field across the whole sitemap.
 */
function dailyRolled(): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function maxDate(...candidates: Array<Date | null>): Date {
  const valid = candidates.filter((d): d is Date => d !== null)
  if (valid.length === 0) return dailyRolled()
  return valid.reduce((acc, d) => (d > acc ? d : acc))
}

/* ── Payload helpers ─────────────────────────────────────────────────────── */

/** Cheapest possible "when was this collection last touched" probe. */
async function getCollectionLastTouched(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
): Promise<Date | null> {
  const res = await payload.find({
    collection,
    limit: 1,
    sort: '-updatedAt',
    depth: 0,
  })
  const top = res.docs[0] as { updatedAt?: string } | undefined
  return toDate(top?.updatedAt)
}

/* ── Entry builders ──────────────────────────────────────────────────────── */

/**
 * Build all sitemap entries for routes whose content lives in Payload globals
 * or collections. Runs Payload reads in parallel.
 */
async function buildCmsEntries(): Promise<SitemapEntry[]> {
  const payload = await getPayload({ config })

  const [
    manifesto,
    staffPage,
    division2,
    homepage,
    maxStaffProfile,
    maxClan,
    maxGame,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'manifesto', depth: 0 }),
    payload.findGlobal({ slug: 'staff-page', depth: 0 }),
    payload.findGlobal({ slug: 'division2', depth: 0 }),
    payload.findGlobal({ slug: 'homepage', depth: 0 }),
    getCollectionLastTouched(payload, 'staff-profiles'),
    getCollectionLastTouched(payload, 'division2-clans'),
    getCollectionLastTouched(payload, 'games'),
  ])

  // The manifesto global drives 4 public routes. Bumping any tab in admin
  // bumps the whole global's updatedAt — same lastmod across the 4 is the
  // expected behavior, not a bug.
  const manifestoMod = toDate(manifesto.updatedAt) ?? dailyRolled()
  const staffMod = maxDate(toDate(staffPage.updatedAt), maxStaffProfile)
  const clansMod = maxDate(toDate(division2.updatedAt), maxClan)
  const homepageMod = maxDate(toDate(homepage.updatedAt), maxGame)

  return [
    {
      url: absoluteUrl('/'),
      lastModified: homepageMod,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/manifesto'),
      lastModified: manifestoMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/rules'),
      lastModified: manifestoMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: manifestoMod,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: manifestoMod,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/community/staff'),
      lastModified: staffMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/division-2/clans'),
      lastModified: clansMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}

/**
 * Routes whose content is a live aggregate of external (Ashley) data with no
 * stable CMS timestamp. UTC-day-rolled `lastmod` keeps Google's trust while
 * still signalling "this page updates regularly."
 */
function buildAggregateEntries(): SitemapEntry[] {
  const lastModified = dailyRolled()
  return [
    {
      url: absoluteUrl('/community'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/leaderboard'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
}

/**
 * Briefing detail pages. Pulls the full Ashley corpus (paginated, cached on
 * the `briefing-list` tag). Returns an empty list on Ashley failure so the
 * sitemap degrades to static + CMS entries instead of 500-ing the route.
 */
async function buildBriefingEntries(): Promise<SitemapEntry[]> {
  const result = await fetchAllBriefings()
  if (!result.ok) {
    console.error('[sitemap] fetchAllBriefings failed:', result.error)
    return []
  }
  return result.data.map<SitemapEntry>((briefing) => ({
    url: absoluteUrl(briefing.canonicalPath),
    lastModified: toDate(briefing.updatedAt) ?? dailyRolled(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
}

/**
 * Compose the full public sitemap. CMS reads and Ashley reads run in
 * parallel; failures in any branch are swallowed so the route always
 * returns *something* indexable instead of throwing.
 */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const [cmsEntries, briefingEntries] = await Promise.all([
    buildCmsEntries().catch((err) => {
      console.error('[sitemap] CMS entries failed:', err)
      return [] as SitemapEntry[]
    }),
    buildBriefingEntries(),
  ])
  return [...cmsEntries, ...buildAggregateEntries(), ...briefingEntries]
}
