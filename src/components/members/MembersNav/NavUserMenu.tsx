'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/auth'
import { useMember } from '@/contexts/MembersContext'

export function NavUserMenu() {
  const member = useMember()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors"
      >
        <UserAvatar
          discordId={member.discordId}
          avatar={member.avatar}
          username={member.username}
          size="sm"
        />
        <span className="hidden md:inline text-rga-gray text-sm max-w-[120px] truncate">
          {member.globalName || member.username}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-rga-gray transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-bg-elevated border border-rga-green/20 rounded-lg shadow-xl overflow-hidden"
          >
            {/* User header */}
            <div className="px-4 py-3 border-b border-rga-green/10">
              <p className="text-white text-sm font-medium truncate">
                {member.globalName || member.username}
              </p>
              <p className="text-rga-gray/60 text-xs truncate">
                @{member.username}
              </p>
            </div>

            {/* Navigation links */}
            <nav className="py-1">
              {/* Mobile-only Articles/Series links */}
              <div className="sm:hidden border-b border-rga-green/10 pb-1 mb-1">
                <Link
                  href="/members"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                >
                  Articles
                </Link>
                <Link
                  href="/members/series"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                >
                  Series
                </Link>
              </div>

              <Link
                href="/members/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/members/history"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
              >
                Reading History
              </Link>
              <a
                href="https://discord.gg/roguearmy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
              >
                Discord
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Logout */}
              <div className="border-t border-rga-green/10 mt-1 pt-1">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/auth/logout"
                  className="block px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-bg-surface transition-colors"
                >
                  Logout
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
