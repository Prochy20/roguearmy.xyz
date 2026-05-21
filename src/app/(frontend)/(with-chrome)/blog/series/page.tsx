import { Suspense } from 'react'
import { getActiveMemberId } from '@/lib/auth/session.server'
import {
  getSeriesWithProgress,
  getSeriesFilterOptions,
  getAllSeriesWithFilterData,
} from '@/lib/series.server'
import { BlogSeriesPage } from '@/components/blog/BlogSeriesPage'

export default async function SeriesListingPage() {
  const memberId = await getActiveMemberId()

  // Fetch series data and filter options in parallel
  const [series, filterOptions] = await Promise.all([
    memberId ? getSeriesWithProgress(memberId) : getAllSeriesWithFilterData(),
    getSeriesFilterOptions(),
  ])

  // BlogSeriesPage reads `useSearchParams` for filter state. Without this
  // Suspense boundary, Next opts the whole route out of static prerendering
  // and emits a "missing-suspense-with-csr-bailout" build warning. Matches
  // the wrapping pattern used by /blog and /blog/history.
  return (
    <Suspense fallback={null}>
      <BlogSeriesPage
        series={series}
        filterOptions={filterOptions}
        isAuthenticated={!!memberId}
      />
    </Suspense>
  )
}
