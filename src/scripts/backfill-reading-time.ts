/**
 * One-shot backfill for `Article.readingTime`.
 *
 * Triggers a no-op `payload.update` on each article missing readingTime so
 * the beforeChange hook (`calculateReadingTimeBeforeChange`) computes and
 * persists the value. Wiki articles are skipped — their body lives in
 * Outline, so reading time stays null and the afterRead fallback keeps it
 * null at render time too.
 *
 * Idempotent: re-runnable safely; documents that already have a non-null
 * readingTime are not selected.
 *
 * Run: `pnpm backfill:reading-time`
 */
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config })

  let processed = 0
  let updated = 0
  let skippedWiki = 0
  let failures = 0
  let page = 1
  const limit = 50

  while (true) {
    const result = await payload.find({
      collection: 'articles',
      where: {
        or: [
          { readingTime: { exists: false } },
          { readingTime: { equals: null } },
          { readingTime: { equals: 0 } },
        ],
      },
      limit,
      page,
      depth: 0,
      overrideAccess: true,
    })

    if (result.docs.length === 0) break

    for (const doc of result.docs) {
      processed++

      if (doc.articleContent?.contentSource === 'wiki') {
        skippedWiki++
        continue
      }

      try {
        await payload.update({
          collection: 'articles',
          id: doc.id,
          data: {},
          overrideAccess: true,
        })
        updated++
      } catch (e) {
        failures++
        console.error(`[backfill] failed for ${doc.id}:`, e)
      }
    }

    if (result.docs.length < limit) break
    page++
  }

  console.log(
    `[backfill] done — processed=${processed} updated=${updated} skippedWiki=${skippedWiki} failures=${failures}`,
  )
  process.exit(failures > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('[backfill] fatal:', e)
  process.exit(2)
})
