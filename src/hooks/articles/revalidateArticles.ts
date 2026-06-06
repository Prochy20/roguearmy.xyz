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

/**
 * Cascade-delete `bookmarks` and `read-progress` rows referencing the
 * deleted article by `targetId` — the relationship is stored as opaque text,
 * so Payload's built-in cascade doesn't fire.
 */
export const revalidateArticlesAfterDelete: CollectionAfterDeleteHook = async ({
  req,
  id,
}) => {
  const targetId = String(id)
  await Promise.all([
    req.payload.delete({
      collection: 'bookmarks',
      where: {
        and: [
          { targetType: { equals: 'article' } },
          { targetId: { equals: targetId } },
        ],
      },
      req,
    }),
    req.payload.delete({
      collection: 'read-progress',
      where: {
        and: [
          { targetType: { equals: 'article' } },
          { targetId: { equals: targetId } },
        ],
      },
      req,
    }),
  ])
  await bustArticlesTag()
}

export const revalidateArticlesAfterChange: CollectionAfterChangeHook = async () => {
  await bustArticlesTag()
}
