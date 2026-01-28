'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MembersProvider, type MemberInfo } from '@/contexts/MembersContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { MembersNav } from './MembersNav/MembersNav'
import { MembersFooter } from './MembersFooter'

// Cache regex pattern outside component to prevent recreation on each render
const ARTICLE_DETAIL_REGEX = /^\/members\/articles\/[^/]+$/

interface MembersLayoutClientProps {
  children: ReactNode
  member: MemberInfo
}

export function MembersLayoutClient({ children, member }: MembersLayoutClientProps) {
  const pathname = usePathname()

  // Enable hide-on-scroll only on article detail pages
  const isArticleDetailPage = ARTICLE_DETAIL_REGEX.test(pathname)

  // Show footer on article detail pages
  const showFooter = !!isArticleDetailPage

  return (
    <MembersProvider member={member}>
      <BookmarksProvider>
        <div className="min-h-screen flex flex-col">
          <MembersNav hideOnScroll={!!isArticleDetailPage} />
          <main className="flex-1">{children}</main>
          {showFooter && <MembersFooter />}
        </div>
      </BookmarksProvider>
    </MembersProvider>
  )
}
