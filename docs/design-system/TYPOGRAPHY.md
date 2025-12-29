# Typography

## Font Families

| Family | Variable | Tailwind | Usage |
|--------|----------|----------|-------|
| Hanson Bold | `--font-display` | `font-display` | GIGANTIQUE headlines |
| JetBrains Mono | `--font-mono` | `font-mono` | Terminal, code |
| Outfit | `--font-body` | `font-body` | Body text, UI |

## Loading Strategy

### Google Fonts (External)
```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=Black+Ops+One&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap");
```

### Self-Hosted (Hanson Bold)
```css
/* globals.css */
@font-face {
  font-family: "Hanson Bold";
  src: url("/fonts/Hanson-Bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

File: `public/fonts/Hanson-Bold.otf`

## Font Stack Definitions

```css
@theme {
  --font-display: "Hanson Bold", "Black Ops One", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-body: "Outfit", system-ui, sans-serif;
}
```

## Usage Examples

### Display Headlines
```tsx
<h1 className="font-display text-[12vw] uppercase tracking-wider">
  ROGUE ARMY
</h1>
```

Used in Hero for maximum impact. Viewport-based sizing for responsiveness.

### Body Text
```tsx
<p className="font-body text-lg text-text-secondary">
  Casual gaming community for adults 25+.
</p>
```

Applied globally via `body` tag in `globals.css`.

### Monospace / Code
```tsx
<div className="font-mono text-sm text-rga-green">
  &gt; Initializing system...
</div>
```

Used in terminal-style components like AshleyTerminal.

## Typography Hierarchy

| Level | Class Example | Font |
|-------|--------------|------|
| Hero Title | `text-[12vw] font-display` | Hanson Bold |
| Section Title | `text-5xl md:text-7xl font-display` | Hanson Bold |
| Subheading | `text-xl font-bold` | Outfit |
| Body | `text-base font-body` | Outfit |
| Terminal | `font-mono text-sm` | JetBrains Mono |
| Caption | `text-sm text-text-muted` | Outfit |

## Viewport-Based Sizing

For responsive headlines that scale with screen:

```tsx
// Hero section
<span className="text-[12vw] md:text-[10vw] lg:text-[8vw]">
  ROGUE
</span>

// Game showcase
<span className="text-4xl md:text-6xl lg:text-8xl">
  THE DIVISION 2
</span>
```

## Text Effects

### With Glow
```tsx
<span className="font-display text-rga-green text-glow-green">
  ARMY
</span>
```

### With Chromatic Aberration
```tsx
<span className="font-display text-chromatic">
  GLITCHED
</span>
```

### Gradient Text
```tsx
<span className="font-display text-gradient-rga">
  COLORFUL
</span>
```

## Weight Reference

| Weight | Outfit | JetBrains Mono |
|--------|--------|----------------|
| 300 | Light | - |
| 400 | Regular | Regular |
| 500 | Medium | Medium |
| 600 | Semibold | - |
| 700 | Bold | Bold |

Hanson Bold is single-weight (700 only).

## Global Defaults

Set in `globals.css`:

```css
@layer base {
  body {
    @apply font-body antialiased;
  }
}
```

All text uses Outfit by default. Apply `font-display` or `font-mono` explicitly where needed.
