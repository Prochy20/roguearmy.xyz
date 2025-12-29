# Colors

## Brand Colors

The cyberpunk neon palette:

| Name        | Hex       | Tailwind                             | Usage                     |
| ----------- | --------- | ------------------------------------ | ------------------------- |
| RGA Green   | `#00FF41` | `text-rga-green`, `bg-rga-green`     | Primary accent, CTAs      |
| RGA Cyan    | `#00FFFF` | `text-rga-cyan`, `bg-rga-cyan`       | Secondary accent, links   |
| RGA Magenta | `#FF00FF` | `text-rga-magenta`, `bg-rga-magenta` | Tertiary accent, warnings |

### Usage

```tsx
// Text colors
<span className="text-rga-green">Highlighted text</span>
<span className="text-rga-cyan">Link text</span>

// Background colors
<div className="bg-rga-green text-void">Button</div>
```

## Background Colors

Deep dark palette for void aesthetic:

| Name       | Hex       | Tailwind         | Usage                |
| ---------- | --------- | ---------------- | -------------------- |
| Void       | `#030303` | `bg-void`        | Main page background |
| Primary BG | `#0A0A0A` | `bg-bg-primary`  | Section backgrounds  |
| Elevated   | `#111111` | `bg-bg-elevated` | Cards, modals        |
| Surface    | `#1A1A1A` | `bg-bg-surface`  | Interactive surfaces |

### Usage

```tsx
<body className="bg-void">
  <section className="bg-bg-primary">
    <div className="bg-bg-elevated p-6 rounded-lg">Card content</div>
  </section>
</body>
```

## Text Colors

| Name      | Hex       | Tailwind              | Usage                    |
| --------- | --------- | --------------------- | ------------------------ |
| Primary   | `#FFFFFF` | `text-text-primary`   | Headings, important text |
| Secondary | `#888888` | `text-text-secondary` | Body text, descriptions  |
| Muted     | `#555555` | `text-text-muted`     | Placeholders, hints      |

## Glow Colors

Semi-transparent versions for box-shadow effects:

| Name         | RGBA                     | CSS Variable           |
| ------------ | ------------------------ | ---------------------- |
| Glow Green   | `rgba(0, 255, 65, 0.5)`  | `--color-glow-green`   |
| Glow Cyan    | `rgba(0, 255, 255, 0.5)` | `--color-glow-cyan`    |
| Glow Magenta | `rgba(255, 0, 255, 0.5)` | `--color-glow-magenta` |

### Usage

```css
/* Custom glow effect */
.custom-glow {
  box-shadow: 0 0 20px var(--color-glow-green);
}
```

## CSS Variables Reference

Defined in `src/app/globals.css`:

### Theme Block (Tailwind v4)

```css
@theme {
  /* Brand */
  --color-rga-green: #00ff41;
  --color-rga-cyan: #00ffff;
  --color-rga-magenta: #ff00ff;

  /* Backgrounds */
  --color-void: #030303;
  --color-bg-primary: #0a0a0a;
  --color-bg-elevated: #111111;
  --color-bg-surface: #1a1a1a;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #888888;
  --color-text-muted: #555555;

  /* Glows */
  --color-glow-green: rgba(0, 255, 65, 0.5);
  --color-glow-cyan: rgba(0, 255, 255, 0.5);
  --color-glow-magenta: rgba(255, 0, 255, 0.5);
}
```

### shadcn/ui Variables (OKLCH)

```css
:root {
  --background: oklch(0.06 0 0);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.87 0.29 142); /* RGA Green */
  --accent: oklch(0.85 0.18 195); /* Cyan */
  --destructive: oklch(0.65 0.25 0); /* Magenta */
  --border: oklch(0.25 0 0);
  --ring: oklch(0.87 0.29 142);
}
```

## Color with Opacity

Use Tailwind's opacity modifier:

```tsx
// 50% opacity
<div className="bg-rga-green/50">Semi-transparent green</div>

// 30% opacity for subtle effects
<div className="bg-rga-cyan/30">Subtle cyan tint</div>

// Selection color (already configured globally)
::selection { @apply bg-rga-green/30 text-white; }
```

## Gradients

### Brand Gradient

```tsx
<h1 className="text-gradient-rga">Gradient Text</h1>
```

Creates green → cyan → magenta gradient text.

### Custom Gradients

```tsx
// Radial glow (used in Hero)
<div style={{
  background: `radial-gradient(ellipse at 80% 50%, rgba(0,255,65,0.15) 0%, transparent 50%)`
}} />

// Linear gradient
<div className="bg-linear-to-r from-rga-green to-rga-cyan" />
```

## Dark Mode

The project is **dark mode only**. The `dark` class is always applied:

```tsx
// src/app/(frontend)/layout.tsx
<html lang="en" className="dark">
```

No light mode variant exists. All colors are optimized for dark backgrounds.
