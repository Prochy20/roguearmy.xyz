'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MembersProvider, type MemberInfo } from '@/contexts/MembersContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { MembersNav } from './MembersNav'
import { MembersFooter } from './MembersFooter'

interface MembersLayoutClientProps {
  children: ReactNode
  member: MemberInfo
}

export function MembersLayoutClient({ children, member }: MembersLayoutClientProps) {
  const pathname = usePathname()

  // Enable hide-on-scroll only on article detail pages
  const isArticleDetailPage = pathname.match(/^\/members\/articles\/[^/]+$/)

  return (
    <MembersProvider member={member}>
      <BookmarksProvider>
        <div className="min-h-screen flex flex-col">
          <MembersNav hideOnScroll={!!isArticleDetailPage} />
          <main className="flex-1">{children}</main>
          <MembersFooter />
        </div>
      </BookmarksProvider>
    </MembersProvider>
  )
}
