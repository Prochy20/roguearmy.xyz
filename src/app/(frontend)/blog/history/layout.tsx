import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyMemberToken } from '@/lib/auth/jwt'
import { MEMBER_SESSION_COOKIE } from '@/lib/auth/cookies'
import { AccessDenied } from '@/components/auth/AccessDenied'

interface AuthRequiredLayoutProps {
  children: React.ReactNode
}

async function requireActiveMember(): Promise<{
  authenticated: boolean
  reason?: 'not_authenticated' | 'banned' | 'left_server' | 'error'
}> {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value

  if (!token) {
    return { authenticated: false, reason: 'not_authenticated' }
  }

  const session = await verifyMemberToken(token)

  if (!session) {
    return { authenticated: false, reason: 'not_authenticated' }
  }

  // Verify member is still active
  const payload = await getPayload({ config })

  try {
    const member = await payload.findByID({
      collection: 'members',
      id: session.memberId,
    })

    if (!member) {
      return { authenticated: false, reason: 'not_authenticated' }
    }

    if (member.status === 'banned') {
      return { authenticated: false, reason: 'banned' }
    }

    if (member.status === 'left_server') {
      return { authenticated: false, reason: 'left_server' }
    }

    if (member.status !== 'active') {
      return { authenticated: false, reason: 'banned' }
    }

    return { authenticated: true }
  } catch {
    return { authenticated: false, reason: 'error' }
  }
}

export default async function HistoryLayout({ children }: AuthRequiredLayoutProps) {
  const result = await requireActiveMember()

  if (!result.authenticated) {
    return <AccessDenied reason={result.reason ?? 'not_authenticated'} />
  }

  return <>{children}</>
}
