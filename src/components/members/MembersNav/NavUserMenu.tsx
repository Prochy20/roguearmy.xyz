'use client'

import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/auth'
import { useMember } from '@/contexts/MembersContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NavUserMenu() {
  const member = useMember()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors group">
          <UserAvatar
            discordId={member.discordId}
            avatar={member.avatar}
            username={member.username}
            size="sm"
          />
          <span className="hidden md:inline text-rga-gray text-sm max-w-[120px] truncate">
            {member.globalName || member.username}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-rga-gray transition-transform',
              'group-data-[state=open]:rotate-180'
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 bg-bg-elevated border-rga-green/20"
      >
        {/* User header */}
        <DropdownMenuLabel className="px-4 py-3 font-normal">
          <p className="text-white text-sm font-medium truncate">
            {member.globalName || member.username}
          </p>
          <p className="text-rga-gray/60 text-xs truncate">@{member.username}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-rga-green/10" />

        {/* Mobile-only Articles/Series links */}
        <div className="sm:hidden">
          <DropdownMenuItem asChild>
            <Link
              href="/members"
              className="px-4 py-2 text-sm text-rga-gray hover:text-white cursor-pointer"
            >
              Articles
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/members/series"
              className="px-4 py-2 text-sm text-rga-gray hover:text-white cursor-pointer"
            >
              Series
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-rga-green/10" />
        </div>

        <DropdownMenuItem asChild>
          <Link
            href="/members/history"
            className="px-4 py-2 text-sm text-rga-gray hover:text-white cursor-pointer"
          >
            Reading History
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://dc.roguearmy.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-rga-gray hover:text-white cursor-pointer"
          >
            Discord
            <ExternalLink className="w-3 h-3" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-rga-green/10" />

        {/* Logout */}
        <DropdownMenuItem asChild>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/logout"
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 cursor-pointer"
          >
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
