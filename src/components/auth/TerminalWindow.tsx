'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface TerminalWindowProps {
  children: React.ReactNode
  title?: string
  className?: string
  showTrafficLights?: boolean
  showFooter?: boolean
  footerText?: string
}

/**
 * Reusable terminal frame component with cyberpunk styling.
 * Features traffic light buttons, green glowing border, and optional status footer.
 */
export function TerminalWindow({
  children,
  title = 'TERMINAL',
  className,
  showTrafficLights = true,
  showFooter = true,
  footerText = 'SECURE CONNECTION',
}: TerminalWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-black/95 border border-rga-green/50 rounded-lg overflow-hidden',
        'shadow-[0_0_30px_rgba(0,255,65,0.15)]',
        className
      )}
    >
      {/* Header with traffic lights */}
      <div className="flex items-center justify-between px-4 py-3 bg-rga-green/10 border-b border-rga-green/30">
        {showTrafficLights ? (
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        ) : (
          <div />
        )}
        <span className="font-mono text-xs sm:text-sm text-rga-green tracking-wider">
          {title}
        </span>
        <div className="w-[52px]" /> {/* Spacer for centering */}
      </div>

      {/* Terminal body */}
      <div className="p-4 sm:p-6">{children}</div>

      {/* Footer with status indicator */}
      {showFooter && (
        <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-t border-rga-green/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rga-green animate-pulse" />
            <span className="font-mono text-xs text-text-muted">{footerText}</span>
          </div>
          <span className="font-mono text-xs text-rga-green/60">RGA://AUTH</span>
        </div>
      )}
    </motion.div>
  )
}
