import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { MembersHistoryPage } from '@/components/members'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getReadingHistory, type HistoryStatusFilter } from '@/lib/history.server'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

function parseStatusFilter(status?: string): HistoryStatusFilter {
  if (status === 'completed' || status === 'in_progress') {
    return status
  }
  return 'all'
}

export default async function MembersHistoryRoute({ searchParams }: PageProps) {
  const params = await searchParams
  const memberId = await getMemberId()

  if (!memberId) {
    // This shouldn't happen since the layout protects this route
    return null
  }

  const statusFilter = parseStatusFilter(params.status)

  // Fetch reading history with status filter
  const { entries } = await getReadingHistory(memberId, { limit: 100, status: statusFilter })

  // Transform entries to articles and build progress map
  const articles = entries.map((entry) => entry.article)
  const progress = Object.fromEntries(
    entries.map((entry) => [
      entry.article.id,
      {
        articleId: entry.article.id,
        progress: entry.progress,
        completed: entry.completed,
        firstVisitedAt: entry.lastVisitedAt,
        lastVisitedAt: entry.lastVisitedAt,
        timeSpent: entry.timeSpent,
      },
    ])
  )

  return (
    <Suspense fallback={null}>
      <MembersHistoryPage
        articles={articles}
        progress={progress}
        statusFilter={statusFilter}
      />
    </Suspense>
  )
}
