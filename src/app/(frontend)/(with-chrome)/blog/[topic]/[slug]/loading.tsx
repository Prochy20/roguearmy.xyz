import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the reader-shell article layout. Mirrors
 * ReaderPageShell's three-column grid so the layout doesn't pop when the
 * real content arrives.
 */
export default function ArticleLoading() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-20 pb-24 sm:px-8 sm:pt-24 sm:pb-28 lg:px-12 lg:pt-28 lg:pb-36">
      <div className="flex flex-col gap-12 sm:gap-14 lg:gap-16">
        {/* Header chrome — breadcrumb, title block, hero frame. */}
        <div className="flex flex-col gap-7 sm:gap-9 lg:gap-10">
          <Skeleton className="h-4 w-64" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="aspect-21/9 w-full rounded-none" />
        </div>

        {/* 3-col body */}
        <div className="flex flex-col gap-y-14 lg:grid lg:grid-cols-[180px_minmax(0,1fr)_220px] lg:gap-x-10 lg:gap-y-0 xl:grid-cols-[200px_minmax(0,1fr)_240px] xl:gap-x-14">
          <aside className="hidden lg:block">
            <div className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/5" />
            <div className="py-3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          <aside className="hidden lg:block">
            <Skeleton className="h-40 w-full" />
          </aside>
        </div>
      </div>
    </div>
  )
}
