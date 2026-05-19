/**
 * End-of-feed marker rendered after the infinite-scroll observer
 * disconnects. Label is CMS-driven via `endOfFeedLabel` on the
 * Division 2 global's `contentPage` tab, with `{COUNT}` already
 * substituted in by the caller.
 */
export function ContentEndMarker({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-text-muted/20 pt-5 font-mono text-[11px] uppercase tracking-[0.35em] text-text-muted">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-[1px] bg-text-muted/60" />
      <span>{label}</span>
    </div>
  )
}
