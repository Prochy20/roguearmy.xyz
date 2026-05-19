'use server'

import {
  fetchContentList,
  isContentSource,
  type ContentList,
} from '@/lib/division2/content.server'
import type { AshleyResult } from '@/lib/api/server'

/**
 * Server action invoked by ContentFeed's IntersectionObserver. Returns the
 * normalized batch via the same AshleyResult shape as the initial fetch,
 * so the client component can pattern-match on `error.code` and render
 * the shared FailRow on failure.
 */
export async function loadMoreContent(
  rawSource: string | undefined,
  offset: number,
  limit: number,
): Promise<AshleyResult<ContentList>> {
  const source = isContentSource(rawSource) ? rawSource : undefined
  // Reject obviously bogus offsets early — server cache key is keyed on
  // `String(offset)` so negative or non-integer values would create junk
  // cache entries.
  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, error: { code: 'invalid', status: 400 } }
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { ok: false, error: { code: 'invalid', status: 400 } }
  }
  return fetchContentList({ source, offset, limit })
}
