import { ContentPage } from '@/components/division2/content/ContentPage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import {
  fetchContentList,
  isContentSource,
  parseMinRelevance,
  DEFAULT_LIMIT,
  DEFAULT_MIN_RELEVANCE,
} from '@/lib/division2/content.server'

// Dynamic rendering is implicit via the `searchParams` read below. Data
// freshness is governed by the `unstable_cache` TTL on `fetchContentList`;
// the route-level `dynamic` directive doesn't affect `unstable_cache`, so
// declaring it here would have been belt-and-suspenders only.

const DEFAULT_TITLE = 'Content Feed | Division 2 · Rogue Army'
const DEFAULT_DESCRIPTION =
  'Curated YouTube, Reddit, and Ubisoft dispatches for The Division 2 — filtered by AI relevance and linked straight to source.'

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.contentPage?.seo
  return {
    title: seo?.title?.trim() || DEFAULT_TITLE,
    description: seo?.description?.trim() || DEFAULT_DESCRIPTION,
  }
}

interface PageProps {
  searchParams: Promise<{ source?: string; min?: string }>
}

export default async function Division2ContentPage({ searchParams }: PageProps) {
  const { source: rawSource, min: rawMin } = await searchParams
  const source = isContentSource(rawSource) ? rawSource : undefined
  const minRelevance = parseMinRelevance(rawMin) ?? DEFAULT_MIN_RELEVANCE

  const [initial, division2] = await Promise.all([
    fetchContentList({ source, offset: 0, limit: DEFAULT_LIMIT, minRelevance }),
    cachedFindGlobal('division2'),
  ])

  return (
    <ContentPage
      initial={initial}
      source={source}
      minRelevance={minRelevance}
      limit={DEFAULT_LIMIT}
      content={division2.contentPage ?? null}
    />
  )
}
