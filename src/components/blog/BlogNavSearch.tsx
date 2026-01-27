'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X } from 'lucide-react'

export function BlogNavSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Check if we're on the articles listing page (main blog page)
  const isArticlesPage = pathname === '/blog'

  // Track whether there's an active search in URL (for visual indicator)
  const hasActiveSearch = !!searchParams.get('search')

  const [searchValue, setSearchValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Expand handler - always start with empty input
  const handleExpand = useCallback(() => {
    setSearchValue('')
    setIsExpanded(true)
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        handleExpand()
      }
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleExpand])

  const updateUrl = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    const newUrl = params.toString() ? `/blog?${params.toString()}` : '/blog'

    if (isArticlesPage) {
      // On articles page: update URL without navigation for instant filtering
      router.replace(newUrl, { scroll: false })
    } else {
      // On other pages: navigate to articles page
      router.push(newUrl)
    }
  }, [searchParams, isArticlesPage, router])

  const handleChange = useCallback((value: string) => {
    setSearchValue(value)
    if (isArticlesPage) {
      // On articles page: update URL immediately for inline filtering
      updateUrl(value)
    }
  }, [isArticlesPage, updateUrl])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!isArticlesPage) {
      // On other pages: navigate on submit
      updateUrl(searchValue)
    }
    setIsExpanded(false)
  }, [isArticlesPage, searchValue, updateUrl])

  const handleClear = useCallback(() => {
    setSearchValue('')
    // Always navigate to clean /blog URL to clear search
    router.replace('/blog', { scroll: false })
    setIsExpanded(false)
  }, [router])

  return (
    <div className="flex-1 flex justify-center max-w-xl">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.form
            key="search-expanded"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full"
            onSubmit={handleSubmit}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rga-gray" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-10 py-2 bg-bg-elevated border border-rga-green/30 rounded-lg text-white placeholder:text-rga-gray/50 focus:outline-none focus:border-rga-green/60 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-rga-gray hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="search-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={handleExpand}
            className="relative flex items-center gap-2 px-4 py-2 border border-rga-green/20 rounded-lg text-rga-gray hover:border-rga-green/40 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Search</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-rga-gray/60 bg-bg-surface rounded">
              <span className="text-[10px]">&#8984;</span>K
            </kbd>
            {/* Visual indicator when search is active */}
            {hasActiveSearch && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rga-green rounded-full" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
