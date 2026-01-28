'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { BlogNavLinks } from './BlogNavLinks'
import { BlogNavSearch } from './BlogNavSearch'
import { BlogNavUserMenu } from './BlogNavUserMenu'
import { BlogNavLoginButton } from './BlogNavLoginButton'
import { BlogMobileNav } from './BlogMobileNav'
import { BlogBookmarksDrawer } from './BlogBookmarksDrawer'
import { useScrollVisibility } from './useScrollVisibility'
import { useBlogAuth } from '@/contexts/BlogAuthContext'

interface BlogNavProps {
  /** Enable hide-on-scroll behavior (for article detail pages) */
  hideOnScroll?: boolean
  /** Whether the user is authenticated */
  isAuthenticated?: boolean
}

export function BlogNav({ hideOnScroll = false }: BlogNavProps) {
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
            <BlogNavLinks />
          </div>

          {/* Center: Search */}
          <BlogNavSearch />

          {/* Right: Bookmarks drawer + User menu (desktop) + Mobile hamburger */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Show bookmarks drawer for authenticated users */}
                <BlogBookmarksDrawer />
                <div className="hidden sm:block">
                  <BlogNavUserMenu />
                </div>
              </>
            ) : (
              <div className="hidden sm:block">
                <BlogNavLoginButton />
              </div>
            )}
            <BlogMobileNav isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
