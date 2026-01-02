# Layout

Responsive design patterns, breakpoints, spacing, and containers.

## Breakpoints

Using Tailwind CSS v4 default breakpoints:

| Breakpoint | Min Width | Typical Device           |
| ---------- | --------- | ------------------------ |
| `sm`       | 640px     | Large phones (landscape) |
| `md`       | 768px     | Tablets                  |
| `lg`       | 1024px    | Laptops                  |
| `xl`       | 1280px    | Desktops                 |
| `2xl`      | 1536px    | Large desktops           |

### Usage

```tsx
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>

// Visibility
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

## Viewport Units

For hero-scale responsive typography:

```tsx
// Scales with viewport width
<h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw]">
  ROGUE
</h1>

// Clamp for bounds (prevents too small/large)
<h1 className="text-[clamp(2rem,8vw,6rem)]">
  ARMY
</h1>
```

**When to use viewport units:**

- Hero headlines (impact at all sizes)
- Full-bleed section titles
- Decorative text elements

**When to use standard sizing:**

- Body text (readability)
- UI elements (consistency)
- Navigation (accessibility)

## Container Patterns

### Full-Width with Padding

Most common pattern in the codebase:

```tsx
<section className="px-4 md:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">{/* Centered content with max-width */}</div>
</section>
```

### Full-Bleed Sections

For background effects that span viewport:

```tsx
<section className="relative w-full min-h-screen">
  {/* Background effect - full bleed */}
  <div className="absolute inset-0 bg-gradient-radial" />

  {/* Content - contained */}
  <div className="relative px-4 md:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">Content here</div>
  </div>
</section>
```

### Common Max Widths

| Class       | Width  | Use Case        |
| ----------- | ------ | --------------- |
| `max-w-sm`  | 384px  | Cards, forms    |
| `max-w-md`  | 448px  | Modals, dialogs |
| `max-w-lg`  | 512px  | Content cards   |
| `max-w-xl`  | 576px  | Wide cards      |
| `max-w-2xl` | 672px  | Article content |
| `max-w-4xl` | 896px  | Main content    |
| `max-w-6xl` | 1152px | Wide layouts    |
| `max-w-7xl` | 1280px | Full layouts    |

## Spacing Scale

Tailwind's default spacing scale (in `rem`):

| Class  | Size    | Pixels |
| ------ | ------- | ------ |
| `p-1`  | 0.25rem | 4px    |
| `p-2`  | 0.5rem  | 8px    |
| `p-3`  | 0.75rem | 12px   |
| `p-4`  | 1rem    | 16px   |
| `p-5`  | 1.25rem | 20px   |
| `p-6`  | 1.5rem  | 24px   |
| `p-8`  | 2rem    | 32px   |
| `p-10` | 2.5rem  | 40px   |
| `p-12` | 3rem    | 48px   |
| `p-16` | 4rem    | 64px   |
| `p-20` | 5rem    | 80px   |
| `p-24` | 6rem    | 96px   |

### Spacing Conventions

```tsx
// Section vertical spacing
<section className="py-16 md:py-24 lg:py-32">

// Card padding
<div className="p-4 md:p-6">

// Element gaps
<div className="space-y-4 md:space-y-6">

// Grid gaps
<div className="grid gap-4 md:gap-6 lg:gap-8">
```

## Grid Patterns

### Equal Columns

```tsx
// 2 columns on tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3 columns on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4 columns on large screens
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

### Asymmetric Layouts

```tsx
// Sidebar layout
<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
  <aside>Sidebar</aside>
  <main>Content</main>
</div>

// Feature section (image + text)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
  <div className="order-2 lg:order-1">Image</div>
  <div className="order-1 lg:order-2">Text</div>
</div>
```

## Flexbox Patterns

### Centered Content

```tsx
// Horizontally and vertically centered
<div className="flex items-center justify-center min-h-screen">

// Centered with max width
<div className="flex flex-col items-center text-center max-w-2xl mx-auto">
```

### Space Between

```tsx
// Header pattern
<header className="flex items-center justify-between px-4 py-3">
  <Logo />
  <nav className="flex gap-4">...</nav>
</header>
```

### Responsive Flex Direction

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Z-Index Scale

Consistent layering throughout the app:

| Layer          | Z-Index   | Use Case            |
| -------------- | --------- | ------------------- |
| Base           | `z-0`     | Default content     |
| Elevated       | `z-10`    | Cards, dropdowns    |
| Sticky         | `z-20`    | Sticky headers      |
| Modal Backdrop | `z-40`    | Overlay backgrounds |
| Modal          | `z-50`    | Modals, scanlines   |
| Toast          | `z-[100]` | Notifications       |

```tsx
<header className="sticky top-0 z-20 bg-void/80 backdrop-blur">
<ScanlineOverlay /> {/* Uses z-50 internally */}
```

## Height Patterns

### Full Viewport

```tsx
// Full viewport height
<section className="min-h-screen">

// Full height minus header
<main className="min-h-[calc(100vh-4rem)]">

// Dynamic viewport height (mobile-safe)
<div className="min-h-dvh">
```

### Aspect Ratios

```tsx
// Video containers
<div className="aspect-video">

// Square
<div className="aspect-square">

// Custom ratio
<div className="aspect-4/3">
```

## Responsive Examples

### Hero Section

```tsx
<section className="relative min-h-screen flex items-center justify-center px-4">
  <div className="text-center max-w-4xl mx-auto">
    <h1 className="font-display text-[12vw] md:text-[10vw] lg:text-[8vw] uppercase">ROGUE ARMY</h1>
    <p className="text-lg md:text-xl text-text-secondary mt-4 md:mt-6 max-w-2xl mx-auto">
      Description text here
    </p>
    <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
      <GlowButton size="lg">Primary CTA</GlowButton>
      <Button variant="outline" size="lg">
        Secondary
      </Button>
    </div>
  </div>
</section>
```

### Card Grid

```tsx
<section className="px-4 md:px-6 lg:px-8 py-16 md:py-24">
  <div className="max-w-7xl mx-auto">
    <h2 className="font-display text-4xl md:text-6xl text-center mb-8 md:mb-12">SECTION TITLE</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.id} className="bg-bg-elevated p-6 rounded-lg">
          {card.content}
        </div>
      ))}
    </div>
  </div>
</section>
```
