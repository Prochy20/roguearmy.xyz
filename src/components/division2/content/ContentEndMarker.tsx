/**
 * End-of-feed marker rendered after the infinite-scroll observer
 * disconnects. Label is CMS-driven via `endOfFeedLabel` on the
 * Division 2 global's `contentPage` tab, with `{COUNT}` already
 * substituted in by the caller.
 *
 * Styled as an EOT (end-of-transmission) terminator stripe — thin
 * horizontal rules flanking a mono label, in the rga-mod accent of the
 * section header. Matches the SEC_NN visual rhythm without re-using the
 * full header chrome.
 */
export function ContentEndMarker({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 pt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-rga-mod">
      <span aria-hidden className="h-px flex-1 bg-rga-mod/30" />
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-[1px] bg-rga-mod shadow-[0_0_8px_#FF8000]" />
        <span>{label}</span>
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-[1px] bg-rga-mod shadow-[0_0_8px_#FF8000]" />
      </span>
      <span aria-hidden className="h-px flex-1 bg-rga-mod/30" />
    </div>
  )
}
