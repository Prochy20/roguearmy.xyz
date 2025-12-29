# Effect Components

Visual effect components for the cyberpunk aesthetic.

## HeroGlitch

**Path**: `src/components/effects/HeroGlitch.tsx`
**Type**: Client Component

Intense periodic glitch effect with RGB split, data corruption, and scanlines.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content to apply glitch to |
| `className` | `string` | - | Additional classes |
| `minInterval` | `number` | `3` | Min seconds between glitches |
| `maxInterval` | `number` | `8` | Max seconds between glitches |
| `intensity` | `number` | `7` | Glitch power (1-10) |
| `dataCorruption` | `boolean` | `true` | Enable character scrambling |
| `scanlines` | `boolean` | `true` | Enable scanline overlay |
| `colors` | `[string, string]` | `["#00ffff", "#ff00ff"]` | RGB split colors |

### Usage
```tsx
import { HeroGlitch } from "@/components/effects"

// Basic
<HeroGlitch>ROGUE ARMY</HeroGlitch>

// Custom intensity
<HeroGlitch intensity={5} minInterval={5} maxInterval={10}>
  SUBTLE GLITCH
</HeroGlitch>

// Different colors
<HeroGlitch colors={["#ff0000", "#0000ff"]}>
  RED/BLUE SPLIT
</HeroGlitch>
```

### 4-Phase Glitch Sequence
1. **Initial spike** (0-80ms) - First jolt
2. **Intense** (80-200ms) - Maximum distortion
3. **Decay** (200-300ms) - Settling down
4. **Aftershock** (300-400ms) - Final tremor

### Effects Included
- RGB chromatic split (cyan/magenta layers)
- Data corruption (character scrambling)
- Horizontal slice displacement (5 layers)
- Scanline overlay during glitch
- White flicker overlay
- Noise grain texture

---

## SectionGlitch

**Path**: `src/components/effects/SectionGlitch.tsx`
**Type**: Client Component

Section divider with scroll-driven parallax glitch effect.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'minimal' \| 'subtle' \| 'medium' \| 'intense'` | `'subtle'` | Effect complexity |
| `colorPrimary` | `string` | `"#00FF41"` | Primary glow color |
| `colorSecondary` | `string` | `"#00FFFF"` | Secondary glow color |
| `className` | `string` | - | Additional classes |

### Usage
```tsx
import { SectionGlitch } from "@/components/effects"

// Between sections
<SectionGlitch />

// More intense
<SectionGlitch intensity="intense" />

// Custom colors
<SectionGlitch colorPrimary="#FF00FF" colorSecondary="#00FFFF" />
```

### Intensity Levels
| Level | Height | Bleed | Parallax | Elements |
|-------|--------|-------|----------|----------|
| minimal | 1px | 0 | No | Simple gradient line |
| subtle | 2px | 16px | No | 3 hex fragments, 2 glitch blocks |
| medium | 3px | 24px | 60px | 5 hex fragments, 4 glitch blocks |
| intense | 4px | 40px | 120px | 8 hex fragments, 4 glitch blocks |

### 11-Layer Architecture
0. Radial glow background (parallax back)
1. Grid pattern (static)
2. Main glowing lines (parallax mid)
3. Glitch displacement blocks (animated)
4. RGB chromatic split lines
5. Data fragments (hex values)
6. Noise/static burst
7. Scanline flicker
8. Flash spike
9. Corner decorations
10. Edge glow + persistent scanlines

---

## ScanlineOverlay

**Path**: `src/components/effects/ScanlineOverlay.tsx`
**Type**: Client Component

Global CRT-style scanline effect.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'low' \| 'medium' \| 'high'` | `'low'` | Scanline opacity |
| `animated` | `boolean` | `false` | Add moving sweep line |

### Usage
```tsx
import { ScanlineOverlay } from "@/components/effects"

// In layout (applied globally)
<ScanlineOverlay intensity="low" />

// With animated sweep
<ScanlineOverlay intensity="medium" animated />
```

### Intensity Values
| Level | Opacity |
|-------|---------|
| low | 0.02 |
| medium | 0.04 |
| high | 0.08 |

---

## GlitchText

**Path**: `src/components/effects/GlitchText.tsx`
**Type**: Client Component

Lighter glitch effect for general text.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Text content |
| `trigger` | `'scroll' \| 'hover' \| 'always'` | `'scroll'` | When to trigger |
| `chromaticAberration` | `boolean` | `true` | Enable RGB offset |
| `intensity` | `number` | `5` | Effect strength (1-10) |
| `duration` | `number` | `0.3` | Animation duration (s) |
| `className` | `string` | - | Additional classes |

### Usage
```tsx
import { GlitchText } from "@/components/effects"

// Triggers on scroll into view
<GlitchText>SCROLL GLITCH</GlitchText>

// Triggers on hover
<GlitchText trigger="hover">HOVER ME</GlitchText>

// Always glitching
<GlitchText trigger="always">CONSTANT GLITCH</GlitchText>
```

---

## ChromaticText

**Path**: `src/components/effects/ChromaticText.tsx`
**Type**: Client Component

Permanent RGB chromatic aberration effect.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Text content |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'span' \| 'p' \| 'div'` | `'span'` | HTML element |
| `animated` | `boolean` | `false` | Enable animate-rgb-shift |
| `className` | `string` | - | Additional classes |

### Usage
```tsx
import { ChromaticText } from "@/components/effects"

// Static aberration
<ChromaticText>DISTORTED</ChromaticText>

// Animated shifting
<ChromaticText animated>SHIFTING</ChromaticText>

// As heading
<ChromaticText as="h2" className="text-4xl">HEADLINE</ChromaticText>
```

---

## TypeWriter

**Path**: `src/components/effects/TypeWriter.tsx`
**Type**: Client Component

Character-by-character text reveal animation.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text to type |
| `speed` | `number` | `50` | Ms per character |
| `delay` | `number` | `0` | Delay before starting (ms) |
| `cursor` | `boolean` | `true` | Show blinking cursor |
| `onComplete` | `() => void` | - | Callback when done |
| `className` | `string` | - | Additional classes |

### Usage
```tsx
import { TypeWriter } from "@/components/effects"

// Basic
<TypeWriter text="Hello, Agent..." />

// Faster, no cursor
<TypeWriter text="Quick message" speed={30} cursor={false} />

// With callback
<TypeWriter
  text="Loading complete."
  onComplete={() => setLoaded(true)}
/>

// With delay
<TypeWriter text="Delayed start" delay={2000} />
```

### Notes
- Cursor uses `animate-blink` class
- Text is revealed character-by-character
- Used extensively in AshleyTerminal section
