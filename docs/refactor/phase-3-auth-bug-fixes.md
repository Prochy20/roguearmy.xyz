# Phase 3 — Auth Bug Fixes

> **Handoff document.** This phase contains five discrete bug fixes in the auth/session/middleware layer. Unlike Phases 1, 2, 4, and 5 (pure refactors), every item here **intentionally changes runtime behavior** because the current behavior is broken. Treat "no regression" as "the intended behavior now works" — not "byte-equivalent output."

---

## Pre-flight

### Required state before starting

1. **Branch base**: assumes Phases 1, 2, 4, and 5 are landed on the working branch. If not, see `docs/refactor/phase-3-auth-bug-fixes.md`'s sibling for the cumulative status. Critical dependency: **Phase 2 must be merged before 3.1** (item 3.1 was completed as a side-effect of the unified `flushPendingDiscordWrites` in Phase 2 — do not re-do it).
2. **Baseline lint count**: 88 errors/warnings, all pre-existing. Do not increase. Snapshot: `pnpm lint 2>&1 | grep -E "^[0-9]+:[0-9]+\s+(Error|Warning)" | wc -l`
3. **Baseline tsc**: clean. `npx tsc --noEmit` must produce no output.
4. **Mongo backup**: not required for Phase 3 (no schema changes). Run `mongodump` if you want extra safety.

### Required project context

Read these first — they encode invariants this phase must preserve:

- `/CLAUDE.md` — Local API security (`overrideAccess: false` when passing `user`), transaction safety, hook loops
- `/AGENTS.md` — Comprehensive Payload conventions
- `/.cursor/rules/*.md` — Topic-specific patterns (access control, hooks, etc.)
- `~/.claude/projects/-Users-martinprochazka-ROOT-NODE-RGA-WEB/memory/MEMORY.md` — User feedback notes. Especially:
  - `feedback_ashley_failure_ui.md` — never blank/generic error on Ashley failures
  - `feedback_no_validation_scope_creep.md` — implement exactly what's asked, no defensive guards
  - `feedback_no_playwright.md` — don't drive the browser via MCP for visual checks
- `~/.claude/plans/hazy-painting-elephant.md` — original refactor plan with full context

### Required tools

- `pnpm` (10.x), `node` (>=20.9.0)
- `pnpm dev` for manual smoke testing
- Optional: a Discord test account with QUARANTINE role for ban-flow verification
- Optional: a second browser/incognito for cookie scope checks

### Per-item PR strategy

**One PR per item.** Do not bundle. Each PR's behavior change should be isolated for review and easy revert.

Recommended merge order (smallest blast radius first):

1. **3.1** — `overrideAccess` fix (one line; if Phase 2 didn't merge, do this standalone)
2. **3.2** — `roleSync` thundering-herd dedup (additive; no user-facing change)
3. **3.4** — Member routes → `getMemberAuth` (mechanical; new side effect = role-sync on member API hits)
4. **3.3** — `/api/auth/logout` POST-only (callers must update first; co-located in same PR)
5. **3.5** — `Members.adminBanned` (schema change; needs `pnpm generate:types`)

---

## Item 3.1 — Fix missing `overrideAccess: true` in staff cache flush

### Status

**DONE in Phase 2.** The unified `flushPendingDiscordWrites` helper in `src/lib/discord/refreshStale.ts` always passes `overrideAccess: true`. The wrapper at `src/components/community/staff/refreshStale.ts:65` correctly delegates to it.

**Verify only.** Do not re-do.

```bash
# Confirm the fix landed
grep -n "overrideAccess" src/components/community/staff/refreshStale.ts
# Expected: line in flushStaffCacheWrites passes overrideAccess: true via flushPendingDiscordWrites
```

If Phase 2 was NOT merged, the standalone fix is:

- File: `src/components/community/staff/refreshStale.ts`
- Original: `await payload.update({ collection: 'staff-profiles', id, data })`
- Fix: add `, overrideAccess: true` to the update call, plus an explanatory comment mirroring the one in `src/components/division2/clans/refreshStale.ts`.

---

## Item 3.2 — `roleSync` thundering herd dedup

### Why

`src/lib/auth/roleSync.ts` uses `after()` for the post-result writeback (lines 102-104 and 126). Between the moment a Discord role-sync resolves and the moment the DB write completes, the `rolesSyncedAt` timestamp on the member doc is still stale. If N concurrent requests for the same member arrive in that window, all N pass `shouldAttemptSync`'s freshness gate and all N issue a separate Ashley lookup.

Under traffic bursts (e.g. social-link spike), this is a thundering herd to Ashley with no upper bound. Ashley sees N requests when 1 would suffice; the member's symbolic-role snapshot may be torn (race between writes).

**This is a defensive fix.** No user-facing change. Behavior preserved: same eventual state, same external API contract.

### Files

- **Modify**: `src/lib/auth/roleSync.ts` (only file)

### Current code (relevant region)

Read the full file first. The shape is roughly:

```ts
// src/lib/auth/roleSync.ts
export async function syncMemberRoles(/* args */): Promise<RoleSyncOutcome> {
  // 1. Decide whether to sync (TTL gate via shouldAttemptSync)
  // 2. Call createAshleyUserClient + fetch /api/community/members/me/roles
  // 3. Compute result
  // 4. after(() => payload.update(...)) — fire-and-forget writeback
  // 5. Return result
}
```

The race window is between steps 2-3 (in-flight Ashley call) and step 4 (deferred write). Multiple concurrent calls all pass step 1 because the DB still shows the old timestamp.

### Implementation

Add a module-level dedup map keyed by `memberId`. Before the Ashley call, check if there's an in-flight promise for this member; if so, await it. Otherwise create one and store it.

**Pattern (read the actual file first to match coding style and accurate signatures):**

```ts
// Top of src/lib/auth/roleSync.ts (after existing imports/constants)

// In-flight role-sync promises keyed by memberId. Collapses concurrent
// requests for the same member into a single Ashley round-trip. The map
// entry is deleted on settle (success or failure) so the next request after
// the burst takes the normal path.
//
// Module-level state survives across requests in the Node runtime; this is
// intentional — that's exactly the deduplication scope we want.
const inflight = new Map<string, Promise<RoleSyncOutcome>>()

async function syncMemberRolesUncached(/* original args */): Promise<RoleSyncOutcome> {
  // Move the entire current syncMemberRoles body here, unchanged.
}

export async function syncMemberRoles(/* original args */): Promise<RoleSyncOutcome> {
  const existing = inflight.get(memberId)
  if (existing) return existing

  const promise = syncMemberRolesUncached(/* args */)
    .finally(() => inflight.delete(memberId))
  inflight.set(memberId, promise)
  return promise
}
```

### Edge cases to verify

1. **Failure path**: if the Ashley call throws, the `.finally` still deletes the entry. Next call retries.
2. **Per-process scope**: in serverless / edge deployments with multiple Node instances, each has its own map. That's acceptable — the worst case becomes "M concurrent Ashley calls instead of N×M" where M = instance count.
3. **`after()` writeback**: still fires once per actual Ashley call. No change there.
4. **TTL gate**: the call to `shouldAttemptSync` happens inside `syncMemberRolesUncached`. The first caller passes the gate; concurrent callers get the in-flight promise without re-checking.

### Verification

**Manual (recommended):**

1. Add temporary logging at the top of `syncMemberRolesUncached`: `console.log('[roleSync] ASHLEY CALL for', memberId)`
2. Open `/division-2/(gated)` (any gated page) in 5 simultaneous browser tabs as the same logged-in user
3. Reload all 5 within 1 second
4. Expected: exactly ONE `ASHLEY CALL for ...` log line per user. Without the fix: 5 log lines.
5. Remove the temporary log.

**Automated:**

- `npx tsc --noEmit` — clean
- `pnpm lint` — count must be ≤88
- `pnpm test:int` if any test covers `roleSync` (search `tests/int/` for `roleSync` references)

### Rollback

- Delete the new `inflight` map and the wrapper; rename `syncMemberRolesUncached` back to `syncMemberRoles`. Single-file revert.

---

## Item 3.3 — `/api/auth/logout` POST-only + CSRF fix

### Why

`src/app/api/auth/logout/route.ts` currently exports both `GET` and `POST`. The GET handler clears auth cookies and revokes the Ashley session. Any HTML element that triggers a GET to this URL — `<img src="/api/auth/logout">`, `<a href="/api/auth/logout">`, a malicious `<link rel="prefetch">` — logs the visitor out. `SameSite=Lax` mitigates some cross-site triggers but not all (top-level navigations send Lax cookies).

This is a classic CSRF logout. Low impact (user just has to log in again) but trivially exploitable and a hygiene fix.

### Current callers (verified during plan phase)

```
src/app/api/auth/logout/route.ts:2  — self-reference in comment
src/app/(frontend)/auth/logout/page.tsx:5  — server-side redirect('/api/auth/logout') — sends GET
src/components/auth/AuthProvider.tsx:75  — fetch('/api/auth/logout', { method: 'POST' }) — already POST ✓
src/components/blog/BlogNavUserMenu.tsx:116  — <Link href="/auth/logout"> — GET via navigation
```

Two GET callers must change before the GET handler can be removed.

### Files

- **Modify**: `src/app/api/auth/logout/route.ts` — remove GET export
- **Modify**: `src/app/(frontend)/auth/logout/page.tsx` — replace redirect with server action
- **Modify**: `src/components/blog/BlogNavUserMenu.tsx` — replace `<Link>` with POST form/button
- **Create (recommended)**: `src/lib/auth/logout.ts` — extract logout logic so both the API route and the server action call it without HTTP self-loops
- **Verify**: `src/components/auth/AuthProvider.tsx` — already POST, no change

### Implementation

**Step 1: Extract logout logic** (avoids code duplication and HTTP self-call from the page)

Read `src/app/api/auth/logout/route.ts` for the existing `revokeAshleySession` helper and POST handler body. Move both to:

```ts
// src/lib/auth/logout.ts
import 'server-only'
import {
  clearSessionCookie,
  clearAshleyCookies,
  getAshleyAccessCookie,
} from '@/lib/auth'
import { createAshleyUserClient } from '@/lib/api/ashley-factories'

// Best-effort revoke the Ashley session, then clear local Ashley cookies.
// Always succeeds — if Ashley is unreachable, the lingering server-side
// session expires on its own TTL.
async function revokeAshleySession(): Promise<void> {
  // ... copy verbatim from the current route.ts ...
}

export async function performLogout(): Promise<void> {
  await revokeAshleySession()
  await clearSessionCookie()
  await clearAshleyCookies()
}
```

**Step 2: Convert the route handler** (POST only, calls the shared helper)

```ts
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { performLogout } from '@/lib/auth/logout'

export async function POST() {
  await performLogout()
  return NextResponse.json({ ok: true })
}

// GET handler REMOVED — was CSRF surface, see docs/refactor/phase-3-auth-bug-fixes.md
```

**Step 3: Convert the logout page to a server action**

```tsx
// src/app/(frontend)/auth/logout/page.tsx
import { redirect } from 'next/navigation'
import { performLogout } from '@/lib/auth/logout'

export default async function LogoutPage() {
  await performLogout()
  redirect('/')
}
```

This is a server component. Navigating to `/auth/logout` server-side calls `performLogout()` then redirects. No HTTP self-call. No CSRF surface (the redirect is a navigation, not a state-mutating GET to an API endpoint).

**Step 4: Update the nav menu link**

```tsx
// src/components/blog/BlogNavUserMenu.tsx
// Replace the <Link href="/auth/logout"> with a button that calls the API.
// Read the current implementation first — it's inside a dropdown menu, so
// the right replacement is likely a <button onClick={...}> that calls
// fetch('/api/auth/logout', { method: 'POST' }) then router.push('/').
```

The existing `AuthProvider` already has a logout helper that does this — check if you can reuse it instead of inlining `fetch`.

### Behavior changes (intentional)

- **Before**: `<a href="/auth/logout">` / `<img src="/api/auth/logout">` / any GET to `/api/auth/logout` logs the user out.
- **After**: Logout requires a POST or a deliberate navigation to `/auth/logout` (which is a page render, not a state-mutating endpoint).
- **Side effect**: any bookmark or external link pointing directly to `/api/auth/logout` will return 405 Method Not Allowed (or 404). The user-facing `/auth/logout` page still works for both link clicks and bookmarks.

### Verification

**Manual (required — auth flow):**

1. Log in via Discord OAuth as a test user.
2. Click logout from the blog nav user menu. Expect: redirected, no longer authenticated. ✓
3. Navigate directly to `/auth/logout`. Expect: redirected to `/`, no longer authenticated. ✓
4. From an authenticated session, run in dev tools: `fetch('/api/auth/logout', { method: 'POST' })`. Expect: 200 OK, cookies cleared on next request. ✓
5. From an authenticated session, run: `fetch('/api/auth/logout')`. Expect: 405 (or whatever Next returns for missing method). User remains logged in. ✓
6. In a second tab, embed `<img src="/api/auth/logout">` from a static HTML file. Expect: image fails to load, user remains logged in. ✓

**Automated:**

- `npx tsc --noEmit` — clean
- `pnpm lint` — ≤88
- e2e if available: `pnpm test:e2e` (look for `auth/logout` tests)

### Rollback

- Restore GET handler to `src/app/api/auth/logout/route.ts`
- Revert the page and nav menu changes
- Optionally keep `src/lib/auth/logout.ts` (it's a clean extraction even without the POST-only change)

---

## Item 3.4 — Migrate member routes to `getMemberAuth`

### Why

`src/app/api/member/bookmarks/route.ts` and `src/app/api/member/read-progress/route.ts` each roll their own auth: `getSessionCookie()` → `verifyMemberToken()` → manual `payload.findByID(member)`. This bypasses `getMemberAuth`, the canonical session resolver that adds:

- `React.cache` dedup across same-request calls
- **Role sync side effect**: refresh the member's symbolic-role snapshot from Ashley if past TTL
- Status normalization (`active` / `banned` / `left_server`)

Consequence: a banned member who triggers a bookmark POST will continue to succeed indefinitely because the route never re-checks status from Ashley. The bookmark/progress endpoints become a back-door for quarantined members.

This is a **bug fix**. After the change, member routes correctly enforce quarantine state.

### Files

- **Modify**: `src/app/api/member/bookmarks/route.ts` (3× auth blocks)
- **Modify**: `src/app/api/member/read-progress/route.ts` (2× auth blocks)
- **Optional defer**: `src/app/api/outline/documents/[id]/route.ts` (uses *optional* auth — lower priority)
- **Optional defer**: `src/app/(frontend)/(with-chrome)/blog/history/page.tsx:27` (server component, not a route handler — already works correctly)

### Current pattern (in each handler)

```ts
import { getSessionCookie, verifyMemberToken } from '@/lib/auth'

export async function GET() {
  const token = await getSessionCookie()
  if (!token) return Response.json({ error: 'Unauthenticated' }, { status: 401 })

  const session = await verifyMemberToken(token)
  if (!session) return Response.json({ error: 'Invalid token' }, { status: 401 })

  // ... handler logic uses session.memberId ...
}
```

### Replacement pattern

```ts
import { NextResponse } from 'next/server'
import { getMemberAuth } from '@/lib/auth/session.server'

export async function GET() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    return NextResponse.json(
      { error: 'Unauthenticated', reason: auth.reason ?? 'no_session' },
      { status: 401 },
    )
  }

  // Optional: also reject quarantined members explicitly
  if (auth.member.status === 'banned') {
    return NextResponse.json(
      { error: 'Account quarantined' },
      { status: 403 },
    )
  }

  const memberId = auth.memberId
  // ... handler logic uses memberId ...
}
```

### Implementation notes

1. **Read both route files first.** Each has multiple HTTP method handlers (GET + POST + DELETE etc.) — each one needs the same replacement.
2. **`auth.memberId` is the canonical member ID** (was `session.memberId` before — same value, different source).
3. **Quarantine check is optional.** `getMemberAuth` includes role-sync as a side effect; if quarantined, `auth.member.status === 'banned'` after the sync. The explicit `=== 'banned'` check adds a 403 response for clarity; without it, the route just works (the previous-bookmarked items belong to a banned member who can no longer create new ones... actually wait, the old behavior returned the bookmark/progress data anyway because `verifyMemberToken` didn't sync. Adding the explicit check is the intended behavior. Add it.).
4. **No need to import `verifyMemberToken` or `getSessionCookie` anymore** in the modified files. Clean up unused imports.

### Behavior changes (intentional)

- **Before**: a banned member could POST bookmarks indefinitely. Read-progress writes succeeded for banned members.
- **After**: banned members hit 403 on member API routes. Their existing bookmarks stay in DB.
- **Latency**: each member API call now triggers `getMemberAuth`, which runs role-sync past TTL. Cold-path latency may increase by one Ashley round trip (~50-200ms). Subsequent calls within the request share the result via `React.cache`. Subsequent requests within the TTL window (5 min success / 60s failure) use the cached snapshot.
- **Side effect**: bookmark/progress endpoints now silently refresh the member's role snapshot in the background. Member docs see updated `rolesSyncedAt` more often.

### Verification

**Manual (required — auth side effect):**

1. Test member: get a valid Discord OAuth session.
2. POST `/api/member/bookmarks` with a valid `articleId`. Expect: 200 OK, bookmark created. ✓
3. Apply the Discord QUARANTINE role to the test member via the bot or admin.
4. Wait > 60s (failed-sync TTL) or > 5min (successful-sync TTL) to ensure the sync runs.
5. POST `/api/member/bookmarks` again. Expect: 403 Forbidden, "Account quarantined". ✓
6. Remove the QUARANTINE role. Wait the TTL. POST again. Expect: 200 OK. ✓

**Automated:**

- `npx tsc --noEmit` — clean
- `pnpm lint` — ≤88
- p95 latency measurement on `/api/member/bookmarks` before and after — expect a modest increase on cold-path (acceptable; warm-path unchanged)

### Rollback

- Revert each file individually. Each is independent; the rollback is safe even if other Phase 3 items have shipped.

---

## Item 3.5 — Make `Members.status` truthful (add `adminBanned`)

### Why

`src/collections/Members.ts:175` documents — in the admin panel description — that the `status` field is "Auto-managed by role sync... Manual edits will be overwritten on the next page load." This is a UX lie: the admin panel exposes a writable `status` field that gets clobbered.

`src/lib/auth/roleSync.ts:165` `computeStatusOverride` confirms: any admin-set `banned` status without a corresponding Discord QUARANTINE role gets reverted to `active` on the next page load.

**Consequence**: moderation via the Payload admin panel is impossible without also applying the Discord QUARANTINE role on the bot side. The admin UI suggests it should work; it does not.

This is a **bug fix**. Two viable approaches; recommendation is option B (additive, no migration required).

### Approach options

**Option A — Make `status` read-only.**

- Pro: smallest change. Existing schema unchanged.
- Con: admins lose any moderation surface in Payload; must use Discord.
- Migration: none.

**Option B — Add `adminBanned: boolean` honored by `computeStatusOverride`.** ✅ Recommended.

- Pro: additive (no data migration). Expresses intent. Auto-managed status preserved. Admins get a real ban switch.
- Con: two fields (one auto-managed, one admin-controlled) — admin UI needs clear labeling.
- Migration: schema change only (no data migration); regenerate types.

This document specifies Option B.

### Files

- **Modify**: `src/collections/Members.ts` — add field, update description on `status`
- **Modify**: `src/lib/auth/roleSync.ts` — honor `adminBanned` in `computeStatusOverride`
- **Regenerate**: `src/payload-types.ts` — run `pnpm generate:types`; commit the diff

### Schema addition

Read `src/collections/Members.ts` first to understand the field layout. Add after the `status` field:

```ts
{
  name: 'adminBanned',
  type: 'checkbox',
  defaultValue: false,
  access: {
    // Only admins can flip this; reads gated by collection-level access.
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    description:
      'Hard ban applied by an admin. When true, the member is banned regardless of Discord role state. Use this to ban a member who has not yet been quarantined on Discord, or to keep someone banned even if their Discord role is removed.',
  },
},
```

Also update the description on the existing `status` field to clarify it's read-only:

```ts
// Existing status field, update description:
admin: {
  description:
    'Auto-managed read-only field. Reflects DISCORD_ROLE_QUARANTINE state OR the `adminBanned` flag below. Do not edit directly — set `adminBanned` instead to ban a member from the admin panel.',
  readOnly: true,  // ADD THIS
},
```

### `roleSync` change

Read `src/lib/auth/roleSync.ts` first. Find `computeStatusOverride` (around line 165). Current shape:

```ts
function computeStatusOverride(
  fetched: { /* ashley roles */ },
  currentStatus: 'active' | 'banned' | 'left_server',
): 'active' | 'banned' | 'left_server' {
  // ... existing logic based on QUARANTINE role and currentStatus ...
}
```

Add `member` (or `adminBanned`) as a parameter, then check it first:

```ts
function computeStatusOverride(
  fetched: { /* ashley roles */ },
  currentStatus: 'active' | 'banned' | 'left_server',
  adminBanned: boolean,  // NEW
): 'active' | 'banned' | 'left_server' {
  // Admin ban takes precedence over auto-managed role state.
  if (adminBanned) return 'banned'
  // ... existing logic ...
}
```

Update the call site (line 120 area) to pass the new field. The snapshot object should already have access to the member's full record — look for `snapshot.status` and add `snapshot.adminBanned` alongside.

### Behavior changes (intentional)

- **Before**: setting `status = 'banned'` in admin panel = no effect (gets reverted).
- **After**: setting `adminBanned = true` in admin panel = member is banned (reflected in `status` via override, enforced on next page load).
- **Backwards compat**: existing members with `status = 'banned'` from QUARANTINE role keep working. The auto-managed flow is unchanged.
- **Status display**: the read-only `status` field now shows `'banned'` when *either* QUARANTINE role is present OR `adminBanned=true`. Admins can see both signals (the underlying field state) and the effective state (status).

### Verification

**Manual (required):**

1. Pick a test member who is `status=active`, `adminBanned=false`.
2. In Payload admin, set `adminBanned=true`. Save.
3. Reload `/division-2/(gated)` page as that member (or hit any auth-gated endpoint). Expect: 403 / redirect to denial page. ✓
4. Set `adminBanned=false`. Save.
5. Reload as that member. Expect: access restored. ✓
6. Separately: apply Discord QUARANTINE role to a different test member. Expect: `status='banned'` automatically (existing behavior preserved). ✓
7. With QUARANTINE on, also set `adminBanned=true`. Remove QUARANTINE. Expect: still banned (admin override wins). ✓
8. Set `adminBanned=false`, QUARANTINE off. Expect: active. ✓

**Automated:**

- `pnpm generate:types` — must complete cleanly; `src/payload-types.ts` will gain the `adminBanned` field on `Member` interface
- `npx tsc --noEmit` — clean (caller of `computeStatusOverride` must pass the new arg)
- `pnpm lint` — ≤88
- `pnpm test:int` — re-run if any test covers `roleSync` or member status

### Rollback

- Set `adminBanned=false` on all members (or just on whoever has it set).
- Remove the field from `Members.ts`.
- Revert `computeStatusOverride` change.
- Run `pnpm generate:types`.
- Existing `status` values are unchanged because the field was never user-editable in practice.

### Migration note

No Mongo migration required. New field defaults to `false`. Existing docs without the field will be treated as `adminBanned=false` (Payload's default-value handling on read).

---

## Cross-cutting verification matrix

| Item | tsc | lint | int tests | e2e (auth) | Manual smoke | DB integrity |
|---|---|---|---|---|---|---|
| 3.1 (Phase 2) | ✓ | ✓ | ✓ | — | staff page TTL refresh | ✓ (cached_* written) |
| 3.2 | ✓ | ✓ | ✓ | — | concurrent gated-page burst log | — |
| 3.3 | ✓ | ✓ | ✓ | ✓ (logout from nav, page, API POST/GET) | logout from all 3 paths | — |
| 3.4 | ✓ | ✓ | ✓ | ✓ (member API while banned) | quarantine test member | — |
| 3.5 | ✓ | ✓ | ✓ | ✓ (adminBanned set/unset) | admin panel flip | adminBanned field present |

Run after each PR; do not batch.

---

## Risks and project conventions to remember

- **CLAUDE.md `overrideAccess` rule**: when passing `user` to Local API, ALWAYS set `overrideAccess: false`. None of these items add new Local API calls, but if you find yourself adding one as part of an extracted helper, honor this.
- **CLAUDE.md transaction safety**: hooks calling `req.payload.*` must pass `req`. The `revokeAshleySession` extraction in 3.3 is not a hook — no transaction concern.
- **CLAUDE.md hook loops**: 3.5 modifies the Members collection but adds a *field*, not a hook. No loop risk.
- **`fail-state UI` memory**: 3.4 returns 401/403 JSON responses. Confirm the client-side `AuthProvider` and member-API consumers (BookmarksProvider) handle 403 distinctly from 401 — e.g., 401 prompts re-login, 403 shows "account suspended."
- **`no validation scope creep` memory**: the quarantine check in 3.4 is in-scope (it's the bug being fixed). Don't add input validation, body schema checks, or other defensive guards beyond what's spec'd here.
- **Lint baseline 88**: any of these PRs that crosses 88 must explain what increased and fix it.

---

## Out-of-scope (do not silently include)

- Token rotation / refresh-token strategy changes
- Adding tests where none exist (separate effort)
- Modifying the Discord OAuth flow (`discord-callback/route.ts`)
- Changing the `MemberSession` type or the wire shape of `/api/auth/me` (separate concern)
- Splitting `roleGate.types.ts` and `auth/types.ts` (already correctly separated per Phase 0 review)
- Member-self-read scoping on `/api/member/*` (currently admin-gated by `getMemberAuth` returning the caller's own member only — no need to add per-member access logic)
