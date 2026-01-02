# Utility Classes

Custom Tailwind utilities defined in `src/app/globals.css`.

## Text Glow Effects

Neon text-shadow stacks:

### `.text-glow-green`
```css
.text-glow-green {
  text-shadow:
    0 0 10px var(--color-glow-green),
    0 0 20px var(--color-glow-green),
    0 0 40px var(--color-glow-green);
}
```

Usage:
```tsx
<h1 className="text-rga-green text-glow-green">ARMY</h1>
```

### `.text-glow-cyan`
```css
.text-glow-cyan {
  text-shadow:
    0 0 10px var(--color-glow-cyan),
    0 0 20px var(--color-glow-cyan);
}
```

### `.text-glow-magenta`
```css
.text-glow-magenta {
  text-shadow:
    0 0 10px var(--color-glow-magenta),
    0 0 20px var(--color-glow-magenta);
}
```

## Box Glow Effects

Neon box-shadow for elements:

### `.glow-green`
```css
.glow-green {
  box-shadow:
    0 0 20px var(--color-glow-green),
    0 0 40px var(--color-glow-green);
}
```

Usage:
```tsx
<button className="bg-rga-green glow-green">Click Me</button>
```

### `.glow-cyan`
```css
.glow-cyan {
  box-shadow:
    0 0 20px var(--color-glow-cyan),
    0 0 40px var(--color-glow-cyan);
}
```

### `.glow-magenta`
```css
.glow-magenta {
  box-shadow:
    0 0 20px var(--color-glow-magenta),
    0 0 40px var(--color-glow-magenta);
}
```

## Chromatic Aberration

### `.text-chromatic`
Static RGB split effect:
```css
.text-chromatic {
  text-shadow:
    -2px 0 var(--color-rga-cyan),
    2px 0 var(--color-rga-magenta);
}
```

Usage:
```tsx
<span className="text-chromatic">GLITCHED</span>
```

For animated version, use `animate-rgb-shift` or the `ChromaticText` component.

## Gradient Text

### `.text-gradient-rga`
```css
.text-gradient-rga {
  @apply bg-linear-to-r from-rga-green via-rga-cyan to-rga-magenta;
  @apply bg-clip-text text-transparent;
}
```

Usage:
```tsx
<h2 className="text-gradient-rga">Colorful Headline</h2>
```

## Noise Overlay

### `.noise-overlay`
Adds SVG fractal noise via `::before` pseudo-element:
```css
.noise-overlay::before {
  content: "";
  @apply absolute inset-0 pointer-events-none opacity-5;
  background-image: url("data:image/svg+xml,...");
}
```

Usage:
```tsx
<div className="relative noise-overlay">
  {/* Content with subtle noise texture */}
</div>
```

Parent must have `position: relative`.

## Scrollbar Styling

### `.scrollbar-hide`
Hides scrollbar while maintaining scroll functionality:
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

Usage:
```tsx
<div className="overflow-x-auto scrollbar-hide">
  {/* Horizontally scrollable content without visible scrollbar */}
</div>
```

### Global Scrollbar Theme
Applied to all scrollbars:
```css
::-webkit-scrollbar {
  @apply w-2;
}
::-webkit-scrollbar-track {
  @apply bg-void;
}
::-webkit-scrollbar-thumb {
  @apply bg-rga-green/30 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-rga-green/50;
}
```

## Selection Color

Global text selection styling:
```css
::selection {
  @apply bg-rga-green/30 text-white;
}
```

## Combined Patterns

### Glowing Heading
```tsx
<h1 className="font-display text-rga-green text-glow-green text-6xl">
  ROGUE ARMY
</h1>
```

### Chromatic Glitch Effect
```tsx
<span className="text-chromatic animate-rgb-shift">
  DISTORTED
</span>
```

### Noisy Card
```tsx
<div className="relative bg-bg-elevated rounded-lg p-6 noise-overlay">
  <h3 className="text-xl font-bold">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Gradient Button
```tsx
<button className="bg-linear-to-r from-rga-green to-rga-cyan text-void px-6 py-3 font-bold">
  SUBMIT
</button>
```

## Adding New Utilities

Add to `@layer utilities` in `globals.css`:

```css
@layer utilities {
  /* Your new utility */
  .text-glow-white {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.5),
      0 0 20px rgba(255, 255, 255, 0.3);
  }
}
```

Then use in components:
```tsx
<span className="text-glow-white">Bright text</span>
```
