'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmarks } from '@/contexts/BookmarksContext'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BookmarkButtonProps {
  articleId: string
  size?: 'sm' | 'md'
  className?: string
}

export function BookmarkButton({ articleId, size = 'sm', className }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [isAnimating, setIsAnimating] = useState(false)

  const bookmarked = isBookmarked(articleId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)
    await toggleBookmark(articleId)

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 400)
  }

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-all duration-200',
              sizeClasses[size],
              bookmarked
                ? 'text-rga-cyan bg-rga-cyan/10 hover:bg-rga-cyan/20'
                : 'text-rga-gray/60 hover:text-rga-cyan/80 hover:bg-rga-cyan/5',
              className
            )}
          >
            {/* Glow effect when bookmarked */}
            {bookmarked && (
              <div className="absolute inset-0 rounded-full bg-rga-cyan/20 blur-md" />
            )}

            {/* Pulse animation on toggle */}
            {isAnimating && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-full bg-rga-cyan"
              />
            )}

            {/* Icon */}
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
