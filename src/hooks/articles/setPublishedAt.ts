import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Sets the publishedAt date when an article is first published.
 * Only sets the date if:
 * 1. The article is being published (status = 'published')
 * 2. The publishedAt field is not already set
 */
export const setPublishedAt: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  // Only process on create or update
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  // Check if being published and publishedAt is not already set
  const isBeingPublished = data._status === 'published'
  const wasPublished = originalDoc?._status === 'published'
  const hasPublishedAt = data.publishedAt || originalDoc?.publishedAt

  // Set publishedAt on first publish only
  if (isBeingPublished && !wasPublished && !hasPublishedAt) {
    return {
      ...data,
      publishedAt: new Date().toISOString(),
    }
  }

  return data
}
