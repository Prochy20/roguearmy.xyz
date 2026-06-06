'use client'

import { type ReactNode } from 'react'
import { BlogAuthProvider, type BlogAuthState } from '@/contexts/BlogAuthContext'
import { BlogNav } from './BlogNav'

interface BlogLayoutClientProps {
  children: ReactNode
  authState: BlogAuthState
}

export function BlogLayoutClient({ children, authState }: BlogLayoutClientProps) {
  return (
    <BlogAuthProvider authState={authState}>
      <div className="min-h-screen flex flex-col">
        <BlogNav />
        <main className="flex-1">{children}</main>
      </div>
    </BlogAuthProvider>
  )
}
