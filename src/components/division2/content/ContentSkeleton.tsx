import { CyberCorners } from '@/components/ui/CyberCorners'

/**
 * Shimmer placeholder matching the RGA-style intercept-card layout.
 * Rendered at the feed sentinel while a loadMore batch is in flight.
 * Uses the existing `--animate-shimmer` keyframe defined in globals.css.
 */
export function ContentSkeleton() {
  return (
    <CyberCorners color="gray" size="md">
      <div className="relative flex flex-col overflow-hidden border border-text-muted/15 bg-[rgba(0,0,0,0.55)] backdrop-blur-sm sm:flex-row">
        {/* Thumbnail frame */}
        <div className="relative w-full shrink-0 p-3 sm:w-[280px] sm:p-3.5 md:w-[320px]">
          <div className="relative aspect-16/9 w-full overflow-hidden border border-text-muted/15 sm:aspect-auto sm:h-full sm:min-h-[160px]">
            <span aria-hidden className="pointer-events-none absolute top-1 left-1 z-10 h-2 w-2 border-l border-t border-text-muted/40" />
            <span aria-hidden className="pointer-events-none absolute top-1 right-1 z-10 h-2 w-2 border-r border-t border-text-muted/40" />
            <span aria-hidden className="pointer-events-none absolute bottom-1 left-1 z-10 h-2 w-2 border-b border-l border-text-muted/40" />
            <span aria-hidden className="pointer-events-none absolute bottom-1 right-1 z-10 h-2 w-2 border-b border-r border-text-muted/40" />
            <Shimmer />
          </div>
        </div>

        {/* Content column */}
        <div className="relative flex min-w-0 flex-1 flex-col gap-3 px-5 pt-5 pb-4 sm:gap-3.5 sm:px-6 sm:pt-5 sm:pb-5">
          <div className="h-[10px] w-44 rounded-sm bg-bg-surface" />
          <div className="flex flex-col gap-1.5">
            <div className="h-[9px] w-24 rounded-sm bg-bg-surface" />
            <div className="h-7 w-5/6 rounded-sm bg-bg-surface" />
            <div className="h-7 w-3/5 rounded-sm bg-bg-surface" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-[9px] w-16 rounded-sm bg-bg-surface" />
            <div className="h-4 w-full rounded-sm bg-bg-surface" />
            <div className="h-4 w-4/5 rounded-sm bg-bg-surface" />
          </div>
          <div className="mt-auto h-[10px] w-2/3 rounded-sm bg-bg-surface pt-3" />
        </div>
      </div>
    </CyberCorners>
  )
}

function Shimmer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-linear-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  )
}
