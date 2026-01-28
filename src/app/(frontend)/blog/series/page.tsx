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

  return (
    <BlogSeriesPage
      series={series}
      filterOptions={filterOptions}
      isAuthenticated={!!memberId}
    />
  )
}
