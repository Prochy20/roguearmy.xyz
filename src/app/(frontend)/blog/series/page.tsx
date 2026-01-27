import { cookies } from 'next/headers'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import {
  getSeriesWithProgress,
  getSeriesFilterOptions,
  getAllSeriesWithFilterData,
} from '@/lib/series.server'
import { BlogSeriesPage } from '@/components/blog/BlogSeriesPage'

async function getOptionalMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export default async function SeriesListingPage() {
  const memberId = await getOptionalMemberId()

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
