'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TOCHeading } from '@/lib/toc'
import { useTOC } from './useTOC'
import { TOCItem } from './TOCItem'

interface MobileTOCProps {
  headings: TOCHeading[]
  className?: string
}

/**
 * Corner bracket decoration component (matches table/callout style)
 */
function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotations = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="text-rga-green/40"
      >
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * Collapsible mobile table of contents.
 * Only visible on mobile/tablet (lg:hidden).
 * Matches corner bracket + floating label style of tables and callouts.
 */
export function MobileTOC({ headings, className }: MobileTOCProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { activeId, scrollToHeading } = useTOC({ headings })

  // Don't render if no headings
  if (headings.length === 0) {
    return null
  }

  const handleItemClick = (id: string) => {
    scrollToHeading(id)
    // Auto-close after selection
    setIsOpen(false)
  }

  return (
    <div className={cn('lg:hidden', className)}>
      <div className="relative">
        {/* Corner brackets */}
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Floating label (matches table/callout style) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-void flex items-center gap-1.5">
          <List className="w-3 h-3 text-rga-green/40" />
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-rga-green/30">
            Contents
          </span>
        </div>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-full flex items-center justify-between gap-3 px-4 py-4',
            'text-left transition-colors duration-200',
            isOpen && 'bg-bg-surface/30'
          )}
          aria-expanded={isOpen}
          aria-controls="mobile-toc-content"
        >
          <span className="font-mono text-xs text-rga-gray/60">
            {headings.length} sections
          </span>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-rga-green/60" />
          </motion.span>
        </button>

        {/* Expandable content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-toc-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-rga-green/10 px-4 py-3">
                <nav
                  className="space-y-0.5 max-h-[40vh] overflow-y-auto scrollbar-hide"
                  aria-label="Table of contents"
                >
                  {headings.map((heading) => (
                    <TOCItem
                      key={heading.id}
                      heading={heading}
                      isActive={activeId === heading.id}
                      onClick={handleItemClick}
                    />
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
