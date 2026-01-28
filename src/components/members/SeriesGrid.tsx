import { SeriesCard } from './SeriesCard'
import type { ArticleImage } from '@/lib/articles'

interface SeriesItem {
  id: string
  name: string
  slug: string
  description: string | null
  heroImage: ArticleImage | null
  articleCount: number
  completedCount?: number
  inProgressCount?: number
}

interface SeriesGridProps {
  series: SeriesItem[]
}

/**
 * Responsive grid layout for series cards
 */
export function SeriesGrid({ series }: SeriesGridProps) {
  if (series.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-rga-gray/60">No series available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {series.map((item, index) => (
        <SeriesCard
          key={item.id}
          {...item}
          index={index}
        />
      ))}
    </div>
  )
}
