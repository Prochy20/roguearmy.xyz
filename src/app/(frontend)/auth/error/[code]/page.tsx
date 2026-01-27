import { notFound } from 'next/navigation'
import { AccessDenied } from '@/components/auth/AccessDenied'

interface AuthErrorPageProps {
  params: Promise<{ code: string }>
}

const validErrorCodes = [
  'not_authenticated',
  'not_member',
  'banned',
  'left_server',
  'oauth_denied',
  'invalid_request',
  'invalid_state',
  'auth_failed',
  'error',
] as const

type ErrorCode = (typeof validErrorCodes)[number]

function isValidErrorCode(code: string): code is ErrorCode {
  return validErrorCodes.includes(code as ErrorCode)
}

export default async function AuthErrorPage({ params }: AuthErrorPageProps) {
  const { code } = await params

  if (!isValidErrorCode(code)) {
    notFound()
  }

  return <AccessDenied errorCode={code} />
}
