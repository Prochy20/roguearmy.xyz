'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BlogAuthProvider, type BlogAuthState } from '@/contexts/BlogAuthContext'
import { MembersProvider } from '@/contexts/MembersContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BlogNav } from './BlogNav'
import { MembersFooter } from '@/components/members/MembersFooter'

interface BlogLayoutClientProps {
  children: ReactNode
  authState: BlogAuthState
}

export function BlogLayoutClient({ children, authState }: BlogLayoutClientProps) {
  const pathname = usePathname()

  // Enable hide-on-scroll only on article detail pages
  const isArticleDetailPage = pathname.match(/^\/blog\/[^/]+\/[^/]+$/)

  // Show footer on article detail pages
  const showFooter = !!isArticleDetailPage

  // If authenticated, wrap with member-specific providers
  const content = (
    <div className="min-h-screen flex flex-col">
      <BlogNav hideOnScroll={!!isArticleDetailPage} isAuthenticated={authState.authenticated} />
      <main className="flex-1">{children}</main>
      {showFooter && <MembersFooter />}
    </div>
  )

  // Always wrap with BlogAuthProvider for auth state access
  // Only wrap with MembersProvider and BookmarksProvider if authenticated
  if (authState.authenticated && authState.member) {
    return (
      <BlogAuthProvider authState={authState}>
        <MembersProvider member={authState.member}>
          <BookmarksProvider>
            {content}
          </BookmarksProvider>
        </MembersProvider>
      </BlogAuthProvider>
    )
  }

  return (
    <BlogAuthProvider authState={authState}>
      {content}
    </BlogAuthProvider>
  )
}
