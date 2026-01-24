'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareButtonProps {
  articleSlug: string
  size?: 'sm' | 'md'
  className?: string
}

export function ShareButton({
  articleSlug,
  size = 'sm',
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  }

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    // Try modern clipboard API first (requires secure context)
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback for non-secure contexts (e.g., LAN access during dev)
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    } catch {
      return false
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (copied) return

    const url = `${window.location.origin}/members/articles/${articleSlug}`
    const success = await copyToClipboard(url)

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [articleSlug, copied, copyToClipboard])

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={copied ? 'Copied!' : 'Copy link'}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-all duration-200',
              sizeClasses[size],
              copied
                ? 'text-rga-cyan bg-rga-cyan/10'
                : 'text-rga-gray/60 hover:text-rga-cyan/80 hover:bg-rga-cyan/5',
              className
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className={iconSizes[size]} />
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Share2 className={iconSizes[size]} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent accent="cyan">
          {copied ? 'Copied!' : 'Copy link'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
