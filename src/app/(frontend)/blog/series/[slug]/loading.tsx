import { Skeleton } from '@/components/ui/skeleton'
import { CyberCorners } from '@/components/ui/CyberCorners'

export default function SeriesDetailLoading() {
  return (
    <div className="min-h-screen bg-void">
      {/* Hero section - matches SeriesHero min-h-[85vh] */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
        {/* Background skeleton */}
        <Skeleton className="absolute inset-0 rounded-none" />

        {/* Gradient overlays to match real page */}
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-void/20" />
        <div className="absolute inset-0 bg-linear-to-r from-void/50 via-transparent to-void/30" />

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.015)_2px,rgba(0,255,65,0.015)_4px)] pointer-events-none" />

        {/* Content - matches SeriesHero layout */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-20 md:pb-32">
          <div className="max-w-5xl">
            {/* Back button and article count badge */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-7 w-24" />
            </div>

            {/* Title - large display font */}
            <div className="mb-8">
              <CyberCorners color="cyan" size="md">
                <Skeleton className="h-[10vw] md:h-[8vw] lg:h-[6vw] w-full max-h-24" glow />
              </CyberCorners>
            </div>

            {/* Description */}
            <div className="mb-8 max-w-2xl space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* Progress bar skeleton */}
            <div className="max-w-sm">
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>

          {/* Scroll indicator skeleton */}
          <div className="absolute bottom-8 right-8 hidden md:block">
            <div className="flex flex-col items-center gap-2 text-rga-gray/20">
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-px h-12" />
            </div>
          </div>
        </div>

        {/* Articles section indicator */}
        <div className="absolute bottom-0 left-0 right-0 py-4 text-center">
          <Skeleton className="h-3 w-40 mx-auto" />
        </div>
      </section>

      {/* Article list - matches series detail page */}
      <main className="relative z-10 bg-void">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SeriesArticleCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function SeriesArticleCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <CyberCorners color="gray" size="sm" glow={false}>
        <div className="relative flex gap-4 p-4 border border-rga-gray/20 bg-bg-elevated">
          {/* Order number */}
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-rga-gray/20 rounded-sm">
            <span className="text-rga-gray/40 font-mono text-lg">{index + 1}</span>
          </div>

          {/* Thumbnail - hidden on mobile */}
          <Skeleton className="hidden sm:block flex-shrink-0 w-24 aspect-video rounded-sm" />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" glow />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Read status placeholder */}
          <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full self-center" />
        </div>
      </CyberCorners>
    </div>
  )
}
