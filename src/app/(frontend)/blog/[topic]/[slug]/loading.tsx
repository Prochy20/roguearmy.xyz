import { Skeleton } from '@/components/ui/skeleton'
import { CyberCorners } from '@/components/ui/CyberCorners'

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Hero section - matches BlogArticleHero min-h-[85vh] */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
        {/* Background skeleton */}
        <Skeleton className="absolute inset-0 rounded-none" />

        {/* Gradient overlays to match real page */}
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-void/20" />
        <div className="absolute inset-0 bg-linear-to-r from-void/50 via-transparent to-void/30" />

        {/* Content - matches BlogArticleHero layout */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-20 md:pb-32">
          <div className="max-w-7xl">
            {/* Topic and game badges */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>

            {/* Title - large display font size */}
            <div className="mb-8">
              <CyberCorners color="green" size="md">
                <div className="space-y-2">
                  <Skeleton className="h-[10vw] md:h-[8vw] lg:h-[5vw] w-full max-h-20" glow />
                  <Skeleton className="h-[10vw] md:h-[8vw] lg:h-[5vw] w-3/4 max-h-20" glow />
                </div>
              </CyberCorners>
            </div>

            {/* Meta row - date, reading time, share, bookmark */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
              <span className="hidden sm:block w-px h-4 bg-rga-gray/30" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
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
      </section>

      {/* Content section - matches page.tsx layout */}
      <main className="relative z-10">
        {/* Transition gradient from hero */}
        <div className="h-32 bg-linear-to-b from-transparent to-void -mt-32 relative z-20" />

        <div className="bg-void relative">
          {/* Content grid - matches 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,720px)_1fr] gap-8 px-6 md:px-12 lg:px-0">
            {/* Left margin */}
            <div className="hidden lg:block" />

            {/* Center - Article content skeleton */}
            <div className="py-8 space-y-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />

              <div className="py-4" />

              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />

              <div className="py-4" />

              {/* Subheading */}
              <Skeleton className="h-8 w-1/2" glow />

              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>

            {/* Right margin - metadata */}
            <div className="hidden lg:block pt-12 pl-8">
              <div className="sticky top-24 space-y-8">
                <div className="space-y-4 text-sm">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-4 text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-4 text-sm">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="w-16 h-px bg-linear-to-r from-rga-green/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom fade */}
      <div className="h-32 bg-linear-to-t from-void to-transparent" />
    </div>
  )
}
