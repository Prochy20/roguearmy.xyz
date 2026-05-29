# Phase 6 — Schema Changes

> **Handoff document.** This phase contains three items, two of which (6.1 and 6.3) require **Mongo data migrations**. **6.1 is the single highest-risk item in the entire refactor plan.** Do not attempt 6.1 without:
> 1. A verified Mongo backup
> 2. Tested migration script on a dev copy of prod data
> 3. Dual-read code in place during rollout (specified below)
> 4. A rollback plan tested end-to-end
>
> Items can be sequenced independently. Recommended order: **6.3 → 6.2 → 6.1**, smallest blast radius first.

---

## Pre-flight (mandatory)

### Required state

1. **Branch base**: assumes Phases 1, 2, 4, 5 are landed. Phase 3 is independent (different files) — can be done before, after, or in parallel.
2. **Baseline gates**:
   - `npx tsc --noEmit` — clean
   - `pnpm lint 2>&1 | grep -E "^[0-9]+:[0-9]+\s+(Error|Warning)" | wc -l` — must be ≤88
   - `pnpm test:int` — record pass count; do not regress
3. **Mongo backup BEFORE STARTING 6.1**:
   ```bash
   # From the project root, with $DATABASE_URL set:
   mkdir -p ~/backups/rga-$(date +%Y%m%d-%H%M)
   mongodump --uri="$DATABASE_URL" --out=~/backups/rga-$(date +%Y%m%d-%H%M)
   ```
   Verify the dump contains the `globals` collection with a `division2` document.
4. **Dev copy of prod data**: run the migration in dev first. If you don't have a `mongorestore` target ready, set one up before starting 6.1.

### Required project context

- `/CLAUDE.md` — Payload patterns, schema change workflow (`pnpm generate:types` after edits)
- `/AGENTS.md` — extended Payload conventions
- `~/.claude/projects/-Users-martinprochazka-ROOT-NODE-RGA-WEB/memory/MEMORY.md` — user feedback notes
- `~/.claude/plans/hazy-painting-elephant.md` — original refactor plan
- `docs/refactor/phase-3-auth-bug-fixes.md` — sibling document with project conventions section

### Critical facts to verify before starting

Run these before any 6.1 work:

```bash
# Confirm Division2 global structure
wc -l src/globals/Division2.ts          # Expected: ~1140 lines
grep -n "type: 'tabs'" src/globals/Division2.ts  # Expected: one match around line 123-126

# Confirm consumer count
grep -rln "cachedFindGlobal('division2')\|cachedFindGlobal(\"division2\")\|findGlobal.*slug.*division2" src/ | sort -u

# Confirm Payload version (migration script must match)
grep '"payload"' package.json                    # Expected: 3.69.0 or compatible
```

If any of these differ materially from what's documented below, re-read the global before proceeding.

---

## Item 6.3 — Persist `readingTime` via `beforeChange` + backfill

**Doing this first because it's the smallest, least risky schema change.**

### Why

`src/hooks/articles/calculateReadingTime.ts` is registered as `afterRead` on the Articles collection (`src/collections/Articles.ts:37`). Payload fires `afterRead` on every document returned, including bulk `find()` results. `getPublishedArticles()` returns up to 100 articles with `depth: 2`. Each triggers a full Lexical tree walk.

The `readingTime` field already exists on the schema (`src/collections/Articles.ts:58-64`) but is only computed on read, never persisted. Effectively: `readingTime` is `null` in the DB and recomputed every list query.

**Fix**: compute in `beforeChange`, persist, keep `afterRead` as a fallback for legacy null rows.

### Files

- **Modify**: `src/hooks/articles/calculateReadingTime.ts` — split into beforeChange + afterRead-fallback
- **Modify**: `src/collections/Articles.ts` — register the new beforeChange hook
- **Create**: `src/scripts/backfill-reading-time.ts` — one-shot script to populate existing docs
- **Add to**: `package.json` scripts (optional) — `"backfill:reading-time": "tsx src/scripts/backfill-reading-time.ts"`

### Read first

Read `src/hooks/articles/calculateReadingTime.ts` in full to understand the current shape. It almost certainly:

1. Walks the Lexical AST to count words
2. Divides by ~200 wpm
3. Returns the doc with `readingTime` set
4. Has special handling for wiki articles (where content comes from Outline, not Payload)

The split needs to preserve:

- Wiki handling: wiki articles have no Payload content, so `beforeChange` can't compute them. `afterRead` continues to handle wiki (or the field stays null and `lib/articles.ts` provides a default).
- Payload articles: compute once on `beforeChange`, persist, never recompute.

### Implementation

**Step 1: Split the hook**

```ts
// src/hooks/articles/calculateReadingTime.ts (restructured)

import type { CollectionAfterReadHook, CollectionBeforeChangeHook } from 'payload'

const WORDS_PER_MINUTE = 200

function countLexicalWords(content: unknown): number {
  // Existing word-count logic — extract here, used by both hooks
}

/**
 * Compute and persist readingTime on save for Payload-content articles.
 * Wiki articles (contentSource = 'wiki') are skipped here — their content
 * lives in Outline, not Payload, so we can't compute at write time.
 */
export const calculateReadingTimeBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (data?.articleContent?.contentSource === 'wiki') return data
  const content = data?.articleContent?.content
  if (!content) return data
  const words = countLexicalWords(content)
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
  return { ...data, readingTime: minutes }
}

/**
 * Fallback for documents created before the beforeChange hook landed, or
 * for wiki articles (where the body lives in Outline). For wiki articles
 * this returns a coarse estimate; consumers should treat it as best-effort.
 */
export const calculateReadingTime: CollectionAfterReadHook = ({ doc }) => {
  if (doc?.readingTime != null && doc.readingTime > 0) return doc
  if (doc?.articleContent?.contentSource === 'wiki') {
    // Wiki content not available here; return null and let consumers handle.
    return doc
  }
  const content = doc?.articleContent?.content
  if (!content) return doc
  const words = countLexicalWords(content)
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
  return { ...doc, readingTime: minutes }
}
```

**Step 2: Register both hooks in `Articles.ts`**

Read the current hooks block first. Add to `beforeChange` array (the array already has `setPublishedAt`):

```ts
import {
  calculateReadingTime,
  calculateReadingTimeBeforeChange,
} from '@/hooks/articles/calculateReadingTime'

// ...

hooks: {
  beforeValidate: [/* existing */],
  beforeChange: [setPublishedAt, calculateReadingTimeBeforeChange],
  afterChange: [revalidateArticlesAfterChange],
  afterDelete: [revalidateArticlesAfterDelete],
  afterRead: [calculateReadingTime],
},
```

**Step 3: Backfill script**

```ts
// src/scripts/backfill-reading-time.ts
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config })

  let processed = 0
  let updated = 0
  let skipped = 0
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
    })

    if (result.docs.length === 0) break

    for (const doc of result.docs) {
      processed++
      // The afterRead hook will compute on its own; just trigger a save.
      // The beforeChange hook will then persist for Payload articles.
      // Wiki articles will remain null (intentional).
      if (doc.articleContent?.contentSource === 'wiki') {
        skipped++
        continue
      }
      try {
        await payload.update({
          collection: 'articles',
          id: doc.id,
          data: {},  // No-op update; hooks compute & persist readingTime
          overrideAccess: true,
        })
        updated++
      } catch (e) {
        console.error(`Failed for ${doc.id}:`, e)
      }
    }

    if (result.docs.length < limit) break
    page++
  }

  console.log(`Backfill complete. Processed ${processed}, updated ${updated}, skipped wiki ${skipped}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

Add to `package.json`:

```json
"scripts": {
  ...
  "backfill:reading-time": "cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/backfill-reading-time.ts"
}
```

### Behavior changes (intentional)

- **Before**: `readingTime` always null in DB; computed on every read (including 100-article list queries).
- **After**: `readingTime` populated for new Payload articles on save. Existing articles get populated when the backfill script runs OR on their next save. Wiki articles continue to compute on read.
- **Perf win**: list queries skip per-doc Lexical walks for Payload articles. The `afterRead` hook returns early via the `if (doc?.readingTime != null) return doc` guard.

### Verification

**Manual:**

1. In Payload admin, edit any Payload article (don't change content) and save. Check the DB or admin field display: `readingTime` should be a non-null integer.
2. Run the backfill: `pnpm backfill:reading-time`. Check console output for processed/updated counts.
3. Query any article via the admin REST API. The `readingTime` field should be populated and not recomputed (you can verify by inspecting `afterRead` logs if instrumented).
4. Edit a wiki article in admin (set contentSource=wiki, pick an Outline doc). Save. `readingTime` should NOT be populated (afterRead handles wiki separately, returns doc unchanged if no content available).

**Automated:**

- `npx tsc --noEmit` — clean
- `pnpm lint` — ≤88
- `pnpm generate:types` — `readingTime` field already exists, no schema diff expected

### Rollback

- Remove `calculateReadingTimeBeforeChange` from `Articles.ts` hooks
- Revert the split in `calculateReadingTime.ts`
- The `readingTime` field stays in the schema (no migration needed)
- Existing populated values in the DB cause no harm

### Risk

**Low.** Only impacts when articles are saved. Reads continue to work via the afterRead fallback even if `beforeChange` is buggy. Backfill is idempotent (no-op on already-populated docs).

---

## Item 6.2 — Extract `resolveSeriesForArticle` to eliminate copy-paste

### Why

`src/lib/articles.server.ts` contains four near-identical blocks that look up which series an article belongs to:

- `getArticleBySlug` lines ~136-160
- `getArticleByTopicAndSlug` lines ~414-440
- `getArticleByTopicAndSlugWithDraft` lines ~509-538
- (and a similar block in another fetcher — find by greppign for `articles: { contains:`)

Each block: query `series` collection for documents containing `article.id`, find the article's index, build `seriesInfo` with `{ name, slug, order }`. This is ~25 LOC copy-pasted four times.

The plan considered two approaches:

- **A**: Add a reverse `series` relationship field to Articles (bi-directional). Larger refactor, schema change, requires migration.
- **B**: Extract a `resolveSeriesForArticle(payload, articleId)` resolver. No schema change. Pure dedup.

**Recommendation: B.** Cheaper, lower-risk, addresses the duplication concern. A bi-directional relationship is a worthwhile follow-up but out of scope.

### Files

- **Create**: `src/lib/series.resolver.ts`
- **Modify**: `src/lib/articles.server.ts` (4 call sites)

### Read first

```bash
grep -n "articles: { contains:" src/lib/articles.server.ts
# Expected: 4 occurrences (or however many — verify before assuming)
```

Read the surrounding context for each — they're not all character-for-character identical (depth, sort, limit may vary).

### Implementation

**Step 1: Create the resolver**

```ts
// src/lib/series.resolver.ts
import 'server-only'
import type { Payload } from 'payload'

export interface ResolvedSeriesInfo {
  name: string
  slug: string
  order: number
}

/**
 * Find which series (if any) contains the given article, and return the
 * caller-friendly `seriesInfo` shape used by article fetchers.
 *
 * Returns null when the article isn't in any series. depth=0 — we only need
 * series name/slug + the article IDs ordering to compute `order`.
 */
export async function resolveSeriesForArticle(
  payload: Payload,
  articleId: string,
): Promise<ResolvedSeriesInfo | null> {
  const seriesResult = await payload.find({
    collection: 'series',
    where: {
      articles: { contains: articleId },
    },
    depth: 0,
    limit: 1,
  })

  if (seriesResult.docs.length === 0) return null

  const series = seriesResult.docs[0]
  const articleIds = (series.articles ?? []).map((a) =>
    typeof a === 'string' ? a : a.id,
  )
  const orderIndex = articleIds.indexOf(articleId)
  if (orderIndex === -1) return null

  return {
    name: series.name,
    slug: series.slug,
    order: orderIndex + 1,
  }
}
```

**Step 2: Replace call sites in `articles.server.ts`**

For each of the four blocks, replace:

```ts
const seriesResult = await payload.find({
  collection: 'series',
  where: { articles: { contains: article.id } },
  depth: 0,
  limit: 1,
})

let seriesInfo: { name: string; slug: string; order: number } | undefined

if (seriesResult.docs.length > 0) {
  const series = seriesResult.docs[0]
  const articleIds = (series.articles || []).map((a) =>
    typeof a === 'string' ? a : a.id
  )
  const orderIndex = articleIds.indexOf(article.id)
  if (orderIndex !== -1) {
    seriesInfo = {
      name: series.name,
      slug: series.slug,
      order: orderIndex + 1,
    }
  }
}
```

with:

```ts
const seriesInfo = (await resolveSeriesForArticle(payload, article.id)) ?? undefined
```

Add the import at the top: `import { resolveSeriesForArticle } from './series.resolver'`.

### Variable name notes

- Some blocks use `article.id`, others use `rawArticle.id`. Pass the correct variable per call site.
- `seriesInfo` type — original is `{ name; slug; order } | undefined`. `resolveSeriesForArticle` returns `ResolvedSeriesInfo | null`. Use `?? undefined` to bridge.
- Existing `seriesArticleIds` usage downstream (e.g. for featured articles) is NOT affected — that data comes from `getSeriesNavigation`, not from these inline blocks.

### Behavior preservation

- The four current blocks all use `depth: 0, limit: 1` and check `orderIndex !== -1`. The resolver matches this exactly. No behavior change.
- Caching: none of the four blocks were React-cached or Next-cached. The resolver is the same. If you want to add `React.cache`, do it as a separate change (similar to `getSeriesNavigation`).

### Verification

**Manual:**

1. Load `/blog/{topic}/{slug}` for an article in a series. Verify series info renders correctly (series name, "Part X of Y").
2. Load same for an article NOT in any series. Verify no series info appears, no errors.
3. Live Preview: open Payload admin, edit an article in a series, click "Preview." Verify series nav appears in preview.

**Automated:**

- `npx tsc --noEmit` — clean
- `pnpm lint` — ≤88
- `pnpm test:int` if any test covers `getArticleBySlug` or `getArticleByTopicAndSlug`

### Rollback

- Delete `src/lib/series.resolver.ts`.
- Restore the four inline blocks in `articles.server.ts`.

### Risk

**Low.** Pure dedup. Each call site verifiable independently by reading the rendered page.

---

## Item 6.1 — Split `Division2` global into 4 (HIGHEST RISK)

> **Allocate a half-day minimum.** This is a schema split with data migration. Run on a dev copy of prod data first. Land with dual-read code (both old and new schemas active) for one prod cycle before deleting the old global.

### Why

`src/globals/Division2.ts` is 1140 lines containing 5 tabs (gate, landingPage, contentPage, escalationPage, clansPage) under a single global slug. Comment at line 108 explicitly states intent: "every new section gets its own tab inside this same global."

Problems with the monolithic shape:

- Single Mongo doc grows unbounded as features are added (manhunt, seasonal events, etc.)
- Admin form load time grows linearly with all editors who touch any Division 2 page
- TypeScript union complexity in `payload-types.ts` keeps increasing
- Per-page access control impossible (one access rule covers all sections)
- Lock contention: two editors saving different tabs collide

### Files

- **Create**: 4 new global config files
  - `src/globals/Division2Landing.ts` — landing tab content
  - `src/globals/Division2Content.ts` — content feed tab
  - `src/globals/Division2Escalation.ts` — escalation tab
  - `src/globals/Division2ClansPage.ts` — clans page tab (NB: renamed to disambiguate from the `Division2Clans` *collection* which already exists)
- **Decide & create**: gate access strategy (see below)
- **Modify**: `src/payload.config.ts` — register new globals
- **Modify**: 6 consumer pages — update `cachedFindGlobal('division2')` calls
- **Create**: `src/scripts/migrate-division2-global.ts` — one-shot Mongo migration
- **Delete (later, post-rollout)**: `src/globals/Division2.ts`

### Critical decision: shared gate vs per-global gate

The current `Division2` global has a `gate` tab containing the symbolic-role relationship that drives access. Two viable approaches:

**Option A — Per-global gate.** Each new global has its own `gate` field. Migration copies the gate value into all four docs. Future drift possible (admin could set different gates per page).

**Option B — Shared `Division2Gate` global.** Fifth new global owns the gate; the 4 page globals are gate-less. Single source of truth.

**Recommendation: B.** Single gate is the current semantic. Splitting it muddles the model.

This document specifies Option B.

### Step 1: Read & understand the current schema

```bash
# Read every tab structure
sed -n '120,$p' src/globals/Division2.ts | head -200  # First 200 lines after access
```

Map out: for each of the 5 tabs (gate, landingPage, contentPage, escalationPage, clansPage), what fields exist? Look for blocks (the clans `steps` field uses heterogeneous blocks — `CommandStepBlock`, `InstructionStepBlock`, etc.). Those block definitions MUST be preserved exactly in the new split globals.

### Step 2: Define the new globals

Create 5 new files. Each follows the same skeleton; the `fields` array contains exactly the content of the corresponding tab from the old monolith.

**Skeleton (apply to all four page globals):**

```ts
// src/globals/Division2Landing.ts (example — same pattern for the other 3)
import type { GlobalConfig } from 'payload'
import { publicRead, adminOnly } from '@/access'

export const Division2Landing: GlobalConfig = {
  slug: 'division2-landing',
  label: 'Division 2 — Landing',
  admin: {
    group: 'Division 2',
    description: 'Landing page (gate + intro + raids). Gate role is set in "Division 2 — Gate".',
  },
  access: {
    read: publicRead,
    update: adminOnly,
  },
  fields: [
    // Copy the contents of the `landingPage` tab from src/globals/Division2.ts
    // EXACTLY. Including: heroKicker, heroTitle, heroAccent, intro,
    // ribbonPrefix, raids group (with schedule array, etc.), seo group.
  ],
}
```

**Gate global:**

```ts
// src/globals/Division2Gate.ts
import type { GlobalConfig } from 'payload'
import { publicRead, adminOnly } from '@/access'

export const Division2Gate: GlobalConfig = {
  slug: 'division2-gate',
  label: 'Division 2 — Access Gate',
  admin: {
    group: 'Division 2',
    description: 'The symbolic role required to access Division 2 tools. Clearing this disables the section for all members.',
  },
  access: {
    read: publicRead,  // Pages read this to compute their gate state
    update: adminOnly,
  },
  fields: [
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'game-roles',
      // Copy the exact field config from the `gate` tab in Division2.ts
    },
  ],
}
```

**For the clans page**, the `steps` field uses heterogeneous blocks. Copy the block definitions verbatim. If they're declared inline in the old Division2.ts (as `Block` objects at the top of the file), move them to a separate file `src/globals/division2/blocks.ts` or co-locate with the new ClansPage global.

### Step 3: Register the new globals

```ts
// src/payload.config.ts
import { Division2Gate } from './globals/Division2Gate'
import { Division2Landing } from './globals/Division2Landing'
import { Division2Content } from './globals/Division2Content'
import { Division2Escalation } from './globals/Division2Escalation'
import { Division2ClansPage } from './globals/Division2ClansPage'
import { Division2 } from './globals/Division2'  // KEEP during rollout for fallback

export default buildConfig({
  // ...
  globals: [
    // ... existing globals ...
    Division2,           // KEEP during dual-read window
    Division2Gate,       // new
    Division2Landing,    // new
    Division2Content,    // new
    Division2Escalation, // new
    Division2ClansPage,  // new
  ],
})
```

### Step 4: Mongo migration script

```ts
// src/scripts/migrate-division2-global.ts
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config })

  // 1. Read the old monolith
  const old = await payload.findGlobal({ slug: 'division2' })
  if (!old) {
    console.error('division2 global not found — nothing to migrate')
    process.exit(1)
  }

  console.log('Read old division2 global. Tabs present:', {
    gate: !!old.gate,
    landingPage: !!old.landingPage,
    contentPage: !!old.contentPage,
    escalationPage: !!old.escalationPage,
    clansPage: !!old.clansPage,
  })

  // 2. Write to new globals
  if (old.gate) {
    await payload.updateGlobal({
      slug: 'division2-gate',
      data: { role: old.gate.role },
      overrideAccess: true,
    })
    console.log('✓ division2-gate written')
  }

  if (old.landingPage) {
    await payload.updateGlobal({
      slug: 'division2-landing',
      data: old.landingPage,
      overrideAccess: true,
    })
    console.log('✓ division2-landing written')
  }

  if (old.contentPage) {
    await payload.updateGlobal({
      slug: 'division2-content',
      data: old.contentPage,
      overrideAccess: true,
    })
    console.log('✓ division2-content written')
  }

  if (old.escalationPage) {
    await payload.updateGlobal({
      slug: 'division2-escalation',
      data: old.escalationPage,
      overrideAccess: true,
    })
    console.log('✓ division2-escalation written')
  }

  if (old.clansPage) {
    await payload.updateGlobal({
      slug: 'division2-clans-page',
      data: old.clansPage,
      overrideAccess: true,
    })
    console.log('✓ division2-clans-page written')
  }

  console.log('Migration complete. The old division2 global is untouched — delete it after verifying the new globals serve all pages correctly.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(2)
})
```

Add to `package.json`:

```json
"migrate:division2-global": "cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/migrate-division2-global.ts"
```

### Step 5: Update consumer pages

Identified consumers (verify with `grep -rln "cachedFindGlobal\('division2'\)" src/`):

| File | Current call | New call |
|---|---|---|
| `src/app/(frontend)/(with-chrome)/division-2/(gated)/page.tsx` | `cachedFindGlobal('division2')` | `cachedFindGlobal('division2-landing')` + separately `cachedFindGlobal('division2-gate')` |
| `src/app/(frontend)/(with-chrome)/division-2/(gated)/content/page.tsx` | same | `cachedFindGlobal('division2-content')` + gate |
| `src/app/(frontend)/(with-chrome)/division-2/(gated)/escalation/page.tsx` | same | `cachedFindGlobal('division2-escalation')` + gate |
| `src/app/(frontend)/(with-chrome)/division-2/(gated)/briefings/page.tsx` | same | gate only — briefings page reads no editorial copy (verify) |
| `src/app/(frontend)/(with-chrome)/division-2/clans/page.tsx` | same | `cachedFindGlobal('division2-clans-page')` + gate |

**Important**: each page that needs both editorial content AND the gate now makes 2 `cachedFindGlobal` calls instead of 1. Since `cachedFindGlobal` is `React.cache`-wrapped, the gate call is deduplicated within a single request (cheap).

**Pattern per page:**

```ts
// Before
const division2 = await cachedFindGlobal('division2')
const gate = division2.gate
const landingCopy = division2.landingPage

// After
const [gate, landingCopy] = await Promise.all([
  cachedFindGlobal('division2-gate'),
  cachedFindGlobal('division2-landing'),
])
```

### Step 6: Dual-read / fallback strategy (for rollout safety)

During the rollout, both schemas exist. To bridge the gap between "code shipped, new globals written" and "old global deleted":

**Approach**: ship the new globals + migration script + consumer updates in **one PR**, but DO NOT delete `src/globals/Division2.ts` yet. Land it. Run the migration in prod. Verify pages render correctly. Then a follow-up PR deletes the old global.

This gives you a clear rollback target: if anything breaks after the first PR lands, revert the consumer pages (and the script's writes are still intact, just unused).

### Step 7: Verification

**Pre-merge (dev):**

1. Run `pnpm dev`. Navigate to the 5 consumer pages. Verify each renders identically to pre-change. Use a sibling browser tab with the un-migrated code to diff visually.
2. In Payload admin, edit a string in each of the 5 new globals. Refresh the public page. Verify the change propagates.
3. Run `pnpm generate:types`. Inspect `src/payload-types.ts` — should see new interfaces for each new global, the old `Division2` interface still present.
4. `npx tsc --noEmit` — clean.
5. `pnpm lint` — ≤88.

**Migration dry-run (dev copy of prod):**

1. Restore your dev DB from the prod backup: `mongorestore --uri=$DEV_DATABASE_URL ~/backups/rga-{date}`
2. With the new code on this branch, run `pnpm migrate:division2-global`. Verify console output shows 5 ✓ marks.
3. In Mongo shell, verify: `db.globals.find({ slug: { $in: ['division2-gate', 'division2-landing', 'division2-content', 'division2-escalation', 'division2-clans-page'] } }).count()` → 5.
4. Verify field shapes match expectations: `db.globals.find({ slug: 'division2-landing' }).pretty()`.
5. Start dev server pointing at the migrated DB. Manually visit each of the 5 pages. Each must render identically to a known-good snapshot.
6. Test the admin panel: open each new global, edit a string, save. Refresh page. Change visible.
7. Verify the old global is UNTOUCHED: `db.globals.find({ slug: 'division2' }).pretty()` shows all original tabs.

**Prod rollout:**

1. Merge the PR.
2. Deploy.
3. SSH or `mongo` into prod, run the migration script via `pnpm migrate:division2-global` (in the deployed environment, not local).
4. Manually visit all 5 pages in prod. Verify rendering.
5. Have a designated editor make a no-op save on each new global. Verify saves succeed.
6. Wait one full deploy cycle (e.g. 24h) to surface any latent issues.
7. Open follow-up PR that deletes `src/globals/Division2.ts` and removes it from `payload.config.ts`.
8. Optionally: `db.globals.deleteOne({ slug: 'division2' })` to remove the old doc from Mongo. Keep it around for rollback safety until you're confident.

### Behavior changes (intentional)

- **Schema**: 1 monolithic global → 5 separate globals (4 page + 1 gate).
- **Admin UI**: editors see 5 entries under "Division 2" group instead of 1 with tabs. Faster load per entry, but more clicks to navigate. Document this in the PR description.
- **Code**: consumer pages make 2 `cachedFindGlobal` calls instead of 1 (deduped via `React.cache` per request).
- **Types**: `payload-types.ts` has new `Division2Landing`, `Division2Content`, etc. interfaces. `Division2` interface still present (until follow-up PR).
- **API contract**: `/api/payload/globals/division2-landing` etc. now exist; `/api/payload/globals/division2` still exists during dual-read window.

### Behavior preservation guarantees

- Public-facing rendering is byte-equivalent (verify with curl + diff on each page).
- Gate logic unchanged: the `role` field on `division2-gate` matches the previous `gate.role` field on `division2`.
- All field-level access rules (e.g. clans `cached_leader*` members-only) preserved by copying field definitions verbatim.

### Rollback

**During dual-read window (recommended):**

1. Revert the consumer page changes (they go back to reading `cachedFindGlobal('division2')`).
2. Old global is still in Mongo with original data.
3. New globals stay in Mongo (untouched by rollback) but no consumers; can be deleted later.

**After follow-up PR deletes old global:**

1. Restore from Mongo backup. This is why the backup is mandatory.
2. Revert the deletion PR.
3. Revert the original split PR.

### Risk

**High.** Schema split with data migration. Mitigations:

- Mandatory backup
- Dry-run on dev copy of prod data
- Dual-read window (old global preserved during rollout)
- Phased rollout (script run separately from code deploy)
- Per-page visual verification
- Follow-up cleanup PR separated from the split itself

---

## Cross-cutting concerns

### PR strategy

| Item | PR count | Sequencing |
|---|---|---|
| 6.3 | 1 (or 2 if backfill split) | Independent. Land anytime. |
| 6.2 | 1 | Independent. Land anytime. |
| 6.1 | 2 (split + delete-old-global cleanup) | Land after 6.2 and 6.3 if possible — fewer concurrent schema changes |

Recommended: 6.3 → 6.2 → 6.1 (smallest blast radius first).

### Verification matrix

| Item | tsc | lint | generate:types | int tests | e2e | Manual smoke | Mongo backup | Migration script |
|---|---|---|---|---|---|---|---|---|
| 6.3 | ✓ | ✓ | ✓ (no diff) | ✓ | — | edit + save 1 article; backfill run | optional | yes (backfill) |
| 6.2 | ✓ | ✓ | ✓ (no diff) | ✓ | — | series page renders correctly | no | no |
| 6.1 | ✓ | ✓ | ✓ (5 new interfaces) | ✓ | ✓ all 5 D2 pages | curl + diff per page | **mandatory** | **mandatory** |

### Conventions to remember (from CLAUDE.md / project memory)

- **Local API `overrideAccess`**: all `payload.find/update/create` calls in the migration script and backfill MUST pass `overrideAccess: true` (system context, no `req.user`). Documented in the script examples above.
- **Transaction safety in hooks**: hooks (none added here) calling `req.payload.*` must pass `req`. Not applicable to scripts.
- **Hook loops**: 6.3 adds a beforeChange hook. Verify it doesn't trigger another beforeChange via `payload.update` inside itself. The pattern shown above mutates `data` directly and returns — no nested call, no loop risk.
- **Lint baseline 88**: each PR must verify count is ≤88 before merge.
- **Memory: lean storybook stories**: not applicable here (no new components).
- **Memory: fail-state UI for Ashley**: not applicable (no Ashley calls added).
- **Memory: no validation scope creep**: do not add input validation to the migration script or backfill beyond what's strictly required to make them work.

### Out of scope (do not silently include)

- Bi-directional Series↔Articles relationship (deferred — would need its own migration)
- Caching of `getAllArticleSlugs` / `getAllArticleParams` (not in this phase)
- New globals beyond the 5 specified (e.g. a future "Division 2 — Manhunt" — that's a feature, not a refactor)
- Renaming `Division2Clans` collection (clans cards) — leave it; the new global is `Division2ClansPage`
- Touching the `Division2Clans` collection at all in 6.1 (it's a separate collection, not a global)
- Re-architecting `cachedFindGlobal` to do multi-global fetching in one call (not in scope; per-call is fine given `React.cache`)

---

## Appendix: file paths quick reference

```
# Reads
src/globals/Division2.ts                                                  # The monolith to split
src/lib/articles.server.ts                                                # 4 series-lookup blocks (6.2)
src/hooks/articles/calculateReadingTime.ts                                # afterRead hook (6.3)
src/collections/Articles.ts                                               # Hook registration (6.3)
src/app/(frontend)/(with-chrome)/division-2/(gated)/page.tsx              # Landing consumer
src/app/(frontend)/(with-chrome)/division-2/(gated)/content/page.tsx      # Content consumer
src/app/(frontend)/(with-chrome)/division-2/(gated)/escalation/page.tsx   # Escalation consumer
src/app/(frontend)/(with-chrome)/division-2/(gated)/briefings/page.tsx    # Briefings consumer (gate only)
src/app/(frontend)/(with-chrome)/division-2/clans/page.tsx                # Clans page consumer

# Writes / creates
src/globals/Division2Gate.ts                                              # NEW (6.1)
src/globals/Division2Landing.ts                                           # NEW (6.1)
src/globals/Division2Content.ts                                           # NEW (6.1)
src/globals/Division2Escalation.ts                                        # NEW (6.1)
src/globals/Division2ClansPage.ts                                         # NEW (6.1)
src/scripts/migrate-division2-global.ts                                   # NEW (6.1)
src/scripts/backfill-reading-time.ts                                      # NEW (6.3)
src/lib/series.resolver.ts                                                # NEW (6.2)

# Modifies
src/payload.config.ts                                                     # Register new globals (6.1)
package.json                                                              # Add migration scripts
```
