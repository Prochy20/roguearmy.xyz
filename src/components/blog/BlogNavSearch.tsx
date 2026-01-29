'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function BlogNavSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Check if we're on the articles listing page (main blog page)
  const isArticlesPage = pathname === '/blog'

  // Initialize from URL search param
  const urlSearchValue = searchParams.get('search') ?? ''
  const [searchValue, setSearchValue] = useState(urlSearchValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input with URL when it changes externally (e.g., browser back/forward)
  useEffect(() => {
    setSearchValue(urlSearchValue)
  }, [urlSearchValue])

  // Keyboard shortcut for search - focus input on ⌘K
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    // Blur input after submit
    inputRef.current?.blur()
  }, [isArticlesPage, searchValue, updateUrl])

  const handleClear = useCallback(() => {
    setSearchValue('')
    updateUrl('')
    inputRef.current?.focus()
  }, [updateUrl])

  return (
    <div className="flex-1 flex justify-center max-w-xl">
      <form className="relative" onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rga-gray" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search articles..."
          className="w-48 sm:w-64 focus:w-80 pl-10 pr-10 py-2 bg-bg-elevated border border-rga-green/30 rounded-lg text-white placeholder:text-rga-gray/50 focus:outline-none focus:border-rga-green/60 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all duration-200"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rga-gray hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!searchValue && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-rga-gray/60 bg-bg-surface rounded pointer-events-none">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )}
      </form>
    </div>
  )
}
