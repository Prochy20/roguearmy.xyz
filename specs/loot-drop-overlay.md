# Loot Drop Overlay — Feature Specification

## Overview

An interactive Twitch stream overlay where viewers type a command (default `!drop`) in chat and a Division 2-style loot item materializes at a random position on screen. A vertical loot beam shoots upward from a glowing ground disc, particles scatter on impact, and the item name with rarity label is displayed. The overlay runs as a transparent OBS browser source with zero backend — it connects to Twitch IRC anonymously. A builder page lets streamers configure every aspect visually and generates a URL to paste into OBS.

## Routes

| Route | Purpose |
|-------|---------|
| `/twitch/overlays/drop?c=<encoded>` | The overlay itself (transparent, for OBS browser source) |
| `/twitch/overlays/drop/builder` | Visual builder to configure and preview the overlay |
| `/twitch/overlays` | Hub page with showcase entry for this overlay (OVERLAY 04) |

## Architecture

```
src/
├── lib/
│   ├── overlay-drop-config.ts    # Config types, defaults, encode/decode, rarity system
│   └── division2-loot.ts         # Division 2 loot table lookup
├── data/
│   └── division2-loot.json       # Division 2 weapon/gear item database
├── hooks/
│   └── useTwitchChat.ts          # Anonymous Twitch IRC WebSocket hook
├── components/
│   └── overlays/
│       └── LootDrop.tsx          # Main overlay component (drop rendering + logic)
└── app/(internal)/twitch/overlays/
    ├── drop/
    │   ├── page.tsx              # Overlay page (reads URL config, renders LootDrop)
    │   └── builder/
    │       └── page.tsx          # Builder page (config panel + live preview)
    └── page.tsx                  # Hub page (modified to include OVERLAY 04 showcase)
```

## Configuration

All settings are serialized into a URL-safe base64 `?c=` parameter using UTF-8-safe encoding.

### `OverlayDropConfig`

| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `channel` | `string` | `''` | — | Twitch channel name to listen to |
| `command` | `string` | `'!drop'` | — | Chat message that triggers a drop |
| `cooldown` | `number` | `2` | 0–30s | Minimum time between any two drops |
| `userCooldown` | `number` | `5` | 0–60s | Per-viewer cooldown between drops |
| `modOnly` | `boolean` | `false` | — | Restrict drops to mods/broadcaster only |
| `showUsernames` | `boolean` | `true` | — | Show viewer name below the item label |
| `dropSpeed` | `number` | `2` | 1–5s | Impact animation speed (beam ramp-up time) |
| `beamDuration` | `number` | `3` | 1–8s | How long the loot beam stays visible |
| `particleCount` | `number` | `15` | 5–30 | Number of particles on impact |
| `maxActiveDrops` | `number` | `8` | 1–20 | Max simultaneous drops on screen |
| `dropSize` | `DropSize` | `'md'` | sm/md/lg | Ground disc, beam width, particle scale |
| `textSize` | `DropSize` | `'md'` | sm/md/lg | Font size for labels and usernames |
| `franchise` | `Franchise` | `'division2'` | division2/generic | Item name source and rarity naming |

### Drop Size Map (orbSize in px)

| Size | px |
|------|-----|
| `sm` | 16 |
| `md` | 24 |
| `lg` | 36 |

### Text Size Map (px)

| Size | Label | Username |
|------|-------|----------|
| `sm` | 10 | 8 |
| `md` | 14 | 11 |
| `lg` | 20 | 14 |

## Rarity System

### Tiers and Weights

6 rarity tiers with weighted random rolling (total weight = 100):

| Internal Key | Weight | Generic Label | Div2 Label | Generic Color | Div2 Color |
|-------------|--------|--------------|------------|---------------|------------|
| `common` | 45 | COMMON | STANDARD | `#4ADE80` green | `#4ADE80` green |
| `rare` | 25 | RARE | SPECIALIZED | `#60A5FA` blue | `#60A5FA` blue |
| `epic` | 14 | EPIC | SUPERIOR | `#C084FC` purple | `#C084FC` purple |
| `legendary` | 8 | LEGENDARY | HIGH-END | `#F59E0B` amber | `#F97316` orange |
| `gearset` | 6 | GEAR SET | GEAR SET | `#2DD4BF` teal | `#2DD4BF` teal |
| `exotic` | 2 | EXOTIC | EXOTIC | `#22D3EE` cyan | `#EF4444` red |

### Franchise Modes

- **Division 2**: Rolls real item names from `division2-loot.json`. Displays item name as primary label, rarity tier + category as subtitle (e.g., "SUPERIOR - Assault Rifle"). Uses Div2 color palette and naming.
- **Generic**: No item names. Displays rarity label only (e.g., "LEGENDARY"). Uses generic color palette.

### Beam Height by Rarity

Rarer items get taller beams (percentage of viewport height):

| Rarity | Beam Height |
|--------|------------|
| common | 30vh |
| rare | 45vh |
| epic | 60vh |
| legendary | 75vh |
| gearset | 80vh |
| exotic | 90vh |

### Intensity Scaling

Visual intensity (impact flash size, glow strength) scales with rarity:

| Rarity | Multiplier |
|--------|-----------|
| common | 0.6x |
| rare | 0.75x |
| epic | 0.9x |
| legendary | 1.0x |
| gearset | 1.0x |
| exotic | 1.2x |

## Division 2 Loot Table

### File: `src/data/division2-loot.json`

Array of loot items with shape:

```typescript
interface LootDrop {
  name: string      // Item display name (e.g., "Military AK-M")
  rarity: string    // "regular", "legendary", "gearset", or "exotic"
  category: string  // Weapon/gear type (e.g., "Assault Rifle", "Mask")
  subtitle: string  // Family name (e.g., "AK-47")
}
```

### Pool Assignment (`src/lib/division2-loot.ts`)

Items marked `"rarity": "regular"` are shared across the three lower tiers (common/rare/epic), since in Division 2 any base weapon can drop at Standard, Specialized, or Superior quality. Fixed-rarity items (`legendary`, `gearset`, `exotic`) are in dedicated pools.

| Overlay Rarity | JSON Pool |
|---------------|-----------|
| common | `regular` items |
| rare | `regular` items |
| epic | `regular` items |
| legendary | `legendary` items |
| gearset | `gearset` items |
| exotic | `exotic` items |

## Twitch Chat Integration

### Hook: `useTwitchChat`

Anonymous read-only connection to Twitch IRC. No OAuth tokens required.

**Connection flow:**
1. Open WebSocket to `wss://irc-ws.chat.twitch.tv:443`
2. Send `CAP REQ :twitch.tv/tags twitch.tv/commands` (enables badge/mod detection)
3. Auth as `justinfan{random}` (anonymous read-only nick)
4. Join `#channel`

**Features:**
- Parses PRIVMSG lines for: username, display-name, badges, mod status, broadcaster status
- Responds to PING with PONG (keepalive)
- Auto-reconnects with exponential backoff (1s base, 30s max)
- `enabled` flag to disable connection (used by builder in non-live modes)

**Returns:** `{ isConnected: boolean, error: string | null, onMessage: (cb) => void }`

### Message Processing (in LootDrop)

1. Incoming PRIVMSG → trim + lowercase → compare to configured command
2. If `modOnly` enabled → check `isMod` or `isBroadcaster` badge
3. Check global cooldown → check per-user cooldown → check max active drops
4. Roll rarity → roll item (if Division 2 mode) → spawn at random position

## Drop Visual Lifecycle

Each drop spawns at a random position (x: 5–95%, y: 30–85%) and goes through:

### 1. Impact Flash (0–0.45s)
- Double-ring burst: bright white-to-color radial flash + flattened shockwave ring
- Flash size and intensity scale with rarity

### 2. Ground Disc (appears at 0.25s, persists with pulse)
Four concentric layers, all flat ellipses simulating perspective:
- **Outermost ambient ring** — wide, faint, pulsing (2s cycle)
- **Outer glow ring** — ring-shaped gradient
- **Inner bright disc** — solid color core, pulsing (1.5s cycle, offset 0.2s)
- **Center hot spot** — tiny white-hot ellipse at beam connection point

### 3. Loot Beam (shoots up at 0.15s)
Three-layer composite beam:
- **Outer glow** — wide, blurred, diffused light
- **Main column** — medium width, sharp edges, color gradient fading to top
- **Inner core line** — thin bright line, white-hot at base, 70% of main beam height

Beam height is rarity-dependent (30vh common → 90vh exotic).

### 4. Particle Burst (0–0.7s)
Two particle types:
- **Sparks** (60%) — small, round, rarity-colored, fast (0.4–0.7s), tight spread
- **Embers** (40%) — larger, elongated, white with color glow, slower (0.7–1.2s), wider spread

Both follow 3-keyframe curved trajectories with lateral drift.

### 5. Labels (appear at 0.12s)
- **Item name** (Div2) or **Rarity label** (Generic) — Hanson Bold, white with colored glow
- **Rarity tier + Category** (Div2 only) — JetBrains Mono, rarity color, e.g., "SUPERIOR - Assault Rifle"
- **Username** (optional) — JetBrains Mono, white 65% opacity
- Dark radial backdrop behind text for readability

### 6. Fade Out
Total duration = `dropSpeed + beamDuration`. Fade begins 1.2s before end.

## Builder Page

### Layout

Left panel (420px) with scrollable config sections + right panel with preview and URL output.

### Config Sections

Each setting has a label and description:

1. **Twitch Channel** — text input
2. **Trigger Command** — text input
3. **Franchise** — two-button row (Division 2 / Generic)
4. **Global Cooldown** — range slider 0–30s
5. **Per-user Cooldown** — range slider 0–60s
6. **Mod Only** — toggle
7. **Show Usernames** — toggle
8. **Drop Size** — three-button row (sm/md/lg)
9. **Text Size** — three-button row (sm/md/lg)
10. **Impact Speed** — range slider 1–5s
11. **Beam Duration** — range slider 1–8s
12. **Particle Count** — range slider 5–30
13. **Max Active Drops** — range slider 1–20

### Preview Modes

| Mode | Behavior |
|------|----------|
| **Demo** (default) | Manual rarity buttons — click to spawn a specific tier. No automatic drops. |
| **Auto** | Auto-spawns random drops every 3–4s with fake usernames. |
| **Live Debug** | Connects to Twitch chat. Spawns drops when command is typed. Shows connection status indicator (green/yellow/red dot). |

### URL Output

- **Copy URL** button generates `{origin}/twitch/overlays/drop?c={encoded}`
- **Load from URL** input parses an existing URL back into config

## Overlay Page

Reads `?c=` search param, decodes config, renders `<LootDrop />` full-screen with transparent background. Wrapped in `<Suspense>` for `useSearchParams()`.

## OBS Integration

- Add as Browser Source in OBS
- Set URL to the generated overlay URL
- Any resolution works (overlay uses viewport-relative sizing)
- Background is transparent by default — no custom CSS needed
- Position and resize freely in the scene

## Component API

### `<LootDrop>`

```typescript
interface LootDropProps {
  config: OverlayDropConfig
  demoMode?: boolean        // Enables auto-spawning (default: false)
  contained?: boolean       // Use absolute positioning instead of fixed (default: false)
  onConnectionChange?: (status: { isConnected: boolean; error: string | null }) => void
  onReady?: (spawnPreview: (rarity: Rarity) => void) => void
}
```

- `contained` mode: Uses `absolute` positioning and percentage-based sizing for embedding in the builder preview. In fullscreen mode uses `fixed` and viewport units.
- `onReady`: Provides a `spawnPreview(rarity)` function that bypasses cooldowns for the builder's manual demo buttons.
- `onConnectionChange`: Reports Twitch connection status for the builder's status indicator.

## Cooldown System

- **Global cooldown**: `useRef` timestamp. Blocks all drops if less than `cooldown` seconds since last drop.
- **Per-user cooldown**: `useRef(Map<string, number>)`. Blocks individual users for `userCooldown` seconds.
- **Stale cleanup**: Periodic `setInterval` (10s) removes user entries older than `2 * userCooldown`.
- **Max active drops**: Checked inside `setDrops` callback to prevent race conditions.
- **Preview spawns** (`spawnPreviewDrop`): Bypass all cooldowns entirely.

## Encoding

Config is serialized as JSON → UTF-8 bytes → base64 → URL-safe (replace `+` → `-`, `/` → `_`, strip `=` padding). Decoding reverses this with validation — any invalid field falls back to default.

## Hub Page Integration

Added as **OVERLAY 04** on `/twitch/overlays` between the Hero Overlay showcase and the OBS Setup Guide:

- `SectionGlitch` divider
- `CyberCorners` with `color="orange"`
- Static preview with 5 colored vertical beams (one per rarity) and glowing ground dots
- Feature list and link to builder via `GlowButton`
