'use client'

import { useState, useEffect } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseTrelloUrl, getTrelloColorHex, type TrelloCardData } from '@/lib/trello-card'

/**
 * Custom markdown components for Trello card description
 */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-semibold text-white mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold text-white mt-4 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-white mt-3 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 text-rga-gray/80">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 space-y-1 [&_ul]:mt-1 [&_ul]:mb-0 [&_ul]:ml-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 space-y-1 list-decimal list-inside [&_ol]:mt-1 [&_ol]:mb-0 [&_ol]:ml-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-rga-gray/80">
      <span className="text-[#0079BF] mt-1.5 shrink-0">
        <span className="block w-1.5 h-1.5 bg-[#0079BF] rounded-full" />
      </span>
      <div className="flex-1 [&>ul]:my-1 [&>ol]:my-1">{children}</div>
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#0079BF] hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-white/90 font-medium">{children}</strong>
  ),
  hr: () => (
    <hr className="my-4 border-rga-gray/20" />
  ),
}

interface TrelloCardProps {
  url: string
  caption?: string | null
}

/**
 * Corner bracket decoration component (matches existing theme)
 */
function Corner({
  position,
  colorClass = 'text-[#0079BF]/40',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  colorClass?: string
}) {
  const rotations = { tl: '', tr: 'rotate-90', bl: '-rotate-90', br: 'rotate-180' }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={colorClass}>
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * Trello icon component
 */
function TrelloIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .795-.645 1.44-1.44 1.44h-4.44c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
  )
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-rga-gray/50">
      <div className="animate-pulse text-[#0079BF]">
        <TrelloIcon className="w-10 h-10" />
      </div>
      <div className="text-sm">Loading Trello card...</div>
    </div>
  )
}

/**
 * Error fallback component
 */
function ErrorFallback({ url, error }: { url: string; error: string }) {
  const parsed = parseTrelloUrl(url)

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-rga-gray/30">
        <TrelloIcon className="w-8 h-8" />
      </div>
      <div className="text-center">
        <p className="text-sm text-rga-gray/70 mb-2">{error}</p>
        {parsed && (
          <a
            href={parsed.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0079BF] hover:text-[#026aa7] transition-colors underline underline-offset-2"
          >
            View on Trello
          </a>
        )}
      </div>
    </div>
  )
}

/**
 * Due date display component
 */
function DueDate({ due, dueComplete }: { due: string; dueComplete: boolean }) {
  const dueDate = new Date(due)
  const now = new Date()
  const isOverdue = !dueComplete && dueDate < now
  const isDueSoon = !dueComplete && !isOverdue && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000

  let bgColor = 'bg-rga-gray/20'
  let textColor = 'text-rga-gray'

  if (dueComplete) {
    bgColor = 'bg-green-500/20'
    textColor = 'text-green-400'
  } else if (isOverdue) {
    bgColor = 'bg-red-500/20'
    textColor = 'text-red-400'
  } else if (isDueSoon) {
    bgColor = 'bg-yellow-500/20'
    textColor = 'text-yellow-400'
  }

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${bgColor} ${textColor}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {dueComplete && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {formattedDate}
    </div>
  )
}

/**
 * Checklist progress component
 */
function ChecklistProgress({ name, checkItems }: { name: string; checkItems: { state: 'complete' | 'incomplete' }[] }) {
  const completed = checkItems.filter((item) => item.state === 'complete').length
  const total = checkItems.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-rga-gray/70 truncate">{name}</span>
        <span className="text-rga-gray/50 ml-2 shrink-0">{completed}/{total}</span>
      </div>
      <div className="h-1.5 bg-rga-gray/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0079BF] rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Card content component
 */
function CardContent({ data }: { data: TrelloCardData }) {
  return (
    <div className="space-y-4">
      {/* Cover image */}
      {data.coverImage && (
        <div className="aspect-16/9 w-full overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <a
        href={data.shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-lg font-semibold text-white hover:text-[#0079BF] transition-colors"
      >
        {data.name}
      </a>

      {/* Labels */}
      {data.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: getTrelloColorHex(label.color),
                color: label.color?.includes('light') ? '#172b4d' : 'white',
              }}
            >
              {label.name || '\u00A0'}
            </span>
          ))}
        </div>
      )}

      {/* Description (markdown rendered) */}
      {data.desc && (
        <div className="text-sm">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {data.desc}
          </Markdown>
        </div>
      )}

      {/* Due date */}
      {data.due && (
        <DueDate due={data.due} dueComplete={data.dueComplete} />
      )}

      {/* Checklists */}
      {data.checklists.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-rga-gray/10">
          {data.checklists.map((checklist) => (
            <ChecklistProgress
              key={checklist.id}
              name={checklist.name}
              checkItems={checklist.checkItems}
            />
          ))}
        </div>
      )}

      {/* Open in Trello link */}
      <a
        href={data.shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[#0079BF] hover:text-[#026aa7] transition-colors"
      >
        Open in Trello
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  )
}

/**
 * Frontend Trello card embed renderer component.
 * Displays embedded Trello cards with themed styling.
 */
export function TrelloCard({ url, caption }: TrelloCardProps) {
  const [cardData, setCardData] = useState<TrelloCardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCard = async () => {
      const parsed = parseTrelloUrl(url)
      if (!parsed) {
        setError('Invalid Trello card URL')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/trello/${parsed.shortLink}`)

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to load card')
          setIsLoading(false)
          return
        }

        const data: TrelloCardData = await response.json()
        setCardData(data)
      } catch {
        setError('Failed to load Trello card')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCard()
  }, [url])

  return (
    <div className="relative my-10 py-5 px-4 bg-[#0079BF]/5">
      {/* Corner brackets */}
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      {/* Platform badge */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1 bg-bg-primary">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] rounded bg-[#0079BF] text-white">
            <TrelloIcon />
            Trello
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-rga-gray/50">
            Card
          </span>
        </div>
      </div>

      {/* Content container */}
      <div className="relative w-full mt-3 max-w-lg mx-auto">
        {isLoading && <LoadingSkeleton />}
        {error && <ErrorFallback url={url} error={error} />}
        {cardData && <CardContent data={cardData} />}
      </div>

      {/* Optional caption */}
      {caption && (
        <p className="mt-3 text-center text-sm text-rga-gray italic">
          {caption}
        </p>
      )}
    </div>
  )
}

export default TrelloCard
