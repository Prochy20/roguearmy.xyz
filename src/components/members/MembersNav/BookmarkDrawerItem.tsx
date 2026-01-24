'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mapPayloadColorToTint, getTintClasses } from '@/lib/articles'
import { ReadStatusIndicator, getReadStatus, type ReadStatus } from '@/components/members/ReadStatusIndicator'
import type { BookmarkWithArticle } from '@/lib/bookmarks'
import type { BookmarkProgressData } from '@/hooks/useBookmarkProgress'

interface BookmarkDrawerItemProps {
  bookmark: BookmarkWithArticle
  progress?: BookmarkProgressData
  onRemove: () => void
  onNavigate: () => void
}

export function BookmarkDrawerItem({
  bookmark,
  progress,
  onRemove,
  onNavigate,
}: BookmarkDrawerItemProps) {
  const { article } = bookmark

  // Get topic color classes
  const tint = article.topic?.color
    ? getTintClasses(mapPayloadColorToTint(article.topic.color))
    : null

  // Determine read status
  const status: ReadStatus = getReadStatus(progress?.progress, progress?.completed)

  return (
    <div className="group relative flex items-start gap-3 px-4 py-3 hover:bg-bg-surface transition-colors">
      {/* Topic color dot */}
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0',
          tint?.text ? tint.text.replace('text-', 'bg-') : 'bg-rga-gray/40'
        )}
      />

      {/* Article info */}
      <Link
        href={`/members/articles/${article.slug}`}
        onClick={onNavigate}
        className="flex-1 min-w-0"
      >
        <p className="text-sm text-rga-gray hover:text-white transition-colors line-clamp-2">
          {article.title}
        </p>
        {article.topic && (
          <p className={cn('text-xs mt-0.5', tint?.textMuted || 'text-rga-gray/40')}>
            {article.topic.name}
          </p>
        )}
      </Link>

      {/* Right side: progress indicator + remove button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ReadStatusIndicator status={status} progress={progress?.progress} size="sm" />

        {/* Remove button - visible on hover */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="p-1 text-rga-gray/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`Remove "${article.title}" from bookmarks`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
