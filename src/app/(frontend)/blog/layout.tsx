import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { BlogLayoutClient } from '@/components/blog/BlogLayoutClient'

interface BlogLayoutProps {
  children: React.ReactNode
}

export interface MemberInfo {
  discordId: string
  avatar: string | null
  username: string
  globalName: string | null
}

export interface BlogAuthState {
  authenticated: boolean
  member: MemberInfo | null
  memberId: string | null
}

/**
 * Get member session if authenticated and active.
 * Returns null for member info if not authenticated or not an active member.
 * This is "hybrid auth" - it doesn't block unauthenticated users.
 */
async function getOptionalMemberSession(): Promise<BlogAuthState> {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) {
    return { authenticated: false, member: null, memberId: null }
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return { authenticated: false, member: null, memberId: null }
  }

  // Verify member is still active
  const payload = await getPayload({ config })

  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member) {
      return { authenticated: false, member: null, memberId: null }
    }

    // Only return member info if they're active
    if (member.status !== 'active') {
      return { authenticated: false, member: null, memberId: null }
    }

    return {
      authenticated: true,
      memberId: session.memberId,
      member: {
        discordId: member.discordId,
        avatar: member.avatar ?? null,
        username: member.username,
        globalName: member.globalName ?? null,
      },
    }
  } catch {
    return { authenticated: false, member: null, memberId: null }
  }
}

export default async function BlogLayout({ children }: BlogLayoutProps) {
  const authState = await getOptionalMemberSession()

  return (
    <BlogLayoutClient authState={authState}>
      {children}
    </BlogLayoutClient>
  )
}
