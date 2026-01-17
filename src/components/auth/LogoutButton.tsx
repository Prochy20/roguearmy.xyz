'use client'

import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <button
      onClick={handleLogout}
      className={cn('text-rga-gray/60 hover:text-rga-red text-sm', className)}
    >
      Logout
    </button>
  )
}
