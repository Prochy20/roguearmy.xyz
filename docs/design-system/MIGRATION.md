# Design System Color Migration — Handover

**Status (as of 2026-06-03):** Phase 0 + Phase 1 complete. Phase 2 next.

This document is a working tracker for the multi-phase migration to the
unified RGA color system. Delete this file when Phase 4 ships.

---

## TL;DR

We're moving from a single overloaded color vocabulary (where green meant
"brand + status + decoration + active state" all at once) to a **two-layer
token system** with clear semantic aliases.

- **Layer 1** = raw brand hexes (`rga-green`, `rga-yellow`, `rga-orange`, etc.)
- **Layer 2** = semantic aliases (`status-warn`, `game-d2`, `role-mod`, etc.)
- **Behavioral split**: chrome (StatRibbon, nav) stays RGA-neutral always;
  body (page content under `/division-2/*`) wears `game-d2` orange.

Phase 0 added new tokens additively + foundation docs (Storybook + /brand
page). Phase 1 refactored StatRibbon API to three-mode pill (info / warn /
error) and migrated all 11 callsites. Phases 2-4 rename raw tokens, clean
up game-d2 references in D2 body components, rename staff role tokens,
and finalize docs.

---

## Architecture recap

### Layer 1 — raw palette (in `src/app/globals.css` `@theme` block)

| Current token | Hex | New name (Phase 2-3) | Notes |
|---|---|---|---|
| `rga-green` | `#00FF41` | `rga-green` (unchanged) | RGA brand identity |
| `rga-cyan` | `#00FFFF` | `rga-cyan` (unchanged) | "Alternative voice" — no semantic alias |
| `rga-mod` | `#FF8000` | `rga-orange` | Rename — currently means "moderator role" semantically; actually used as D2 brand + freq + mod role |
| `rga-dev` | `#CCFF00` | `rga-chartreuse` | Rename — only used for staff dev role |
| `rga-yellow` (NEW) | `#FFE100` | `rga-yellow` | Hazard Yellow — `status-warn` |
| `rga-admin` | `#FF0066` | `rga-rose` | Rename — used as `status-error` + admin role |
| `rga-magenta` | `#FF00FF` | `rga-magenta` (unchanged) | Decorative only (RGB-shift glitch, chromatic effects). No longer failure pill. |

### Layer 2 — semantic aliases (in `globals.css` `@theme inline` block)

These exist NOW (Phase 0 added them). Components reference these
instead of raw tokens whenever a semantic exists.

```css
--color-brand:         var(--color-rga-green);
--color-status-ok:     var(--color-rga-green);
--color-status-warn:   var(--color-rga-yellow);
--color-status-error:  var(--color-rga-admin);   /* will → rga-rose in Phase 3 */
--color-status-info:   oklch(0.65 0 0);          /* muted gray */
--color-game-d2:       var(--color-rga-mod);     /* will → rga-orange in Phase 2 */
--color-role-dev:      var(--color-rga-dev);     /* will → rga-chartreuse in Phase 3 */
--color-role-mod:      var(--color-rga-mod);     /* will → rga-orange in Phase 3 */
--color-role-admin:    var(--color-rga-admin);   /* will → rga-rose in Phase 3 */
```

Same hex can back multiple aliases — `role-mod` and `game-d2` both
resolve to `#FF8000`. This works because the surfaces don't coexist on
one screen (mod cards are `/community/staff/*`, D2 stuff is
`/division-2/*`).

### Behavioral rules

1. **Chrome layer** (StatRibbon, nav, MENU button) = always RGA-neutral.
   Uses `brand` (green), `status-*`, `status-info` (muted), white text.
   Never takes game color, regardless of URL section.
2. **Body layer** = wears `game-*` based on URL. `/division-2/*` body
   content (titles, section corners, mission rows) uses `game-d2`
   (orange).
3. **Status pill** (chrome) = always visible, two visual modes:
   - **info** (default): muted gray + static dot. For TODAY, VIEWING, LIVE, PUBLIC, etc.
   - **warn/error** (attention): yellow/rose + pulse. For STALE, MEMBERS-ONLY, LOCKED, OFFLINE.
4. **Ribbon fields** = neutral white by default. Color only when value
   is itself a status. Cyan accent preserved for organic uses
   (Ashley-output identifiers, computed insight).
5. **Magenta** = decorative/glitch only. No longer failure pill.

---

## Phase status

### ✅ Phase 0 — Foundation (additive)
**Commits this covers:** all globals.css + design-tokens.ts + Storybook MDX + /brand page extension + Brand Book metadata layout

Files touched:
- `src/app/globals.css` — added `rga-yellow` raw token, yellow/rose/chartreuse glow rgba, full Layer 2 alias block in `@theme inline`
- `src/lib/design-tokens.ts` — added `EXTENDED_PALETTE`, `SEMANTIC_TOKENS`, `STATUS_PILL_MODES` exports; expanded `GLOW_COLORS`
- `src/stories/brand/Colors.mdx` — rewrote to document Layer 1+2, status pill modes, chrome vs body
- `src/app/(internal)/brand/page.tsx` — added Extended Palette, Semantic Aliases table, Status Pill mockup, Chrome vs Body mockup sections (real JSX visual mockup, not ASCII)
- `src/app/(internal)/brand/layout.tsx` — NEW file; sets `<title>Brand Book | Rogue Army</title>`

Validation: `tsc --noEmit` + `pnpm lint` clean. No production component touched yet.

### ✅ Phase 1 — StatRibbon API + chrome pill behavior
Files touched:
- `src/components/ui/StatRibbon.tsx` — new pill API `{ text, mode: 'info' | 'warn' | 'error' }`; dropped `'mod'` and `'magenta'` from field and trail accent vocabulary (only `'green' | 'cyan'` remain)
- `src/components/ui/StatRibbon.stories.tsx` — refresh; new `PillWarn`, `PillError`, `WithTrailBriefingMembers` stories
- `src/components/division2/escalation/EscalationPage.tsx`
- `src/components/division2/content/ContentPage.tsx`
- `src/components/division2/landing/CommandConsolePage.tsx`
- `src/components/division2/clans/ClansPage.tsx`
- `src/components/division2/briefings/BriefingsPage.tsx`
- `src/components/division2/briefings/BriefingDetailPage.tsx`
- `src/components/division2/briefings/BriefingTeaserView.tsx`
- `src/components/article/ArticleDetailPage.tsx`
- `src/components/community/Hero.tsx`
- `src/app/(frontend)/(with-chrome)/manifesto/ManifestoHeader.tsx`
- `src/components/community/staff/StaffManifestHeader.tsx`
- `src/components/content/reader/ReaderPageShell.stories.tsx` — story file, was using old API

Behavioral changes visible in production after Phase 1:
- All "default OK" green pills (VIEWING, TODAY, LIVE, PUBLIC, RECRUITING, OPERATIONAL, RATIFIED, UNLOCKED) → muted gray + static dot
- STALE pill → yellow + pulse (was generic "fail magenta")
- OFFLINE pill → rose + pulse (was magenta)
- MEMBERS pill (article detail) → yellow + pulse (was magenta)
- Briefing detail pill → tier label `BOOSTER` (daily) / `MEMBER` (weekly), mode warn if user is gated out else info; teaser (locked out) shows the same tier label in error mode (was `LOCKED magenta`). The pill now names *which* tier the briefing requires instead of an abstract gate state.
- Decorative green field accents (MISSIONS, SOURCE, MODE, ITEMS, STANDARDS, ACCESS, WEEK, FILES, MEMBERS, RECORDS, VERSION, etc.) → plain white text
- Cyan field accents preserved (JOINED · 14D in community Hero, SYNCED in staff manifest)
- Daily briefing leaf accent dropped (was orange, now neutral); weekly stays cyan

Validation: `tsc --noEmit` + `pnpm lint` clean.

### ⏳ Phase 2 — D2 game-d2 rename (body components)

**Goal:** Rename `rga-mod` → `rga-orange` in raw palette; migrate D2 body
components from `text-rga-mod` to `text-game-d2` (semantic alias).

**Scope:**

1. `src/app/globals.css`:
   - Rename raw token: `--color-rga-mod` → `--color-rga-orange` (same hex `#FF8000`)
   - Keep `--color-rga-mod: var(--color-rga-orange)` as deprecated alias for ~1 phase (Phase 4 removes)
   - Update Layer 2 reference: `--color-game-d2: var(--color-rga-orange)` (was `var(--color-rga-mod)`)
   - Update `--color-role-mod: var(--color-rga-orange)` too
   - Update glow var `--color-glow-orange` already exists, no change needed; but `shadow-[0_0_8px_#FF8000]` literal hexes in components stay untouched (literal value, not token)

2. Find/replace in `src/components/division2/**`:
   - `text-rga-mod` → `text-game-d2`
   - `border-rga-mod` → `border-game-d2`
   - `bg-rga-mod` → `bg-game-d2`
   - `from-rga-mod`, `via-rga-mod`, `to-rga-mod` → `from-game-d2`, etc.
   - `text-glow-orange` (if any) — unchanged
   - Inline hex `#FF8000`, `#ff8000` — unchanged (literal values in `shadow-[0_0_8px_#FF8000]`)

3. **Files dotčené (verified via grep on 2026-06-03):**
   - `src/components/division2/landing/LootStripPanel.tsx`
   - `src/components/division2/landing/IntelFeedPanel.tsx`
   - `src/components/division2/landing/BriefingPanel.tsx`
   - `src/components/division2/landing/CommandConsolePage.tsx` (only line 190, 193 — the body Spinner/icon area; chrome ribbon already migrated in Phase 1)
   - `src/components/division2/content/ContentPage.tsx`
   - `src/components/division2/content/ContentFilterChips.tsx`
   - `src/components/division2/content/ContentEndMarker.tsx`
   - `src/components/division2/briefings/BriefingHero.tsx`
   - `src/components/division2/briefings/BriefingSources.tsx`
   - `src/components/division2/briefings/BriefingDetailPage.tsx` (line ~283, body content — chrome already done)
   - `src/components/ui/CyberCorners.tsx` (has `rga-mod` accent variant — usage in D2 body)

4. Re-verify after migration: `grep -rn "rga-mod" src/components/division2 src/components/ui` should return zero hits (except possibly in comments).

**Risk:** Visually zero (same hex). Risk = missed find/replace = mix of old and new classes during dev. Mitigate by grep at the end.

**Validation:** Click through `/division-2/escalation`, `/division-2/briefings/daily/<latest>`, `/division-2/content`, `/division-2/landing` — body content should look IDENTICAL to before.

**Suggested commit:** `refactor(d2): rename rga-mod to game-d2 across division2 components`

### ⏳ Phase 3 — Staff role + admin/dev rename

**Goal:** Rename `rga-dev` → `rga-chartreuse` and `rga-admin` → `rga-rose`
raw tokens; migrate staff cards to `role-*` semantic aliases.

**Scope:**

1. `src/app/globals.css`:
   - Rename: `--color-rga-dev` → `--color-rga-chartreuse`
   - Rename: `--color-rga-admin` → `--color-rga-rose`
   - Keep deprecated aliases for one phase
   - Update Layer 2 refs (`role-dev`, `role-admin`, `status-error`)
   - **Also rename `rga-mod` if not done in Phase 2.** (Same token, three semantic uses — Phase 2 does the rename and Phase 3 just adds `role-mod` migration)

2. Find/replace in `src/components/community/staff/**`:
   - `text-rga-dev|admin|mod` → `text-role-dev|admin|mod`
   - `border-rga-dev|admin|mod` → `border-role-*`
   - `bg-rga-dev|admin|mod` → `bg-role-*`
   - Same for gradient `from-/via-/to-`, plus opacity suffixes (`/15`, `/25`, etc.)

3. Files dotčené:
   - `src/components/community/staff/StaffCard.tsx` (heavy — multiple maps)
   - `src/components/community/staff/StaffPortrait.tsx`
   - `src/components/community/staff/utils.ts` — `ACCENT_RGB` map keys stay (`dev`/`admin`/`mod`), just add comment that these alias `role-*` tokens

4. Grep verify: `grep -rn "rga-dev\|rga-admin" src/components` should return zero (except deprecated alias in globals.css).

**Risk:** Visually zero.

**Suggested commit:** `refactor(staff): rename role tokens to role-{dev,mod,admin}`

### ⏳ Phase 4 — Cleanup + finalize docs

**Goal:** Remove deprecated raw token aliases, audit magenta usage,
update docs.

**Scope:**

1. Final grep verification:
   - `grep -rn "rga-mod\|rga-dev\|rga-admin" src/components src/app` — should be ZERO
   - `grep -rn "accent.*magenta" src/components src/app --include="*.tsx"` — should only return decorative uses (gradients, chromatic effects), NO StatRibbon pills

2. Remove deprecated aliases from `src/app/globals.css`:
   ```css
   /* DELETE these lines: */
   --color-rga-mod: var(--color-rga-orange);
   --color-rga-dev: var(--color-rga-chartreuse);
   --color-rga-admin: var(--color-rga-rose);
   ```

3. Audit decorative magenta usage. Should remain in:
   - `globals.css` `@keyframes rgb-shift` (text-shadow magenta)
   - `globals.css` `.text-chromatic` utility
   - `globals.css` gradient utilities (`text-gradient-rga`)
   - Component RGB-shift effects (HeroGlitch, ChromaticText, etc.)

4. Update `docs/design-system/COLORS.md` — currently says
   "Magenta — tertiary accent for warnings". Rewrite to reflect new
   architecture (Layer 1 + Layer 2 + chrome vs body + status pill modes).
   Keep this MIGRATION.md file pointed-to from COLORS.md if useful, or
   delete this MIGRATION.md once docs are aligned.

5. Update `src/lib/design-tokens.ts` `EXTENDED_PALETTE` entries to use
   new Tailwind class names (`rga-orange` not `rga-mod`, etc.). Same for
   `SEMANTIC_TOKENS` `layer1` field.

6. Final memory update: update `project_design_system_colors.md` in
   `~/.claude/projects/-Users-martinprochazka-ROOT-NODE-RGA-WEB/memory/`
   to mark as "implemented" and remove the "PRE-state" caveat.

7. Update `src/stories/brand/Colors.mdx` if needed to reflect final
   token names.

8. Delete this MIGRATION.md file.

**Risk:** Zero. Removing deprecated aliases will only break if Phase 2/3
missed a callsite — grep before deletion catches it.

**Suggested commit:** `chore(design-system): drop deprecated tokens, finalize docs`

---

## How to continue (for fresh Claude session)

1. **Read this file first** for migration state.
2. **Read `~/.claude/projects/-Users-martinprochazka-ROOT-NODE-RGA-WEB/memory/project_design_system_colors.md`** for design rationale.
3. **Read `src/app/globals.css`** to see current token state (Layer 1 + Layer 2).
4. **Read `src/components/ui/StatRibbon.tsx`** to see the new pill API shape.
5. Visit `/brand` (after `pnpm dev`) and the Storybook `Brand/Colors`
   page to see the design system in action.

When ready to start the next phase, just say "Phase 2" (or 3, or 4) — all
scope is documented above.

---

## Gotchas / non-obvious context

- **`shadow-[0_0_8px_#FF8000]` literal hex stays.** Don't try to find/replace
  these — they're literal values in arbitrary Tailwind utilities, not token
  references. Same for `shadow-[0_0_8px_#FF0066]`, etc.

- **`rga-magenta` is NOT being renamed.** It stays in palette for decorative
  RGB-shift / chromatic effects. Don't touch globals.css magenta references.

- **`rga-yellow` is NEW (Phase 0)** — only used in status pill warn mode so
  far. Tailwind v4 picks up the class via static string scan in
  `design-tokens.ts` `STATUS_PILL_MODES`.

- **D2 frequency accent in BODY (not chrome) still uses 'mod' / 'cyan'.**
  Look at `BriefingDetailPage.tsx` body content — `accent === 'cyan' ? 'text-rga-cyan' : 'text-rga-mod'`
  pattern (~line 283). That's BODY (game color), it stays orange for daily
  briefings. Only CHROME (the StatRibbon trail leaf and fields) was
  neutralized in Phase 1. In Phase 2, this body reference will migrate to
  `text-game-d2` (same orange, different alias).

- **`frequencyAccent` utility** (`src/components/division2/briefings/accent-briefing.ts`)
  returns `'cyan' | 'orange'`. The component callsites already mapped this
  in Phase 1 — fresh Claude doesn't need to touch this utility, just the
  consumers.

- **CommandConsolePage and ArticleDetailPage** in `EXTENDED_PALETTE` had
  some accent='mod'/'green' migrations in Phase 1 that needed careful
  inspection — the leaf accent vocabulary for ArticleDetailPage was
  `'cyan' | 'mod' | 'green'`, now narrowed to `'cyan' | 'green' | undefined`.
  Orange article accents (e.g. `accent === 'orange'`) just drop their leaf
  accent (body keeps orange — see gotcha above).

- **Existing repo doc `docs/design-system/COLORS.md` is stale** and says
  "Magenta — tertiary accent for warnings". Don't trust it. Phase 4
  rewrites it. Other files in that folder (TYPOGRAPHY.md, LAYOUT.md, etc.)
  are still accurate.

- **User commits themselves.** Don't run `git commit`. Don't suggest
  commits unless asked. After each phase the user manually reviews
  diff + commits.

- **User asked to skip task tools (TaskCreate) for this work.** The phases
  are tracked here, not via in-conversation tasks.

- **Don't drive browser via Playwright MCP** (per user memory). User
  validates UI changes themselves.

- **Plan was set during /grill-me session.** No need to re-grill — the
  decisions are locked in `project_design_system_colors.md` memory and
  this file.

---

## File map (final state after Phase 4)

```
src/app/globals.css                                  — tokens (Layer 1 + Layer 2)
src/lib/design-tokens.ts                             — TypeScript export of tokens
src/stories/brand/Colors.mdx                         — Storybook Brand/Colors doc
src/app/(internal)/brand/page.tsx                    — Living /brand reference page
src/app/(internal)/brand/layout.tsx                  — Brand page title metadata
src/components/ui/StatRibbon.tsx                     — Chrome ribbon (info/warn/error pill)
src/components/ui/StatRibbon.stories.tsx             — Storybook stories
docs/design-system/COLORS.md                         — Repo doc (rewritten in Phase 4)
```

All callsites use Layer 2 aliases (`text-status-warn`, `bg-game-d2`,
`text-role-mod`, etc.) instead of raw rga-* tokens, except for cyan and
magenta which remain raw (no semantic).
