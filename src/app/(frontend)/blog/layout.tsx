import { getMemberAuth } from '@/lib/auth/session.server'
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

export default async function BlogLayout({ children }: BlogLayoutProps) {
  const auth = await getMemberAuth()

  const authState: BlogAuthState = {
    authenticated: auth.authenticated,
    memberId: auth.memberId,
    member: auth.member,
  }

  return (
    <BlogLayoutClient authState={authState}>
      {children}
    </BlogLayoutClient>
  )
}
