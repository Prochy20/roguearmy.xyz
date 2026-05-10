# Handoff: RGA Web — Corrupted Signal

A complete set of high-fidelity HTML design references for the **Rogue Army (RGA)** community website. Six pages, one shared aesthetic system ("Corrupted Signal"), and a small library of reusable React/JSX building blocks.

---

## About the Design Files

The files in this bundle are **design references created in HTML** — visual prototypes showing intended look, layout, copy, and behavior. They are **not** production code to copy directly.

Your task is to **recreate these designs in the target codebase's existing environment** (Next.js/React per the attached `RGA-WEB` repo) using its established patterns, component library, and conventions. If a Tailwind/shadcn setup is in place, lift the visual values listed below and translate them into that system rather than porting inline `style={{}}` props.

The HTML files use:
- React 18 via UMD `<script>` tags
- Babel standalone for inline JSX transpilation
- Inline `style={{}}` objects (no Tailwind, no CSS modules)
- Google Fonts (`Outfit`, `JetBrains Mono`, `Black Ops One` as a substitute for the brand "Hanson Bold")

These choices were made for prototype portability. Do not bring them into production — use the codebase's real font pipeline, real component primitives, and real styling system.

---

## Fidelity

**High-fidelity (hifi).** Every page is pixel-considered: final colors, typography, spacing, micro-interactions, and copy are intentional and should be matched in the implementation. Recreate pixel-perfectly using the codebase's existing libraries — substitute primitives (Button, Input, Dialog, etc.) where they exist, but preserve all visual values.

---

## Pages / Views

### 1. `RGA Main Nav.html`
Site-wide top navigation + full-screen overlay menu.
- **Closed state**: thin top bar — left wordmark, center primary nav (HOME, MANIFESTO, COMMUNITY, ARTICLES, GAMES, DISCORD), right "ENLIST" CTA button.
- **Open state**: full-viewport overlay with scanlines, oversized link list, side metadata column (member count, online now, current op).
- Live UTC clock in the corner.

### 2. `Manifesto.html`
The community's stance, in 9 numbered sections.
- Hero with massive glitch-shadowed display type.
- Numbered section grammar (`01` → `09`) with mono eyebrows and kicker comments (`// like this`).
- Mix of pull quotes, value matrices, code-style "rule" cards, and a signature block.

### 3. `About Community.html`
Long-scroll page introducing who we are, our values, our people, and the numbers behind the community.
- 12 numbered sections: Hero → Pull strip → Values → Numbers → Origin timeline → Mods → Currently playing → Member voices → Comparison matrix → FAQ → Channels directory → Transmissions signup → Join CTA.
- Animated count-up stats (IntersectionObserver triggered).
- Diamond-node origin timeline (2019 → 2026).

### 4. `Article Detail.html`
Long-form article reading template.
- Sticky table-of-contents rail.
- Drop-cap opening, pull quotes, code blocks, image placeholders.
- Related articles strip + author bio block at the bottom.

### 5. `Footer Designs.html`
Three footer variants laid out on a [design canvas](#) for comparison.
- A: dense site-map grid.
- B: oversized wordmark + minimal links.
- C: "transmission" call-out with newsletter input + secondary site map.

### 6. `Component Library.html`
A documentation-style page that catalogues the reusable atoms and molecules used across the other pages. Numbered sections mirror the manifesto/about grammar so it doubles as a styleguide.

---

## Design System — "Corrupted Signal"

### Color tokens

| Token | Value | Usage |
|---|---|---|
| `void` | `#000000` | Page background |
| `surface` | `#0a0a0a` | Card surfaces |
| `surface2` | `#111111` | Raised surfaces |
| `border` | `rgba(255,255,255,0.08)` | Hairline dividers |
| `borderHot` | `rgba(0,255,65,0.25)` | Active/focused borders |
| `green` | `#00FF41` | Primary accent — CTAs, highlights, glow |
| `cyan` | `#00FFFF` | Secondary accent — informational tags |
| `magenta` | `#FF00FF` | Tertiary accent — warnings, "hot" tags |
| `text` | `#EDEDED` | Primary text |
| `text2` | `#B8B8B8` | Body / secondary text |
| `text3` | `#7A7A7A` | Tertiary / metadata |
| `muted` | `#4A4A4A` | Disabled / lowest-priority |

All values are duplicated in code as the `RGA` constant — see `component-library.jsx:10-24` (and the same block in every other JSX file) for the canonical source.

### Typography

| Role | Family | Notes |
|---|---|---|
| Display | `Hanson Bold` (fallback: `Black Ops One`) | All large headings, hero text, section numbers |
| Mono | `JetBrains Mono` | Eyebrows, metadata, codes (`V_01`, `P_03`), kickers, timestamps |
| Body | `Outfit` (fallback: system-ui) | Paragraphs, descriptions, quote bodies |

Hanson Bold is the brand display face; the prototypes substitute Google Fonts' **Black Ops One** because Hanson is not free. **In production, license and load Hanson Bold.**

Common scales (Display): `clamp(34px, 4vw, 54px)` for section titles; `clamp(60px, 8vw, 130px)` for hero; `clamp(80px, 13vw, 220px)` for the manifesto opener.

### Mono micro-typography

The mono face is used heavily for "system chrome" labels. Standard pattern:
- `fontSize: 10–11px`
- `letterSpacing: 0.25em – 0.35em`
- `textTransform: uppercase`
- `color: text3` (or accent for active)

Always bracket with leading slashes (`// like this`) for kicker comments, or wrap in a thin border for "code" tags.

### Spacing & layout

- Page max-width: **1480px** (centered).
- Section padding: **`112px 64px`** vertical/horizontal on desktop; the join CTA uses `120px 64px 140px`.
- Section gap (within a section): **18–28px** for grids; **40–60px** between header and body.
- Numbered-section header pattern: `[NN]` (display, large) ▸ eyebrow (mono, accent) ▸ kicker (mono, muted) ▸ title (display, medium).

### Borders, shapes, glow

- Borders are always **1px solid** with the `border` or `borderHot` token. No shadows on cards.
- Selected/primary buttons use a notched `clip-path`:
  `polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`.
- Glow effect (driven by the `glow` tweak, default `1`):
  `box-shadow: 0 0 20px rgba(0,255,65,0.45)`
  `text-shadow: 0 0 24px rgba(0,255,65,0.55), 0 0 50px rgba(0,255,65,0.25)`.
- Scanline overlay: 2px-period horizontal repeating gradient at ~6% white over the page background.

---

## Reusable Components (in `component-library.jsx`)

| Name | Purpose |
|---|---|
| `SectionHeader({ num, eyebrow, kicker, title })` | The numbered-section header used on every page. |
| `MetaRow({ label, value, mono })` | Key/value row in the hero metadata card. |
| `SectionLink` | Anchor rail item (numbered + label). |
| `PullStrip` | Full-bleed "we're not / we are" pull quote band. |
| `ValueCell` | One cell of the values matrix. |
| `Stat` (with `useCountUp`) | Animated stat tile, 8-up grid. |
| `TimelineNode` | Diamond-node entry in the origin section. |
| `ModCard` | Moderator card with portrait placeholder. |
| `GameCard` | Currently-playing game tile. |
| `QuoteSlab` | Member voice quote (giant `"` + body + attribution). |
| `CompareRow` | Row in the "what we're not" delta matrix. |
| `FAQRow` | Accordion entry. |
| `ChannelTile` | Discord-style channel directory card. |
| `TransmissionForm` | Newsletter signup with terminal-styled input. |
| `JoinSection` | Final recruitment-order CTA. |

Other JSX files (`manifesto.jsx`, `about-community.jsx`, `footers.jsx`, `article.jsx`, `nav-components.jsx`) follow the same conventions and can be cross-referenced.

---

## Interactions & Behavior

### Global
- **Tweaks panel** (`tweaks-panel.jsx`): floating bottom-right control panel with a "glow" slider (0 → 2). Drives all green glow intensities. This is a prototyping tool — **drop it in production** and bake `glow = 1` in.
- All numbered anchors (`#sec-01`, `#sec-02`, …) scroll-link from the hero anchor rail.

### Page-specific
- **Main Nav**: overlay opens with crossfade + slight scale; ESC closes.
- **About**: stat tiles count up from 0 once 30% in viewport (IntersectionObserver, single-shot).
- **About / FAQ**: accordion is single-open (controlled state, click to toggle).
- **About / Transmissions**: form has three states (`idle` → `sending` → `done`); flips submit button copy/colors.
- **Article Detail**: TOC items highlight on scroll into view (intersection-driven).

### Animations / transitions
- All transitions: `0.2s` ease-out unless otherwise specified.
- Glow values are CSS-rendered; no JS animation needed.

---

## State Management

Everything currently lives in component-local `useState`. Real-codebase considerations:

| Surface | State |
|---|---|
| Global glow / theme tweaks | App-level context (or skip — keep at default `1`) |
| Nav overlay open/close | Global, since multiple pages need it |
| FAQ open index | Local |
| Newsletter form state | Local — wire `sending → done` to your real API |
| Stat count-up | Local + IntersectionObserver |
| Live UTC clock | Local interval (1s) |

No data fetching is mocked. **Mods, games, voices, FAQ entries, channel list, and stats are hard-coded data arrays** at the top of each section's source — these should move to your CMS / DB.

---

## Responsive behavior

The prototypes target a **1480px design width** and assume desktop. They are not responsive.

For implementation:
- ≥ 1280px: as designed.
- 768–1279px: collapse multi-column grids to 2-up; reduce section padding to `80px 32px`; scale display type by ~70%.
- < 768px: stack to 1-up; nav becomes a hamburger; replace anchor rail with a sticky bottom bar; replace the metadata side-card with a single horizontal strip.

Mods / games / channels grids should reflow naturally with `repeat(auto-fill, minmax(280px, 1fr))`.

---

## Assets

All imagery in the prototypes is **striped SVG placeholders** with monospace `DROP_IMAGE` labels indicating intended content (portrait, key art, screenshot, etc.). Replace each placeholder with real media:

| Placeholder | Suggested asset |
|---|---|
| Mod portraits (6×) | Square 600×600 photo, treated B&W or duotone |
| Game key art (rotation grid) | 16:9 official key art |
| Article hero | Wide 16:9 editorial image |
| Article body images | 4:3 or 16:9 supporting images |
| Footer / hero ambient images | Subtle texture/abstract — keep the contrast low so glow sits on top |

No icon assets are used in the prototypes apart from the inline Discord glyph SVG (`DiscordGlyph` in `component-library.jsx`). Use the codebase's existing icon library (`lucide-react` is in the repo).

---

## Files in this bundle

```
design_handoff_rga_web/
├── README.md                  ← you are here
├── RGA Main Nav.html          ← entry-point preview, includes nav overlay
├── Manifesto.html
├── About Community.html
├── Article Detail.html
├── Footer Designs.html
├── Component Library.html
├── nav-components.jsx
├── manifesto.jsx
├── about-community.jsx
├── article.jsx
├── footers.jsx
├── component-library.jsx
└── tweaks-panel.jsx           ← prototype tweak panel — DO NOT SHIP
```

Open any `.html` file directly in a browser to see the live design. The `.jsx` files are loaded by their corresponding HTML via `<script type="text/babel">`.

---

## Implementation checklist (for the dev)

1. License **Hanson Bold** and add it to the font pipeline; remove the `Black Ops One` fallback once available.
2. Port the color tokens (table above) into your theme config (Tailwind `theme.extend.colors`, CSS variables, or whatever the codebase uses).
3. Port the typography scale into the same.
4. Build the numbered `SectionHeader` primitive first — every page leans on it.
5. Build the page chrome (`MainNav`, scanline overlay, glow utility) before any individual page.
6. Replace each placeholder image, hard-coded data array, and form `setTimeout` with real sources.
7. Drop `tweaks-panel.jsx` and bake `glow = 1` into the styles.
8. Add responsive breakpoints (see "Responsive behavior" above).
9. Wire the `Article Detail` TOC and `About` stat count-up to real IntersectionObservers using your codebase's preferred hook (`useInView`, etc.).
