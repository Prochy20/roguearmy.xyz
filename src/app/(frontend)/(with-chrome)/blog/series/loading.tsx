import { Skeleton } from '@/components/ui/skeleton'
import { CyberCorners } from '@/components/ui/CyberCorners'

export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-void">
      <main className="container mx-auto px-4 py-8">
        {/* Page header - matches BlogSeriesPage */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Title skeleton */}
              <Skeleton className="h-10 sm:h-12 md:h-14 w-48 mb-3" glow />
              {/* Description skeleton */}
              <Skeleton className="h-5 w-full max-w-lg mb-1" />
              <Skeleton className="h-5 w-3/4 max-w-md" />
            </div>

            {/* Filter button skeleton - always visible */}
            <div className="inline-flex items-center p-1 bg-bg-elevated border border-rga-gray/20 rounded-sm shrink-0">
              <Skeleton className="w-8 h-8 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Full-width content layout - no sidebar */}
        <div className="w-full">
          {/* Series Grid skeleton - more columns without sidebar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SeriesCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function SeriesCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="bg-void-light border border-rga-gray/10 rounded-lg overflow-hidden animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      {/* Hero image with CyberCorners */}
      <CyberCorners color="cyan" size="sm" glow={false}>
        <Skeleton className="aspect-16/9 w-full rounded-none" />
      </CyberCorners>

      <div className="p-4 space-y-3">
        {/* Series title */}
        <Skeleton className="h-6 w-3/4" glow />

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Meta info */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}
