# Phase 7 — Split `briefing.server.ts`

> **Handoff document.** Pure refactor — no behavior change, no schema change, no migration. Single PR. The smallest and safest phase. Treat "no regression" as "byte-equivalent rendered output and identical exports."

---

## Pre-flight

### Required state

1. **Branch base**: assumes Phases 1, 2, 4, 5 are landed. Phases 3 and 6 are independent — can be done before, after, or in parallel.
2. **Baseline gates**:
   - `npx tsc --noEmit` — clean (no output)
   - `pnpm lint 2>&1 | grep -E "^[0-9]+:[0-9]+\s+(Error|Warning)" | wc -l` — ≤88
   - `pnpm test:int` — record pass count; do not regress
3. **No Mongo backup needed**: no schema changes.

### Required project context

- `/CLAUDE.md` — project conventions
- `~/.claude/projects/-Users-martinprochazka-ROOT-NODE-RGA-WEB/memory/MEMORY.md` — particularly:
  - `feedback_ashley_failure_ui.md` — fail-state UI pattern must remain intact (this file has Ashley DTO normalization at its core)
  - `project_ashley_digest_schedule.md` — briefings publish on Mon ~02:00 UTC; relevant if you change cache TTLs (don't)
- `~/.claude/plans/hazy-painting-elephant.md` — original plan
- `docs/refactor/phase-3-auth-bug-fixes.md` — sibling, same project-conventions section

### Critical facts to verify before starting

```bash
wc -l src/lib/division2/briefing.server.ts          # Expected: ~433 lines
grep -c "^export" src/lib/division2/briefing.server.ts   # Note the export count for verification

# Re-export shims at the bottom (the "half-done refactor" signal)
sed -n '420,433p' src/lib/division2/briefing.server.ts

# Consumer count (verify before assuming)
grep -rln "from '@/lib/division2/briefing.server'\|from \"@/lib/division2/briefing.server\"" src/

# Markdown-sections shim consumers (must be updated to import directly)
grep -rln "from '@/lib/division2/briefing.server'" src/ | xargs grep -l "promoteH1ToH2\|countMarkdownWords\|enumerateSections\|enumerateH2Sections\|injectSectionAnchors\|injectH2SectionAnchors\|SectionLevel\|EnumeratedSections" 2>/dev/null
```

---

## Why

`src/lib/division2/briefing.server.ts` is 433 LOC covering three distinct responsibilities:

1. **DTO normalization** — `normalizeBriefing`, `normalizeArticle`, `normalizeBriefingDetail`, plus `toDateKey` collapsing ISO datetimes to YYYY-MM-DD. Pure transforms. Server-only because they consume Ashley types from `schema.d.ts`.
2. **Async fetchers with caching** — `fetchBriefingById`, `fetchWeeklyBriefings`, `fetchDailyBriefingsForWeek`, `fetchRecentDailyBriefings`, `fetchRecentBriefings`. All wrapped in `unstable_cache`. The legitimate "server" surface.
3. **Formatting / parsing** — `buildBriefingDesignator`, `isoWeekNumber`, `parseWeekParam`, `isCurrentOrFuture`. Pure functions. No server-only requirement.

Plus, at the bottom (lines 420-433), re-export shims for `markdown-sections` helpers (`promoteH1ToH2`, `countMarkdownWords`, `enumerateSections`, etc.). The comment explicitly says: *"Re-exported below for back-compat — prefer importing from the new module in new code."* This is a half-finished extraction. Phase 7 finishes it.

### Architectural problem

A future contributor adding a new feature to the briefings domain has to read 433 lines and 3 unrelated concerns to find the right place to add code. The `*.server.ts` filename promises "async server-side fetchers" but the file also owns pure formatting and pure normalization. The shim re-exports add a second contradiction: the file claims to own things it actually delegates.

### Fix

- Extract DTO normalization to `briefing.normalize.ts`.
- Extract briefing-specific format helpers to `briefing.format.ts` (or merge into existing `src/lib/division2/format.ts` — see "Decision: format file consolidation" below).
- Delete re-export shims; update consumers to import `@/lib/content/markdown-sections` directly.
- `briefing.server.ts` becomes pure async fetchers (and re-exports `AshleyResult`-typed entry points). Down to ~250 LOC.

---

## Decision: format file consolidation

Two valid approaches:

**Option A — Dedicated `briefing.format.ts`.** New file holds briefing-specific formatters (`buildBriefingDesignator`, `isoWeekNumber`, `parseWeekParam`, `isCurrentOrFuture`).

- Pro: clear ownership boundary (briefing format vs generic D2 format)
- Con: more files, slight discoverability cost

**Option B — Merge into existing `src/lib/division2/format.ts`.** Existing file already holds `formatDayShort`, `weekdayShort`, `formatDayWithWeekday`, `normalizeDayIso`. Adding briefing formatters keeps generic Division 2 formatters in one place.

- Pro: fewer files; single source for "how to format D2 things"
- Con: `format.ts` grows; the briefing-specific bits get mixed with generic helpers

**Recommendation: B (merge into `format.ts`).** Adopt the existing convention — `format.ts` is already the "pure formatters" file for the Division 2 domain. Splitting "briefing" into its own format file invites the same growth pattern that created the current problem (every feature gets its own format file).

This document specifies Option B.

---

## Files

- **Create**: `src/lib/division2/briefing.normalize.ts`
- **Modify**: `src/lib/division2/format.ts` (add briefing-specific format helpers)
- **Modify**: `src/lib/division2/briefing.server.ts` (remove normalize + format + shims)
- **Modify**: consumers of the re-export shims (update import paths)
- **Verify**: consumers of `briefing.server.ts` exports still resolve (most should — only the shim consumers need updating)

---

## Step-by-step implementation

### Step 1: Read the current file in full

```bash
# Read the whole file
wc -l src/lib/division2/briefing.server.ts
```

Identify each export. Categorize each into one of three buckets:

| Bucket | Examples |
|---|---|
| **Async fetchers (stay)** | `fetchBriefingById`, `fetchWeeklyBriefings`, `fetchDailyBriefingsForWeek`, `fetchRecentBriefings`, `fetchRecentDailyBriefings` — and any type they expose (`Briefing`, `BriefingDetail`, `BriefingArticle`, etc.) |
| **DTO normalization (move to `briefing.normalize.ts`)** | `normalizeBriefing`, `normalizeArticle`, `normalizeBriefingDetail`, internal helpers like `toDateKey`, the `RawDigest` / `RawDigestList` types |
| **Format / parse (move to `format.ts`)** | `buildBriefingDesignator`, `isoWeekNumber`, `parseWeekParam`, `isCurrentOrFuture` |
| **Shims (delete)** | The bottom block re-exporting `promoteH1ToH2`, `countMarkdownWords`, `enumerateSections`, `enumerateH2Sections`, `injectSectionAnchors`, `injectH2SectionAnchors`, `SectionLevel`, `EnumeratedSections` from `@/lib/content/markdown-sections` |

**Important nuances** to verify by reading the actual file:

- Some normalize functions may be PRIVATE (not exported). Those still need to move, but as un-exported helpers in `briefing.normalize.ts`.
- The fetchers call the normalize functions internally. After the move, fetchers must import from `./briefing.normalize`.
- Types (`Briefing`, `BriefingDetail`, `BriefingArticle`) probably need to live with the normalize file OR stay in `briefing.server.ts`. **Recommendation: keep them in `briefing.server.ts`** because that's the file consumers import — types stay co-located with their public API.
- `toDateKey` may be duplicated with `normalizeDayIso` in `format.ts` (the agent review flagged this). Verify; if true, fold `toDateKey` into a single shared function. **If they ARE semantically equivalent**, name the unified version `coerceDateKey` or just keep `normalizeDayIso` and rename `toDateKey` calls.

### Step 2: Create `briefing.normalize.ts`

```ts
// src/lib/division2/briefing.normalize.ts
import 'server-only'
import type { components } from '@/lib/api/schema'
import { coerceUrl, coerceString, /* etc. */ } from './_coerce'
// Import the Briefing types from briefing.server.ts:
import type { Briefing, BriefingDetail, BriefingArticle } from './briefing.server'

// ===========================================================================
// Raw Ashley DTO shapes (consumed before normalization)
// ===========================================================================

// Copy these verbatim from briefing.server.ts:
type RawDigest = components['schemas']['DigestSummaryDto']
type RawDigestDetail = components['schemas']['DigestDetailDto']
type RawDigestList = { items: RawDigest[]; /* etc. */ }

// ===========================================================================
// Normalize functions
// ===========================================================================

/**
 * Coerce Ashley's RawDigest into the domain-typed Briefing the UI consumes.
 * ...
 */
export function normalizeBriefing(raw: RawDigest): Briefing {
  // Copy verbatim from briefing.server.ts
}

export function normalizeArticle(raw: /* whatever */): BriefingArticle {
  // Copy verbatim
}

export function normalizeBriefingDetail(raw: RawDigestDetail): BriefingDetail {
  // Copy verbatim
}

export function normalizeList(raw: RawDigestList): { items: Briefing[] } {
  // Copy verbatim if exists
}

// `toDateKey` — if this is semantically identical to `normalizeDayIso`
// in format.ts, DELETE it and use the existing one. Otherwise:
function toDateKey(iso: string): string {
  // Copy verbatim
}
```

**Cyclical import warning**: if `briefing.normalize.ts` imports types from `briefing.server.ts` AND `briefing.server.ts` imports normalize functions from `briefing.normalize.ts`, you have a cycle. Two ways to resolve:

- **A**: Move the type definitions (`Briefing`, `BriefingDetail`, `BriefingArticle`) into a third file `briefing.types.ts`. Both `.server.ts` and `.normalize.ts` import types from there.
- **B**: Move types into `briefing.normalize.ts` (since normalization defines the domain shape). `briefing.server.ts` imports types from `briefing.normalize.ts`.

**Recommendation: B** (types co-located with the normalize functions that produce them). Less file sprawl. The cycle disappears because `briefing.server.ts` only imports DOWN from normalize, not vice versa.

### Step 3: Move format helpers into `format.ts`

Read `src/lib/division2/format.ts` first to match its existing style.

```ts
// src/lib/division2/format.ts (additions; existing content unchanged)

// ===========================================================================
// Briefing-specific formatters
// ===========================================================================

/**
 * Build the human-readable briefing designator (e.g., "WK20 · 12 MAY → 18 MAY").
 * Used by the briefings list and the briefing detail header.
 */
export function buildBriefingDesignator(/* args */): string {
  // Copy verbatim from briefing.server.ts
}

/**
 * ISO week number for a given Monday-of-week date string.
 */
export function isoWeekNumber(mondayIso: string): number {
  // Copy verbatim
}

/**
 * Parse a `?week=YYYY-MM-DD` URL param. Returns null on malformed input.
 * Does NOT validate that the date is a Monday — callers can use
 * `mondayOfWeekUtc` to canonicalize.
 */
export function parseWeekParam(value: string | undefined): string | null {
  // Copy verbatim
}

/**
 * True when the given period end is today or in the future (UTC).
 * Used to choose between HOT and WARM cache TTLs.
 */
export function isCurrentOrFuture(periodEndIso: string): boolean {
  // Copy verbatim
}
```

### Step 4: Trim `briefing.server.ts`

After moves, the file should contain only:

```ts
// src/lib/division2/briefing.server.ts
import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchAshleyService } from '@/lib/api/server'
import {
  normalizeBriefing,
  normalizeBriefingDetail,
  normalizeList,
  type Briefing,
  type BriefingDetail,
  type BriefingArticle,
} from './briefing.normalize'
import {
  isCurrentOrFuture,
  // ...whatever the fetchers actually call from format.ts
} from './format'

// Re-export domain types so consumers still import from this file:
export type { Briefing, BriefingDetail, BriefingArticle }

// Cache TTLs:
const HOT_TTL = /* existing value */
const WARM_TTL = /* existing value */
const TOPIC = 'division-2'

// ===========================================================================
// Fetchers (the legitimate "server" surface)
// ===========================================================================

export async function fetchBriefingById(id: string): Promise<AshleyResult<BriefingDetail | null>> {
  // Body unchanged from current implementation; calls normalize functions
  // via import instead of from same file.
}

export function fetchWeeklyBriefings(/* ... */): Promise<AshleyResult<Briefing[]>> {
  // unchanged
}

export function fetchDailyBriefingsForWeek(/* ... */): Promise<AshleyResult<Briefing[]>> {
  // unchanged
}

export function fetchRecentDailyBriefings(/* ... */): Promise<AshleyResult<Briefing[]>> {
  // unchanged
}

export function fetchRecentBriefings(/* ... */): Promise<AshleyResult<{ weekly: Briefing | null; daily: Briefing[] }>> {
  // unchanged
}

// NB: The re-export block for `@/lib/content/markdown-sections` is REMOVED.
// Consumers must import those helpers directly from `@/lib/content/markdown-sections`.
```

### Step 5: Update shim consumers

Find any file that imports the shim'd names from `briefing.server.ts`:

```bash
grep -rln "from '@/lib/division2/briefing.server'" src/ | while read f; do
  grep -l "promoteH1ToH2\|countMarkdownWords\|enumerateSections\|enumerateH2Sections\|injectSectionAnchors\|injectH2SectionAnchors\|SectionLevel\|EnumeratedSections" "$f" && echo "  consumes shim"
done
```

For each, update the import path:

**Before:**
```ts
import { promoteH1ToH2, countMarkdownWords, type SectionLevel } from '@/lib/division2/briefing.server'
```

**After:**
```ts
import { promoteH1ToH2, countMarkdownWords, type SectionLevel } from '@/lib/content/markdown-sections'
```

If a file imports BOTH shim names AND legitimate briefing-server names, split into two import statements (one from each module).

### Step 6: Update format consumers (if needed)

If any consumer imported `buildBriefingDesignator`, `isoWeekNumber`, `parseWeekParam`, or `isCurrentOrFuture` from `briefing.server.ts`, update them to import from `./format` (or `@/lib/division2/format`).

```bash
grep -rln "from '@/lib/division2/briefing.server'" src/ | while read f; do
  grep -l "buildBriefingDesignator\|isoWeekNumber\|parseWeekParam\|isCurrentOrFuture" "$f" && echo "  consumes format helpers"
done
```

Most likely, the main consumers are inside `briefing.server.ts` itself (so already moved) and possibly a page or two. Update each.

### Step 7: Update internal normalize consumers (if any)

If `briefing.normalize.ts` functions are called from other files (not just `briefing.server.ts`), update those imports too. Most likely they're not externally consumed (they're internal to the briefing pipeline) — but verify:

```bash
grep -rn "normalizeBriefing\|normalizeBriefingDetail\|normalizeArticle\|normalizeList" src/ | grep -v "briefing.server.ts\|briefing.normalize.ts"
```

---

## Behavior preservation guarantees

This is a **pure refactor**. Verify:

- Same exports from `briefing.server.ts` — the public API surface (fetchers + types) is preserved.
- Same exports from `@/lib/content/markdown-sections` — they were always there; consumers just import directly now.
- `format.ts` gains new exports — additive, doesn't break existing consumers.
- `briefing.normalize.ts` is a new module — additive.
- No runtime behavior change. No DB change. No HTTP-shape change. No cache-key change. No TTL change.

The verification gate: rendered HTML on every briefing page must be byte-identical to pre-refactor.

---

## Verification

**Automated (gates before merge):**

- `npx tsc --noEmit` — clean. (Catches: missed import updates, type cycles.)
- `pnpm lint` — ≤88. (Catches: unused imports left behind in moved files.)
- `pnpm test:int` — same pass count as baseline.
- `pnpm generate:types` — no diff in `payload-types.ts` (this refactor doesn't touch Payload schema).

**Manual smoke (in dev, after merge):**

1. `pnpm dev`
2. Visit `/division-2/briefings`. Verify: list of recent briefings renders, layout unchanged from before.
3. Visit `/division-2/briefings?week=YYYY-MM-DD` (with a recent Monday). Verify: weekly view for that period renders.
4. Click into a briefing detail page (`/division-2/briefings/{id}`). Verify: full content + citations + related briefings render.
5. Hard-refresh each page (Cmd-Shift-R). Verify: no console errors, no missing fields.
6. Check the landing page (`/division-2/(gated)/`). Verify: the briefing panel (`BriefingPanel.tsx`) renders correctly — it consumes `Briefing` types and a daily list.

**Curl + diff (optional, for high confidence):**

```bash
# On the previous commit (pre-refactor):
curl -s http://localhost:3000/division-2/briefings > /tmp/before-list.html

# After applying Phase 7:
curl -s http://localhost:3000/division-2/briefings > /tmp/after-list.html

diff /tmp/before-list.html /tmp/after-list.html
# Expected: empty (or only differs in nonce/timestamp/build-id fields).
```

Repeat for `/division-2/briefings/{id}`.

---

## Rollback

Pure refactor — rollback is `git revert`. No data state to undo.

If the rollback is needed mid-merge (e.g. a downstream consumer broke):

1. Revert the PR.
2. The `briefing.server.ts` file returns to its 433-LOC form.
3. The new `briefing.normalize.ts` and the `format.ts` additions are gone.
4. Consumer files that updated their import paths get reverted too.

No DB cleanup, no migration to undo.

---

## Risk

**Low.** The risk profile:

- **Type cycles** (medium probability, low impact): if you put `Briefing` types in the wrong file you'll get circular imports. TypeScript will catch this at compile time. Recommendation B (types in `briefing.normalize.ts`) avoids it.
- **Forgotten consumer** (low probability, low impact): a file importing the shim'd name from `briefing.server.ts` after deletion will fail at tsc. Easy to find and fix.
- **Subtle behavior change in `toDateKey` / `normalizeDayIso` consolidation** (low probability if you keep them separate; medium if you merge them without verifying equivalence): the agent review flagged these as "semantically identical." If you merge, write a quick test that both produced the same output for ISO inputs `2026-05-29T12:34:56Z`, `2026-05-29`, `2026-05-29T00:00:00.000Z`. If unsure, leave them separate — both `briefing.normalize.ts` and `format.ts` can have their own version.

---

## Cross-cutting concerns

### PR strategy

Single PR. Phase 7 is small enough — splitting into multiple PRs adds review overhead without benefit.

If you want to land it incrementally:

1. PR-A: extract `briefing.normalize.ts`, leave format helpers in place, update internal imports. Land. Verify.
2. PR-B: move format helpers into `format.ts`. Land. Verify.
3. PR-C: delete shim block, update consumers. Land. Verify.

Each PR is independently revertible. But three PRs for ~500 lines of moves is overkill for most teams.

### Verification matrix

| Item | tsc | lint | generate:types | int tests | Manual smoke | DB | Backup |
|---|---|---|---|---|---|---|---|
| 7.1 (full) | ✓ | ✓ | ✓ (no diff) | ✓ | ✓ briefings list + detail + landing panel | no change | no |

### Conventions to remember

- **`import 'server-only'`** on every server-side file. `briefing.normalize.ts` MUST have this directive (it imports the Ashley schema and is intended for the server boundary). `format.ts` should already have it; verify.
- **No new runtime dependencies**: the new files only re-organize existing code.
- **Lint baseline 88**: a clean refactor often reduces lint count (fewer unused imports). Verify the final count is ≤88.
- **Memory: lean storybook stories** — not applicable here.
- **Memory: fail-state UI for Ashley** — preserved verbatim because the normalize functions and `AshleyResult` shape are unchanged.
- **Memory: no validation scope creep** — do not add new validation, error handling, or null-safety to the moved functions. Move them character-for-character.

---

## Out of scope (do not silently include)

- Changing TTLs on the fetchers (the agent review flagged a potential rollover race on `escalation.server.ts` — that's NOT in this file, NOT in scope for Phase 7).
- Adding `unstable_cache` to fetchers that don't currently have it (none should need it; they all do).
- Refactoring `escalation.server.ts`, `landing.server.ts`, `content.server.ts` (out of scope; consider as follow-up).
- Renaming the public API (`fetchBriefingById` → `getBriefingById`). Names stay.
- Adding tests where none exist (separate effort).
- Touching `briefing.citations.ts` (separate concern; it's already a well-shaped single-responsibility file).

---

## Appendix: file paths quick reference

```
# Reads
src/lib/division2/briefing.server.ts                  # Source file to split
src/lib/division2/format.ts                           # Target for format helpers (Option B)
src/lib/content/markdown-sections.ts                  # Existing target for shim consumers

# Writes / creates
src/lib/division2/briefing.normalize.ts               # NEW — DTO normalize + raw types + domain types

# Modifies
src/lib/division2/briefing.server.ts                  # Slim down to fetchers only
src/lib/division2/format.ts                           # Add briefing-specific format helpers
# + any consumer files identified by the grep in Step 5/6
```
