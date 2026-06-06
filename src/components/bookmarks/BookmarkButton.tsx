'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmarksOptional } from '@/contexts/BookmarksContext'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { BookmarkTargetType } from '@/lib/bookmarks'

interface BookmarkButtonProps {
  targetType: BookmarkTargetType
  targetId: string
  size?: 'sm' | 'md'
  className?: string
}

// Returns null outside BookmarksProvider so preview surfaces don't ship a
// half-broken toggle. stopPropagation + preventDefault keep clicks from
// firing the wrapping Link on card variants.
export function BookmarkButton({
  targetType,
  targetId,
  size = 'sm',
  className,
}: BookmarkButtonProps) {
  const bookmarksContext = useBookmarksOptional()
  const [isAnimating, setIsAnimating] = useState(false)
  const [inFlight, setInFlight] = useState(false)

  if (!bookmarksContext) return null

  const { isBookmarked, toggleBookmark } = bookmarksContext
  const bookmarked = isBookmarked(targetType, targetId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inFlight) return
    setInFlight(true)
    setIsAnimating(true)
    try {
      await toggleBookmark(targetType, targetId)
    } finally {
      setInFlight(false)
      setTimeout(() => setIsAnimating(false), 400)
    }
  }

  const sizeClasses = { sm: 'w-7 h-7', md: 'w-9 h-9' }
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5' }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleClick}
            disabled={inFlight}
            whileHover={inFlight ? undefined : { scale: 1.1 }}
            whileTap={inFlight ? undefined : { scale: 0.95 }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            aria-busy={inFlight}
            className={cn(
              'relative flex items-center justify-center border backdrop-blur-sm transition-all duration-200',
              sizeClasses[size],
              bookmarked
                ? 'border-rga-cyan/50 bg-rga-cyan/15 text-rga-cyan hover:bg-rga-cyan/25'
                : 'border-white/15 bg-void/70 text-white/85 hover:border-rga-cyan/50 hover:text-rga-cyan',
              inFlight && 'cursor-wait opacity-70',
              className,
            )}
          >
            {bookmarked && (
              <div className="absolute inset-0 rounded-none bg-rga-cyan/20 blur-md" />
            )}

            {isAnimating && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-none bg-rga-cyan"
              />
            )}

            <motion.div
              initial={false}
              animate={isAnimating ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {bookmarked ? (
                <BookmarkCheck className={cn(iconSizes[size], 'fill-current')} />
              ) : (
                <Bookmark className={iconSizes[size]} />
              )}
            </motion.div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent accent="cyan">
          {bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
