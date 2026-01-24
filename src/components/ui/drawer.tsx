'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  side?: 'left' | 'right'
  width?: string
  accent?: 'green' | 'cyan'
  className?: string
}

/**
 * Reusable drawer primitive with backdrop blur and spring animation.
 * Matches MobileNav pattern for visual consistency.
 */
export function Drawer({
  open,
  onOpenChange,
  children,
  side = 'right',
  width = 'w-80 sm:w-96',
  accent = 'green',
  className,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const slideFrom = side === 'right' ? '100%' : '-100%'

  const drawerContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-void/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed inset-y-0 z-[100] flex flex-col bg-bg-elevated',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              accent === 'cyan' ? 'border-rga-cyan/20' : 'border-rga-green/20',
              width,
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Use portal to render outside parent stacking context
  if (!mounted) return null
  return createPortal(drawerContent, document.body)
}

export interface DrawerHeaderProps {
  children: ReactNode
  onClose: () => void
  accent?: 'green' | 'cyan'
  className?: string
}

export function DrawerHeader({
  children,
  onClose,
  accent = 'green',
  className,
}: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b flex-shrink-0',
        accent === 'cyan' ? 'border-rga-cyan/20' : 'border-rga-green/20',
        className
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onClose}
        className="p-1 text-rga-gray hover:text-white transition-colors flex-shrink-0 ml-2"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export interface DrawerContentProps {
  children: ReactNode
  className?: string
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return <div className={cn('flex-1 overflow-y-auto', className)}>{children}</div>
}

export interface DrawerFooterProps {
  children: ReactNode
  accent?: 'green' | 'cyan'
  className?: string
}

export function DrawerFooter({
  children,
  accent = 'green',
  className,
}: DrawerFooterProps) {
  return (
    <div
      className={cn(
        'p-4 border-t flex-shrink-0',
        accent === 'cyan' ? 'border-rga-cyan/20' : 'border-rga-green/20',
        className
      )}
    >
      {children}
    </div>
  )
}
