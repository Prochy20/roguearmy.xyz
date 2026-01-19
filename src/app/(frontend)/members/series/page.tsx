import { cookies } from 'next/headers'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import {
  getSeriesWithProgress,
  getSeriesFilterOptions,
  getAllSeriesWithFilterData,
} from '@/lib/series.server'
import { MembersSeriesPage } from '@/components/members/MembersSeriesPage'

async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export default async function SeriesListingPage() {
  const memberId = await getMemberId()

  // Fetch series data and filter options in parallel
  const [series, filterOptions] = await Promise.all([
    memberId ? getSeriesWithProgress(memberId) : getAllSeriesWithFilterData(),
    getSeriesFilterOptions(),
  ])

  return <MembersSeriesPage series={series} filterOptions={filterOptions} />
}
