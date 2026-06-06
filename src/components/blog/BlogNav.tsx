'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { BlogNavLinks } from './BlogNavLinks'
import { BlogNavSearch } from './BlogNavSearch'
import { BlogNavUserMenu } from './BlogNavUserMenu'
import { BlogNavMenuTrigger } from './BlogNavMenuTrigger'
import { useScrollVisibility } from './useScrollVisibility'
import { useBlogAuth } from '@/contexts/BlogAuthContext'

// Hide-on-scroll is only enabled on article detail pages (`/blog/:topic/:slug`).
// List pages keep the nav permanently sticky.
const ARTICLE_DETAIL_REGEX = /^\/blog\/[^/]+\/[^/]+$/

export function BlogNav() {
  const pathname = usePathname()
  const hideOnScroll = ARTICLE_DETAIL_REGEX.test(pathname)
  const isVisible = useScrollVisibility({ enabled: hideOnScroll })
  const { isAuthenticated } = useBlogAuth()

  return (
    <motion.header
      initial={false}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-40 border-b border-rga-green/20 bg-void/90 backdrop-blur-md"
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
            <BlogNavLinks />
          </div>

          {/* Center: Search */}
          <BlogNavSearch />

          {/* Right: User menu (desktop) + Site menu trigger. Bookmarks moved
              to /me/bookmarks — entry point lives in the chrome menu overlay. */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="hidden sm:block">
                <BlogNavUserMenu />
              </div>
            )}
            <BlogNavMenuTrigger />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
