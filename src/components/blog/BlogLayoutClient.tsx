'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BlogAuthProvider, type BlogAuthState } from '@/contexts/BlogAuthContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BlogNav } from './BlogNav'
import { BlogFooter } from './BlogFooter'

// Cache regex pattern outside component to prevent recreation on each render
const ARTICLE_DETAIL_REGEX = /^\/blog\/[^/]+\/[^/]+$/

interface BlogLayoutClientProps {
  children: ReactNode
  authState: BlogAuthState
}

export function BlogLayoutClient({ children, authState }: BlogLayoutClientProps) {
  const pathname = usePathname()

  // Enable hide-on-scroll only on article detail pages
  const isArticleDetailPage = ARTICLE_DETAIL_REGEX.test(pathname)

  // Show footer on article detail pages
  const showFooter = !!isArticleDetailPage

  // If authenticated, wrap with member-specific providers
  const content = (
    <div className="min-h-screen flex flex-col">
      <BlogNav hideOnScroll={!!isArticleDetailPage} isAuthenticated={authState.authenticated} />
      <main className="flex-1">{children}</main>
      {showFooter && <BlogFooter />}
    </div>
  )

  // Always wrap with BlogAuthProvider for auth state access
  // Only wrap with BookmarksProvider if authenticated
  if (authState.authenticated && authState.member) {
    return (
      <BlogAuthProvider authState={authState}>
        <BookmarksProvider>
          {content}
        </BookmarksProvider>
      </BlogAuthProvider>
    )
  }

  return (
    <BlogAuthProvider authState={authState}>
      {content}
    </BlogAuthProvider>
  )
}
