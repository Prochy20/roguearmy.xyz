'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { useAuth } from '@/components/auth/AuthProvider'
import { TopBar } from './TopBar'
import { TopoBackground } from './TopoBackground'
import { NavCenteredStack } from './NavCenteredStack'
import { BottomRail } from './BottomRail'
import { BracketButton } from './BracketButton'
import { useMenu } from './MenuContext'

const HIDE_TOPBAR_PREFIXES = ['/blog']

export function Header() {
  const { member, logout, roleGates } = useAuth()
  const { isOpen, open, close, setOpen } = useMenu()
  const pathname = usePathname()
  const lastPathnameRef = useRef(pathname)

  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname
      close()
    }
  }, [pathname, close])

  const hideTopBar = HIDE_TOPBAR_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {!hideTopBar && (
        <header className="fixed inset-x-0 top-0 z-50">
          <TopBar onOpen={open} member={member} />
        </header>
      )}

      <Dialog.Portal>
        <Dialog.Overlay
          className="rga-nav-overlay fixed inset-0 z-[60]"
          style={{ background: '#06090a' }}
        />
        <Dialog.Content
          aria-label="Site navigation"
          className="rga-nav-overlay fixed inset-0 z-[60] flex flex-col outline-none"
        >
          <TopoBackground accent="cyan" />

          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Primary navigation and member account.
          </Dialog.Description>

          <div className="relative z-[1] flex items-center justify-end h-20 px-7 gap-3">
            <Dialog.Close asChild>
              <BracketButton accent="green" active className="h-11 px-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path d="M6 6l12 12 M18 6L6 18" />
                </svg>
                <span>Close</span>
              </BracketButton>
            </Dialog.Close>
          </div>

          <div className="relative z-[1] flex flex-col flex-1 px-7 pb-7 overflow-y-auto">
            <NavCenteredStack onNavigate={close} isLoggedIn={Boolean(member)} roleGates={roleGates} />
            <div className="flex-1" />
            <BottomRail member={member} onLogout={logout} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
