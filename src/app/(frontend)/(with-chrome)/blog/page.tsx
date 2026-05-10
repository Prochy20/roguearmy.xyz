import { Suspense } from 'react'
import { BlogArticlesPage } from '@/components/blog/BlogArticlesPage'
import { getPublishedArticles, getFilterOptions } from '@/lib/articles.server'
import { getActiveMemberId } from '@/lib/auth/session.server'
import { getMemberProgressMap } from '@/lib/progress.server'

export default async function BlogPage() {
  // Fetch articles and filter options from Payload
  const [articles, filterOptions, memberId] = await Promise.all([
    getPublishedArticles(),
    getFilterOptions(),
    getActiveMemberId(),
  ])

  // Fetch progress for all articles if member is authenticated
  const articleIds = articles.map((a) => a.id)
  const progressMap = memberId
    ? await getMemberProgressMap(memberId, articleIds)
    : undefined
  const progress = progressMap ? Object.fromEntries(progressMap) : undefined

  return (
    <Suspense fallback={null}>
      <BlogArticlesPage
        articles={articles}
        filterOptions={filterOptions}
        progress={progress}
        isAuthenticated={!!memberId}
      />
    </Suspense>
  )
}
