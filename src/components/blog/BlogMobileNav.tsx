'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { useBlogAuth } from '@/contexts/BlogAuthContext'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

const navLinks = [
  { href: '/blog', label: 'Articles', pattern: /^\/blog(?!\/series|\/bookmarks|\/history)/ },
  { href: '/blog/series', label: 'Series', pattern: /^\/blog\/series/ },
]

const authenticatedLinks = [
  { href: '/blog/bookmarks', label: 'Bookmarks' },
  { href: '/blog/history', label: 'Reading History' },
]

interface BlogMobileNavProps {
  isAuthenticated: boolean
}

export function BlogMobileNav({ isAuthenticated }: BlogMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { member } = useBlogAuth()

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

  const handleLogin = () => {
    const returnTo = encodeURIComponent(pathname)
    window.location.href = `/api/auth/discord?returnTo=${returnTo}`
  }

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
                {isAuthenticated && member ? (
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
                ) : (
                  <span className="text-rga-green font-display text-lg">Blog</span>
                )}
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

                {/* Authenticated user links */}
                {isAuthenticated ? (
                  <>
                    <div className="space-y-1 mb-6">
                      <p className="text-rga-gray/40 text-xs uppercase tracking-wider mb-2">Account</p>
                      {authenticatedLinks.map((link) => (
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
                      <Link
                        href="/auth/logout"
                        className="block px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-bg-surface transition-colors"
                      >
                        Logout
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="pt-4 border-t border-rga-green/10">
                      <button
                        onClick={handleLogin}
                        className="group relative flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-void/80 font-mono text-sm transition-colors duration-300"
                      >
                        {/* Corner brackets - top left */}
                        <span className="absolute -top-px -left-px w-3 h-px bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:w-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span className="absolute -top-px -left-px w-px h-3 bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:h-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />

                        {/* Corner brackets - top right */}
                        <span className="absolute -top-px -right-px w-3 h-px bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span className="absolute -top-px -right-px w-px h-3 bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

                        {/* Corner brackets - bottom left */}
                        <span className="absolute -bottom-px -left-px w-3 h-px bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:w-4 group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
                        <span className="absolute -bottom-px -left-px w-px h-3 bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:h-4 group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />

                        {/* Corner brackets - bottom right */}
                        <span className="absolute -bottom-px -right-px w-3 h-px bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:w-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                        <span className="absolute -bottom-px -right-px w-px h-3 bg-rga-cyan shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300 group-hover:h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />

                        {/* Inner glow on hover */}
                        <span className="absolute inset-0 bg-gradient-to-b from-rga-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <DiscordIcon className="relative w-4 h-4 text-rga-gray group-hover:text-rga-cyan transition-colors duration-300" />
                        <span className="relative tracking-wider text-rga-gray group-hover:text-rga-cyan transition-colors duration-300 uppercase text-xs font-medium">
                          Login with Discord
                        </span>
                      </button>
                      <p className="text-rga-gray/50 text-xs text-center mt-3">
                        Login to access members-only content
                      </p>
                    </div>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
