import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { MembersArticlesPage } from '@/components/members'
import { getPublishedArticles, getFilterOptions } from '@/lib/articles.server'

async function getMember() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) return null

  const session = await verifyMemberToken(token)
  if (!session) return null

  const payload = await getPayload({ config })
  return payload.findByID({
    collection: 'members',
    id: session.memberId,
  })
}

export default async function MembersDashboard() {
  const member = await getMember()

  if (!member) {
    return null // Layout handles auth
  }

  // Fetch articles and filter options from Payload
  const [articles, filterOptions] = await Promise.all([
    getPublishedArticles(),
    getFilterOptions(),
  ])

  return (
    <MembersArticlesPage
      member={{
        discordId: member.discordId,
        avatar: member.avatar ?? null,
        username: member.username,
        globalName: member.globalName ?? null,
      }}
      articles={articles}
      filterOptions={filterOptions}
    />
  )
}
