# Colors

Two-layer token system. Source of truth lives in `src/app/globals.css`
(`@theme` + `@theme inline`) and `src/lib/design-tokens.ts`. Visual
references: `/brand` (Next.js route) and Storybook's `Brand/Colors` page.

## Layer 1 — raw palette

Seven brand-saturated hex values. Use directly only when no Layer 2
semantic fits (rare).

| Name       | Hex       | Tailwind          | Role                                       |
| ---------- | --------- | ----------------- | ------------------------------------------ |
| Green      | `#00FF41` | `rga-green`       | RGA brand. Logo, primary CTAs, selection.  |
| Cyan       | `#00FFFF` | `rga-cyan`        | Alternative voice. No semantic alias.       |
| Magenta    | `#FF00FF` | `rga-magenta`     | Decorative only — RGB-shift, chromatic.     |
| Orange     | `#FF8000` | `rga-orange`      | Backs `game-d2` and `role-mod`.            |
| Chartreuse | `#CCFF00` | `rga-chartreuse`  | Backs `role-dev`.                          |
| Yellow     | `#FFE100` | `rga-yellow`      | Backs `status-warn` (Hazard Yellow).        |
| Rose       | `#FF0066` | `rga-rose`        | Backs `status-error` and `role-admin`.     |

Magenta is **decorative**, not a failure state — status uses Rose now.

## Layer 2 — semantic aliases

Components should reference these in preference to raw `rga-*` tokens.
`text-status-warn` tells the next reader *why* it's yellow;
`text-rga-yellow` doesn't.

| Alias           | Backs            | Purpose                                                  |
| --------------- | ---------------- | -------------------------------------------------------- |
| `brand`         | `rga-green`      | RGA identity surfaces.                                   |
| `status-ok`     | `rga-green`      | Active OK state.                                         |
| `status-warn`   | `rga-yellow`     | Soft attention — STALE, MEMBERS-ONLY gates.              |
| `status-error`  | `rga-rose`       | Hard failure — LOCKED, OFFLINE.                          |
| `status-info`   | muted gray       | Default pill — TODAY, VIEWING, LIVE, PUBLIC. No pulse.   |
| `game-d2`       | `rga-orange`     | Division 2 body content brand.                           |
| `role-dev`      | `rga-chartreuse` | Staff Developer accent on `/community/staff`.            |
| `role-mod`      | `rga-orange`     | Staff Moderator accent. Same hex as `game-d2`.           |
| `role-admin`    | `rga-rose`       | Staff Admin accent. Same hex as `status-error`.          |

Same hex can back multiple aliases when the surfaces never coexist on
one screen (mod cards live on `/community/staff/*`, D2 stuff on
`/division-2/*`).

## Behavioral rules

**Chrome vs body.** The persistent shell (top ribbon, nav, MENU,
status pill) is **chrome** — always RGA-neutral (green brand + muted +
white) regardless of URL section. Page-unique content under the shell
is **body** — wears the current game's `game-*` token. `/division-2/*`
body uses `game-d2` (orange). Future game sections add their own
`game-*` token; chrome never changes.

**Status pill modes.** `StatRibbon` carries a pill that always renders
in one of three modes. Silent when fine, loud when not.

| Mode    | Visual             | When                                       |
| ------- | ------------------ | ------------------------------------------ |
| `info`  | muted gray, static | Default — VIEWING, TODAY, LIVE, PUBLIC.    |
| `warn`  | yellow, pulse      | Soft attention — STALE, MEMBERS-ONLY.      |
| `error` | rose, pulse        | Hard failure — LOCKED, OFFLINE.            |

**Ribbon fields.** Neutral white by default. Color only when value is
itself a status (e.g. cyan `JOINED · 14D` accent on community Hero).

## Backgrounds and text

Four-level dark hierarchy (`bg-void` → `bg-bg-primary` → `bg-bg-elevated`
→ `bg-bg-surface`). Three text levels (`text-text-primary` →
`text-text-secondary` → `text-text-muted`). Never use brand colors for
long-form body — short labels, links, accents only.

## See also

- `src/stories/brand/Colors.mdx` — Storybook page with live mockups.
- `/brand` route — full living reference.
- `src/lib/design-tokens.ts` — TypeScript exports consumed by both.
- `src/app/globals.css` — token declarations.
