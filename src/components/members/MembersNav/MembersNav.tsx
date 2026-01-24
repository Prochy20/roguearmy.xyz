'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { NavLinks } from './NavLinks'
import { NavSearch } from './NavSearch'
import { BookmarksDrawer } from './BookmarksDrawer'
import { NavUserMenu } from './NavUserMenu'
import { MobileNav } from './MobileNav'
import { useScrollVisibility } from './useScrollVisibility'

interface MembersNavProps {
  /** Enable hide-on-scroll behavior (for article detail pages) */
  hideOnScroll?: boolean
}

export function MembersNav({ hideOnScroll = false }: MembersNavProps) {
  const isVisible = useScrollVisibility({ enabled: hideOnScroll })

  return (
    <motion.header
      initial={false}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-50 border-b border-rga-green/20 bg-void/90 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-rga-green font-display text-xl tracking-wider hover:text-glow-green transition-all"
            >
              RGA
            </Link>

            {/* Desktop navigation links */}
            <NavLinks />
          </div>

          {/* Center: Search */}
          <NavSearch />

          {/* Right: Bookmarks drawer + User menu (desktop) + Mobile hamburger */}
          <div className="flex items-center gap-2">
            <BookmarksDrawer />
            <div className="hidden sm:block">
              <NavUserMenu />
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
