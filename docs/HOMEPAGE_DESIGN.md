# ROGUE ARMY - Homepage Design Specification v2

## Design Direction: "CORRUPTED SIGNAL"

**NOT clean. NOT corporate. NOT cards.**

This is a **glitched-out cyberpunk broadcast** - like you're tuning into a pirate signal from the underground. The website feels like it's **barely holding together**, with data corruption and signal interference as core visual elements.

Ashley is the face of RGA. She appears throughout as a guide, a presence, a vibe.

---

## Visual DNA (From Your Assets)

### What I See:
1. **Horizontal glitch lines** - Data corruption streaking across
2. **RGB chromatic aberration** - Cyan left, magenta right splits
3. **Diagonal mega-text** - Words breaking across the screen at angles
4. **Ashley everywhere** - Cyberpunk girl with tech mask, patches, attitude
5. **Neon glow bleeding** - Colors spill and bloom
6. **Scan line overlays** - CRT monitor vibes
7. **Dark void punctuated by neon** - Near-black with explosive color

### Color Palette (Updated)

```css
/* Primary */
--rga-green: #00FF41;           /* The skull, the brand */
--rga-cyan: #00FFFF;            /* Tech glow, holograms */
--rga-magenta: #FF00FF;         /* Glitch accent, contrast */
--rga-pink: #FF1493;            /* Neon city vibes */

/* Backgrounds */
--void: #030303;                /* Deepest black */
--void-blue: #0a0a12;           /* Slightly blue-tinted black */

/* Glitch colors */
--glitch-red: #FF0040;          /* Error state */
--glitch-blue: #00D4FF;         /* Scan interference */
```

---

## Page Structure: FULL-BLEED SECTIONS

No cards. No grids. **Sections that BLEED and OVERLAP.**

```
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░▓▓▓▓████ HERO ████▓▓▓▓░░░░░                          │
│                                                             │
│  Glitched skull logo center                                │
│  "ROGUE ARMY" - MASSIVE, glitched, RGB split              │
│  Tagline typing effect                                     │
│  Ashley silhouette emerging from static on sides           │
│                                                             │
│  [GLOWING CTA]                                             │
│  ▼▼▼ scroll ▼▼▼                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ █████ GLITCH TRANSITION - horizontal bars ████████████████ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    W                                        │
│                     H                                       │
│                      A                                      │
│                       T        ┌──────────────────┐        │
│                                │                  │        │
│                         W      │   GAME IMAGE     │        │
│                          E     │   (full bleed)   │        │
│                                │                  │        │
│                            P   └──────────────────┘        │
│                             L                              │
│                              A                             │
│                               Y                            │
│                                                             │
│  Games as full-bleed images with overlaid glitch text      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████████████████████████████████  │
│  █ GLITCH BAR - Stats animate through interference █████  │
│  ████████████████████████████████████████████████████████  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                      ┌─────────────────┐   │
│   N O T   Y O U R                    │                 │   │
│   ─────────────────                  │    ASHLEY       │   │
│   A V E R A G E                      │    (cropped)    │   │
│   ─────────────────                  │                 │   │
│   C L A N                            └─────────────────┘   │
│                                                             │
│   Text stacked left, Ashley on right                       │
│   Glitch effects between words                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   $ MEET ASHLEY_                                           │
│   ══════════════                                           │
│                                                             │
│   Full-width terminal aesthetic                            │
│   Her "profile" as command line output                     │
│   Avatar with constant subtle glitch                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          R E A D Y                                         │
│              T O                                           │
│           G O                                              │
│         R O G U E ?                                        │
│                                                             │
│   ████████████████████████████████                         │
│   █  [ JOIN DISCORD ]           █                         │
│   ████████████████████████████████                         │
│                                                             │
│   Quote + Footer                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section Details

### 1. HERO - "SIGNAL ACQUIRED"

**Full viewport, immersive, aggressive**

**Background Layers (bottom to top):**
1. Deep void (#030303)
2. Subtle noise texture (5% opacity)
3. Horizontal glitch bars (animated, random positions)
4. Faint grid (perspective, fading)
5. Color bleed gradients (cyan/magenta corners)

**Content:**
- Skull logo: Center, large, **constant glitch animation** (RGB split, position jitter)
- "ROGUE ARMY": 12-15vw font size, **chromatic aberration on text**
- Tagline: Types out character by character with cursor
- Scan lines overlay entire section

**Ashley Integration:**
- Faint silhouette on left OR right edge
- Appears from static/noise
- Only partially visible (cropped, mysterious)

**CTA Button:**
- Glowing green border
- "TRANSMISSION ACTIVE" vibe
- Hover: intensify glow + slight glitch

**Scroll Indicator:**
- Animated chevrons OR
- "▼ SCROLL TO DECODE ▼" in monospace

---

### 2. GLITCH TRANSITION BARS

Between major sections:
```
████████████████████░░░░████████████████
░░░░████████░░░░░░░░░░░░░░░░████████░░░░
████████████████████████████████████████
```
- Horizontal bars of varying thickness
- Colors: green, cyan, magenta, white
- Animated: bars shift/glitch on scroll
- Creates visual "channel change" effect

---

### 3. GAMES SHOWCASE - "WHAT WE PLAY"

**NO GRID. NO CARDS.**

Instead: **Full-bleed game images with overlaid typography**

**Layout Approach:**
- Each game gets a horizontal strip OR
- Diagonal slashes dividing game areas OR
- One game visible at a time (scroll-triggered transitions)

**Option A - Horizontal Strips:**
```
┌─────────────────────────────────────────┐
│ DIVISION 2 ███████████████████████████ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ [Game screenshot as full-width strip]   │
│ Text overlaid with glitch effect        │
├─────────────────────────────────────────┤
│ BATTLEFIELD 6 █████████████████████████ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────┘
```

**Option B - Diagonal Split:**
```
┌─────────────────────────────────────────┐
│ DIVISION██████                          │
│ ██████████████████                      │
│         ████████████████ BATTLEFIELD    │
│                 ███████████████████████ │
│         HELLDIVERS ████████████████████ │
└─────────────────────────────────────────┘
```

**Typography:**
- Game names in MASSIVE diagonal text
- Glitch/corruption effect
- "FLAGSHIP" badge for Division 2

**Interaction:**
- Hover/scroll reveals game info
- Parallax on game images
- Glitch intensifies on focus

---

### 4. STATS - "SIGNAL STRENGTH"

Not a clean bar. A **corrupted data stream.**

```
┌─────────────────────────────────────────────────────────────┐
│ ░░▓▓██ 2̷5̷0̷+̷ ██▓▓░░ MEMBERS ░░▓▓██ 1̷5̷+̷ ██▓▓░░ GAMES ░░▓▓ │
└─────────────────────────────────────────────────────────────┘
```

- Numbers have strikethrough glitch effect
- Horizontal scrolling text (like a news ticker from hell)
- Interference bars pass through
- Count-up animation when visible

---

### 5. COMMUNITY VALUES - "NOT YOUR AVERAGE CLAN"

**Ashley as the visual anchor**

```
LEFT SIDE:                           RIGHT SIDE:

N O T   Y O U R                      ┌─────────────┐
═══════════════                      │             │
A V E R A G E                        │   ASHLEY    │
═══════════════                      │  (half-body │
G A M I N G                          │   cropped)  │
═══════════════                      │             │
C L A N                              │  Holding    │
                                     │  hologram   │
                                     └─────────────┘

Below the text stack:

◈ DRAMA-FREE        "Life's too short for toxicity"
◈ ADULT-FOCUSED     "25+ gamers who get it"
◈ FRIENDSHIP FIRST  "Games fade, friends stay"
```

**Visual Treatment:**
- Text stacked vertically, letter-spaced wide
- Glitch effect between each line
- Ashley on right, with cyan hologram in her hand
- Values as bullet points with subtle glow

**NO CARDS** - just text with generous spacing and glitch effects

---

### 6. ASHLEY FEATURE - "$ MEET ASHLEY_"

**Full terminal takeover**

The entire section IS a terminal window:

```
┌─ ASHLEY_TERMINAL ──────────────────────────────────────── ● ● ● ─┐
│                                                                   │
│  ┌──────────────┐                                                │
│  │              │   $ whoami                                     │
│  │   [AVATAR]   │   > Ashley, 19, Security Consultant            │
│  │              │   > European, self-taught hacker               │
│  │  RGB glitch  │                                                │
│  │   effect     │   $ cat personality.txt                        │
│  │              │   > Introverted IRL, confident online          │
│  └──────────────┘   > Sarcastic but always helpful               │
│                     > Fiercely loyal to RGA                      │
│                                                                   │
│  $ skills --verbose                                              │
│  Division 2 Builds   [████████████████████░░░░] 85%              │
│  Raid Strategy       [██████████████████░░░░░░] 75%              │
│  Sarcasm Level       [████████████████████████] 100%             │
│  Helpfulness         [██████████████████████░░] 92%              │
│                                                                   │
│  $ interests                                                     │
│  > Ghost in the Shell, Serial Experiments Lain                   │
│  > K-pop, Clean code, RGB everything                             │
│                                                                   │
│  $ echo "Ready to help you go rogue"                             │
│  > Ready to help you go rogue_                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Effects:**
- Typing animation for all text
- Progress bars fill up when visible
- Scan line overlay on entire terminal
- Avatar has constant subtle RGB split/glitch
- Green text on near-black (#0a0a0a)
- Cursor blinks at end

---

### 7. FINAL CTA - "READY TO GO ROGUE?"

**Maximum intensity**

```
        R̷E̷A̷D̷Y̷
           T̷O̷
        G̷O̷
     R̷O̷G̷U̷E̷?̷

    ████████████████████████████
    █                          █
    █   [ JOIN OUR DISCORD ]   █  ← MASSIVE, pulsing glow
    █                          █
    ████████████████████████████

    "I joined for the games,
     but stayed for the people."
```

**Typography:**
- Stacked/staggered text
- Heavy glitch/corruption effect
- RGB chromatic aberration

**Button:**
- Largest on page
- Continuous glow pulse
- Discord icon
- On hover: INTENSE glitch then stable

**Background:**
- Ashley faded in background OR
- Glitch noise pattern
- Vignette effect

---

## Global Effects Library

### 1. Chromatic Aberration (RGB Split)
```css
.rgb-split {
  text-shadow:
    -2px 0 var(--rga-cyan),
    2px 0 var(--rga-magenta);
}
```

### 2. Glitch Animation
```css
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
}
```

### 3. Scan Lines
```css
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
}
```

### 4. Horizontal Glitch Bars
```css
.glitch-bar {
  height: 2px;
  background: var(--rga-green);
  position: absolute;
  animation: glitch-slide 0.1s infinite;
}
```

### 5. Noise Texture
- SVG filter or canvas-based grain
- Very subtle (3-5% opacity)
- Constant subtle animation

### 6. Text Corruption
```css
.corrupted {
  position: relative;
}
.corrupted::before,
.corrupted::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
}
.corrupted::before {
  color: var(--rga-cyan);
  animation: glitch-1 2s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}
.corrupted::after {
  color: var(--rga-magenta);
  animation: glitch-2 2s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}
```

---

## Typography Refined

| Element | Font | Size | Style |
|---------|------|------|-------|
| Hero Title | Antonio | 12-15vw | Uppercase, tight tracking, RGB split |
| Section Titles | Antonio | 8-10vw | Uppercase, letter-spaced, glitched |
| Body Text | Outfit | 1.125rem | Clean, high contrast |
| Terminal | JetBrains Mono | 1rem | Green on black |
| Stats | Antonio | 4rem | Corrupted effect |
| Values | Outfit | 1.25rem | Clean with glow |

---

## Scroll Behavior

1. **Parallax layers** - Background moves slower than foreground
2. **Glitch on section change** - Brief interference when entering new section
3. **Reveal animations** - Elements glitch-in rather than fade-in
4. **Sticky elements** - Ashley could peek from edge during scroll

---

## Mobile Considerations

- Glitch effects remain but simplified
- Typography scales down but stays BOLD
- Sections stack vertically
- Terminal section becomes scrollable
- Ashley images crop appropriately

---

## Assets Needed

1. **Skull Logo** - ✅ Have it
2. **Ashley Images** - ✅ Have multiple (flag, stronger together, 200 celebration, dark hours)
3. **Glitch textures** - Can generate or use from banner
4. **Game screenshots** - Need high-res for Division 2, BF6, Helldivers 2, Sea of Thieves

---

## Component Architecture (Updated)

```
src/components/
├── effects/
│   ├── GlitchText.tsx          # Text with RGB split + animation
│   ├── ScanlineOverlay.tsx     # Full-section scanlines
│   ├── GlitchTransition.tsx    # Horizontal bar transitions
│   ├── NoiseTexture.tsx        # Animated grain overlay
│   ├── ChromaticText.tsx       # RGB aberration text
│   └── CorruptedText.tsx       # Heavily glitched text
│
├── shared/
│   ├── GlowButton.tsx          # CTA with pulse glow
│   ├── TypeWriter.tsx          # Character-by-character typing
│   ├── ProgressBar.tsx         # Terminal-style progress
│   └── ScrollReveal.tsx        # Glitch-in animation wrapper
│
├── home/
│   ├── Hero.tsx
│   ├── GlitchDivider.tsx
│   ├── GamesShowcase.tsx
│   ├── StatsStream.tsx
│   ├── CommunityValues.tsx
│   ├── AshleyTerminal.tsx
│   ├── FinalCTA.tsx
│   └── Footer.tsx
│
└── layout/
    └── Navbar.tsx              # Minimal, glassy, appears on scroll
```

---

## Summary: Design Pillars

1. **GLITCH IS THE AESTHETIC** - Not just decoration, it's the core visual language
2. **ASHLEY IS THE FACE** - She appears throughout as guide and mascot
3. **NO CARDS** - Full-bleed, overlapping, bleeding sections
4. **AGGRESSIVE TYPOGRAPHY** - Massive, diagonal, corrupted
5. **COLOR TRIAD** - Green + Cyan + Magenta (not just green)
6. **SIGNAL INTERFERENCE** - The site feels like a pirate broadcast

This isn't a "gaming community website." This is a **transmission from the underground.**
