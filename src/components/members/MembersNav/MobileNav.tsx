'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { useMember } from '@/contexts/MembersContext'

const navLinks = [
  { href: '/blog', label: 'Articles', pattern: /^\/blog(?!\/series|\/bookmarks|\/history)/ },
  { href: '/blog/series', label: 'Series', pattern: /^\/blog\/series/ },
]

const secondaryLinks = [{ href: '/blog/history', label: 'Reading History' }]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const member = useMember()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 text-rga-gray hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-bg-elevated border-l border-rga-green/20 sm:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-rga-green/20">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    discordId={member.discordId}
                    avatar={member.avatar}
                    username={member.username}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {member.globalName || member.username}
                    </p>
                    <p className="text-rga-gray/60 text-xs truncate">@{member.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-rga-gray hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                {/* Main navigation */}
                <div className="space-y-1 mb-6">
                  <p className="text-rga-gray/40 text-xs uppercase tracking-wider mb-2">
                    Navigation
                  </p>
                  {navLinks.map((link) => {
                    const isActive = link.pattern.test(pathname)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-rga-green/10 text-rga-green'
                            : 'text-rga-gray hover:text-white hover:bg-bg-surface',
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>

                {/* Secondary links */}
                <div className="space-y-1 mb-6">
                  <p className="text-rga-gray/40 text-xs uppercase tracking-wider mb-2">Account</p>
                  {secondaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 rounded-lg text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <a
                    href="https://dc.roguearmy.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                  >
                    Discord
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-rga-green/10">
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a
                    href="/api/auth/logout"
                    className="block px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-bg-surface transition-colors"
                  >
                    Logout
                  </a>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
