import { ContentPage } from '@/components/division2/content/ContentPage'
import { cachedFindGlobal } from '@/lib/payload/cached'
import {
  fetchContentList,
  isContentSource,
  DEFAULT_LIMIT,
} from '@/lib/division2/content.server'

// Bypass the Next.js full-route cache: the `?source=` param controls what the
// page shows, and we want each navigation to re-run the data fetches.
// Without this, the router's prefetched RSC payload for the filter-chip
// links can serve stale content after the underlying cache expires.
export const dynamic = 'force-dynamic'

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
  searchParams: Promise<{ source?: string }>
}

export default async function Division2ContentPage({ searchParams }: PageProps) {
  const { source: rawSource } = await searchParams
  const source = isContentSource(rawSource) ? rawSource : undefined

  const [initial, division2] = await Promise.all([
    fetchContentList({ source, offset: 0, limit: DEFAULT_LIMIT }),
    cachedFindGlobal('division2'),
  ])

  return (
    <ContentPage
      initial={initial}
      source={source}
      limit={DEFAULT_LIMIT}
      content={division2.contentPage ?? null}
    />
  )
}
