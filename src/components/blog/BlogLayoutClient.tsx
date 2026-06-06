'use client'

import { type ReactNode } from 'react'
import { BlogAuthProvider, type BlogAuthState } from '@/contexts/BlogAuthContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BlogNav } from './BlogNav'

interface BlogLayoutClientProps {
  children: ReactNode
  authState: BlogAuthState
}

export function BlogLayoutClient({ children, authState }: BlogLayoutClientProps) {
  // BlogNav reads its own pathname to decide hide-on-scroll behavior, so this
  // layout no longer needs to subscribe to navigation events. The providers
  // here still need `'use client'` because they expose React context.
  const content = (
    <div className="min-h-screen flex flex-col">
      <BlogNav />
      <main className="flex-1">{children}</main>
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
