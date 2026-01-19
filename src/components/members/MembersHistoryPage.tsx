'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { History, ArrowRight, CheckCircle2, Clock, ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArticleCard } from './ArticleCard'
import { ArticleCardCompact } from './ArticleCardCompact'
import { ArticleCardList } from './ArticleCardList'
import { ViewModeToggle } from './ViewModeToggle'
import { HeroGlitch } from '@/components/effects'
import { useViewMode } from '@/hooks/useViewMode'
import type { Article } from '@/lib/articles'
import type { ArticleProgress } from '@/lib/progress.server'
import type { HistoryStatusFilter } from '@/lib/history.server'

interface MembersHistoryPageProps {
  articles: Article[]
  progress: Record<string, ArticleProgress>
  statusFilter: HistoryStatusFilter
}

const statusOptions: { value: HistoryStatusFilter; label: string; icon: typeof ListFilter }[] = [
  { value: 'all', label: 'All', icon: ListFilter },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
]

export function MembersHistoryPage({ articles, progress, statusFilter }: MembersHistoryPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { viewMode, setViewMode } = useViewMode()

  // Handle filter change
  const handleFilterChange = (newFilter: HistoryStatusFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newFilter === 'all') {
      params.delete('status')
    } else {
      params.set('status', newFilter)
    }
    const newUrl = params.toString() ? `/members/history?${params.toString()}` : '/members/history'
    router.push(newUrl)
  }

  // Grid classes based on view mode
  const gridClasses = cn(
    viewMode === 'featured' && 'grid grid-cols-1 md:grid-cols-2 gap-6',
    viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr',
    viewMode === 'list' && 'flex flex-col gap-3'
  )

  // Render the appropriate card component based on view mode
  const renderCard = (article: Article, index: number) => {
    const cardProgress = progress[article.id] || null

    switch (viewMode) {
      case 'grid':
        return (
          <ArticleCardCompact
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
      case 'list':
        return (
          <ArticleCardList
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
      case 'featured':
      default:
        return (
          <ArticleCard
            key={article.id}
            article={article}
            index={index}
            progress={cardProgress}
          />
        )
    }
  }

  // Get description based on current filter
  const getDescription = () => {
    switch (statusFilter) {
      case 'completed':
        return "Articles you've finished reading. Great job!"
      case 'in_progress':
        return "Articles you've started but haven't finished yet. Pick up where you left off."
      default:
        return "All articles you've visited. Track your progress through the Rogue Army knowledge base."
    }
  }

  return (
    <div className="min-h-screen bg-void">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3">
                <HeroGlitch
                  minInterval={4}
                  maxInterval={10}
                  intensity={8}
                  dataCorruption
                  scanlines
                >
                  READING HISTORY
                </HeroGlitch>
              </h1>
              <p className="text-rga-gray max-w-2xl">
                {getDescription()}
              </p>
            </div>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              className="shrink-0"
            />
          </div>

          {/* Status Filter */}
          <div className="mt-6 flex items-center gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon
              const isActive = statusFilter === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                    isActive
                      ? 'bg-rga-green/20 text-rga-green border border-rga-green/40'
                      : 'bg-bg-elevated text-rga-gray border border-rga-green/10 hover:border-rga-green/30 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {articles.length === 0 ? (
          <HistoryEmptyState statusFilter={statusFilter} />
        ) : (
          <div className={gridClasses}>
            {articles.map((article, index) => renderCard(article, index))}
          </div>
        )}
      </main>
    </div>
  )
}

function HistoryEmptyState({ statusFilter }: { statusFilter: HistoryStatusFilter }) {
  const getMessage = () => {
    switch (statusFilter) {
      case 'completed':
        return {
          title: 'No completed articles yet',
          description: "You haven't finished reading any articles yet. Articles are marked as completed once you've read at least 85% of the content.",
        }
      case 'in_progress':
        return {
          title: 'No articles in progress',
          description: "You don't have any partially read articles. Start reading something new!",
        }
      default:
        return {
          title: 'No reading history yet',
          description: 'Start reading articles to build your history.',
        }
    }
  }

  const { title, description } = getMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <History className="w-16 h-16 text-rga-gray/20" />
        <div className="absolute inset-0 bg-rga-green/5 blur-xl rounded-full" />
      </div>
      <h2 className="text-xl font-display text-white mb-2">{title}</h2>
      <p className="text-rga-gray/60 max-w-md mb-6">{description}</p>
      <Link
        href="/members"
        className="inline-flex items-center gap-2 px-4 py-2 bg-rga-green/10 text-rga-green border border-rga-green/30 rounded-lg hover:bg-rga-green/20 transition-colors"
      >
        Browse articles
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}
