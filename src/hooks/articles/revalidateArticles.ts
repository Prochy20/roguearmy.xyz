import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Bust the `articles` cache tag after any article CRUD so editors see fresh
 * data on the public site immediately rather than waiting for the 5-min TTL.
 *
 * `next/cache` is dynamically imported because Payload's importmap generator
 * loads collection configs outside a server-component context, and a
 * top-level import of `next/cache` would break that pass.
 */
async function bustArticlesTag(): Promise<void> {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('articles')
}

export const revalidateArticlesAfterChange: CollectionAfterChangeHook = async () => {
  await bustArticlesTag()
}

export const revalidateArticlesAfterDelete: CollectionAfterDeleteHook = async () => {
  await bustArticlesTag()
}
