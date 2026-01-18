'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/members', label: 'Articles', pattern: /^\/members(\/articles)?/ },
  { href: '/members/series', label: 'Series', pattern: /^\/members\/series/ },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = link.pattern.test(pathname)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'text-rga-green font-medium'
                : 'text-rga-gray hover:text-white'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
