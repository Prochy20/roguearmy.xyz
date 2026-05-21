'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface MenuContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  setOpen: (next: boolean) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ isOpen, open, close, setOpen }), [isOpen, open, close])
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext)
  if (!ctx) {
    throw new Error('useMenu must be used inside <MenuProvider>')
  }
  return ctx
}
