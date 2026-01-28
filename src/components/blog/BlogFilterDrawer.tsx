'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'

interface BlogFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  activeCount: number
  onClearAll: () => void
  children: ReactNode
}

/**
 * Unified filter drawer for blog pages.
 * Uses the Drawer primitive with a custom header showing title + clear all button.
 *
 * Children are the filter fields rendered by the parent component,
 * allowing different filter configurations for articles vs series.
 */
export function BlogFilterDrawer({
  open,
  onOpenChange,
  title,
  activeCount,
  onClearAll,
  children,
}: BlogFilterDrawerProps) {
  const handleClearAll = () => {
    onClearAll()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      width="w-80"
      accent="green"
    >
      {/* Custom header with title and clear all */}
      <div className="flex items-center justify-between p-4 border-b border-rga-green/20 flex-shrink-0">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rga-gray hover:text-rga-green transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all ({activeCount})
            </button>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-rga-gray hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable filter content */}
      <DrawerContent className="p-4">
        <div className="space-y-5">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
