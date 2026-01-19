'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MembersProvider, type MemberInfo } from '@/contexts/MembersContext'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { MembersNav } from './MembersNav'

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
        <MembersNav hideOnScroll={!!isArticleDetailPage} />
        {children}
      </BookmarksProvider>
    </MembersProvider>
  )
}
