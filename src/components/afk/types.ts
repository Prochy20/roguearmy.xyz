import type { components } from '@/lib/api/schema'

/**
 * Ashley's OpenAPI spec types `reason` and `endedAt` as `object | null`
 * (schema bug — they are nullable strings at runtime). Normalize the
 * schema type into something useful for components.
 */
export type AfkRecord = Omit<
  components['schemas']['AfkRecordResponseDto'],
  'reason' | 'endedAt'
> & {
  reason: string | null
  endedAt: string | null
}

export type AfkHistoryPage = Omit<
  components['schemas']['AfkHistoryResponseDto'],
  'items'
> & {
  items: AfkRecord[]
}

export function normalizeAfkRecord(
  raw: components['schemas']['AfkRecordResponseDto'] | null | undefined,
): AfkRecord | null {
  if (!raw) return null
  return {
    ...raw,
    reason: typeof raw.reason === 'string' ? raw.reason : null,
    endedAt: typeof raw.endedAt === 'string' ? raw.endedAt : null,
  }
}

export function normalizeAfkHistoryPage(
  raw: components['schemas']['AfkHistoryResponseDto'],
): AfkHistoryPage {
  return {
    ...raw,
    items: raw.items.map((r) => normalizeAfkRecord(r)!),
  }
}
