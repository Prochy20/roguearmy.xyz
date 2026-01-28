import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { MembersArticlesPage } from '@/components/members/MembersArticlesPage'
import { getPublishedArticles, getFilterOptions } from '@/lib/articles.server'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { getMemberProgressMap } from '@/lib/progress.server'

async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  return session?.memberId || null
}

export default async function MembersDashboard() {
  // Fetch articles and filter options from Payload
  const [articles, filterOptions, memberId] = await Promise.all([
    getPublishedArticles(),
    getFilterOptions(),
    getMemberId(),
  ])

  // Fetch progress for all articles if member is authenticated
  const articleIds = articles.map((a) => a.id)
  const progressMap = memberId
    ? await getMemberProgressMap(memberId, articleIds)
    : undefined
  const progress = progressMap ? Object.fromEntries(progressMap) : undefined

  return (
    <Suspense fallback={null}>
      <MembersArticlesPage
        articles={articles}
        filterOptions={filterOptions}
        progress={progress}
      />
    </Suspense>
  )
}
