import { getMemberAuth } from '@/lib/auth/session.server'
import { AccessDenied } from '@/components/auth/AccessDenied'

interface AuthRequiredLayoutProps {
  children: React.ReactNode
}

export default async function HistoryLayout({ children }: AuthRequiredLayoutProps) {
  const auth = await getMemberAuth()

  if (!auth.authenticated) {
    return <AccessDenied reason={auth.reason ?? 'not_authenticated'} />
  }

  return <>{children}</>
}
