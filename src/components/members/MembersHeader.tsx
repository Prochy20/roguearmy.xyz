'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, Menu, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/auth'

interface MemberInfo {
  discordId: string
  avatar: string | null
  username: string
  globalName: string | null
}

interface MembersHeaderProps {
  member: MemberInfo
  searchValue: string
  onSearchChange: (value: string) => void
  onMobileFilterOpen: () => void
}

export function MembersHeader({
  member,
  searchValue,
  onSearchChange,
  onMobileFilterOpen,
}: MembersHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchExpanded(true)
      }
      if (event.key === 'Escape') {
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-rga-green/20 bg-void/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo/Back + Mobile Filter */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-rga-green font-display text-xl tracking-wider hover:text-glow-green transition-all"
            >
              RGA
            </Link>

            {/* Mobile filter button */}
            <button
              onClick={onMobileFilterOpen}
              className="lg:hidden flex items-center gap-1 px-3 py-1.5 border border-rga-green/30 rounded-lg text-rga-gray text-sm hover:border-rga-green/50 hover:text-rga-green transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Center: Search (Desktop expanded, Mobile icon) */}
          <div className="flex-1 flex justify-center max-w-xl">
            <AnimatePresence mode="wait">
              {isSearchExpanded ? (
                <motion.div
                  key="search-expanded"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rga-gray" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-10 py-2 bg-bg-elevated border border-rga-green/30 rounded-lg text-white placeholder:text-rga-gray/50 focus:outline-none focus:border-rga-green/60 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all"
                  />
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false)
                      onSearchChange('')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rga-gray hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchExpanded(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-rga-green/20 rounded-lg text-rga-gray hover:border-rga-green/40 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Search</span>
                  <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-rga-gray/60 bg-bg-surface rounded">
                    <span className="text-[10px]">&#8984;</span>K
                  </kbd>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Right: User Avatar + Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <UserAvatar
                discordId={member.discordId}
                avatar={member.avatar}
                username={member.username}
                size="sm"
              />
              <span className="hidden md:inline text-rga-gray text-sm">
                {member.globalName || member.username}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-rga-gray transition-transform',
                  isUserMenuOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-rga-green/20 rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-rga-green/10">
                    <p className="text-white text-sm font-medium truncate">
                      {member.globalName || member.username}
                    </p>
                    <p className="text-rga-gray/60 text-xs truncate">
                      @{member.username}
                    </p>
                  </div>
                  <nav className="py-1">
                    <Link
                      href="/members/profile"
                      className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                    >
                      Profile
                    </Link>
                    <a
                      href="https://discord.gg/roguearmy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-rga-gray hover:text-white hover:bg-bg-surface transition-colors"
                    >
                      Discord
                    </a>
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
        </div>
      </div>
    </header>
  )
}
