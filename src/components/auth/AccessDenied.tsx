'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { DiscordLoginButton } from './DiscordLoginButton'
import { GlitchText } from '@/components/effects/GlitchText'
import { MembersLoginPage } from './MembersLoginPage'
import { ErrorPage } from '@/components/error/ErrorPage'
import { GlowButton } from '@/components/shared/GlowButton'

interface AccessDeniedProps {
  reason?: 'not_authenticated' | 'not_member' | 'banned' | 'left_server' | 'error'
  errorCode?: string
}

const messages: Record<string, { title: string; description: string }> = {
  not_member: {
    title: 'MEMBERSHIP REQUIRED',
    description: 'You must be a member of the Rogue Army Discord server to access this area.',
  },
  banned: {
    title: 'ACCESS REVOKED',
    description:
      'Your access to the members area has been revoked. Contact an admin if you believe this is an error.',
  },
  invalid_request: {
    title: 'INVALID REQUEST',
    description: 'The authentication request was invalid. Please try again.',
  },
  invalid_state: {
    title: 'SECURITY ERROR',
    description: 'The authentication request failed security validation. Please try again.',
  },
  auth_failed: {
    title: 'AUTHENTICATION FAILED',
    description: 'Something went wrong during authentication. Please try again.',
  },
  error: {
    title: 'ERROR',
    description: 'An unexpected error occurred. Please try again.',
  },
}

export function AccessDenied({ reason = 'not_authenticated', errorCode }: AccessDeniedProps) {
  const actualReason = errorCode || reason

  // Show the immersive login page for unauthenticated users or cancelled OAuth
  if (actualReason === 'not_authenticated' || actualReason === 'oauth_denied') {
    return <MembersLoginPage />
  }

  // Show the full cyberpunk error page for banned users
  if (actualReason === 'banned') {
    return <ErrorPage errorType="BAN" showHomeButton={true} showRetryButton={false} />
  }

  // Show a friendlier error page for users who left the server
  if (actualReason === 'left_server') {
    return (
      <ErrorPage
        errorType="AWOL"
        showHomeButton={true}
        showRetryButton={false}
        extraButtons={
          <Link href="https://dc.roguearmy.xyz" target="_blank">
            <GlowButton glowColor="cyan" size="lg" className="gap-2">
              <LogOut className="w-4 h-4" />
              Rejoin Discord
            </GlowButton>
          </Link>
        }
      />
    )
  }

  const message = messages[actualReason] || messages.error
  const showLoginButton = actualReason !== 'banned'

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <GlitchText className="text-3xl sm:text-4xl font-bold text-red-500 mb-4">
            {message.title}
          </GlitchText>
          <p className="text-text-secondary text-lg">{message.description}</p>
        </div>

        {showLoginButton && (
          <div className="space-y-4">
            <DiscordLoginButton />
            <p className="text-text-muted text-sm">
              Not a member yet?{' '}
              <a
                href="https://dc.roguearmy.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rga-cyan hover:text-rga-cyan/80 underline"
              >
                Join our Discord
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
