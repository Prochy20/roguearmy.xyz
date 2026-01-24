import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { AccessDenied } from '@/components/auth/AccessDenied'
import { MembersLayoutClient } from '@/components/members/MembersLayoutClient'

interface MemberLayoutProps {
  children: React.ReactNode
}

async function getMemberSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) {
    return { authenticated: false, reason: 'not_authenticated' as const }
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return { authenticated: false, reason: 'not_authenticated' as const }
  }

  // Verify member is still active
  const payload = await getPayload({ config })

  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member) {
      return { authenticated: false, reason: 'not_authenticated' as const }
    }

    if (member.status !== 'active') {
      return { authenticated: false, reason: 'banned' as const }
    }

    return { authenticated: true, session, member }
  } catch {
    return { authenticated: false, reason: 'error' as const }
  }
}

export default async function MembersLayout({ children }: MemberLayoutProps) {
  const result = await getMemberSession()

  if (!result.authenticated || !result.member) {
    return <AccessDenied reason={result.reason ?? 'error'} />
  }

  // Extract member info for context
  const { member } = result
  const memberInfo = {
    discordId: member.discordId,
    avatar: member.avatar ?? null,
    username: member.username,
    globalName: member.globalName ?? null,
  }

  return (
    <MembersLayoutClient member={memberInfo}>
      {children}
    </MembersLayoutClient>
  )
}
