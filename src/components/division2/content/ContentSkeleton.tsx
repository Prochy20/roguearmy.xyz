/**
 * Shimmer placeholder card matching the side-by-side ContentCard layout.
 * Renders one row in the feed while a loadMore batch is in flight. Uses
 * the existing `--animate-shimmer` keyframe defined in globals.css.
 */
export function ContentSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden border border-text-muted/15 bg-bg-elevated/60 sm:flex-row">
      <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-text-muted/20" />
      <div className="relative w-full shrink-0 overflow-hidden bg-bg-surface sm:w-[240px] md:w-[280px]">
        <div className="aspect-16/9 w-full sm:aspect-auto sm:h-full sm:min-h-[140px]">
          <Shimmer />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 pt-5 pb-4 sm:gap-3 sm:px-5 sm:pt-5 sm:pb-5">
        <div className="h-[10px] w-32 rounded-sm bg-bg-surface" />
        <div className="h-6 w-5/6 rounded-sm bg-bg-surface" />
        <div className="h-4 w-3/4 rounded-sm bg-bg-surface" />
        <div className="h-3 w-1/3 rounded-sm bg-bg-surface" />
      </div>
    </div>
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
