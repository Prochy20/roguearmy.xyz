# Error Pages

Cyberpunk-themed error handling system with Ashley reporting errors via terminal interface.

## Architecture

Next.js uses a multi-layer error boundary system. This project implements custom error pages at each level:

```
src/app/
├── global-error.tsx        # Root error boundary (catches root layout errors)
├── not-found.tsx           # Root 404 catch-all
├── layout.tsx              # Root layout (minimal wrapper)
└── (frontend)/
    ├── error.tsx           # Frontend segment error boundary
    └── not-found.tsx       # Frontend 404 page
```

### Error Flow Precedence

1. **Global errors** (root layout failures) → `global-error.tsx`
2. **Frontend segment errors** (500s) → `(frontend)/error.tsx`
3. **Frontend 404s** → `(frontend)/not-found.tsx`
4. **Any other 404s** → `not-found.tsx`

## Components

### Directory Structure

```
src/components/error/
├── ErrorPage.tsx           # Main error display component
├── AshleyErrorTerminal.tsx # Terminal-style output
├── error-config.ts         # Error code configurations
└── index.ts                # Barrel export
```

---

## ErrorPage

**Path**: `src/components/error/ErrorPage.tsx`
**Type**: Client component

Main error page layout with glitched error code, terminal output, and recovery CTAs.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `errorType` | `ErrorCode` | required | Error code to display |
| `reset` | `() => void` | - | Callback for error boundary retry |
| `showHomeButton` | `boolean` | `true` | Show "Go Home" button |
| `showRetryButton` | `boolean` | `!!reset` | Show "Try Again" button |

### Usage

```tsx
// In error.tsx (error boundary)
"use client"

import { ErrorPage } from "@/components/error"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error("Error:", error)
  return <ErrorPage errorType="500" reset={reset} />
}
```

```tsx
// In not-found.tsx (404 page)
import { ErrorPage } from "@/components/error"

export default function NotFound() {
  return <ErrorPage errorType="404" showRetryButton={false} />
}
```

### Visual Features

- **Glitched error code** - Large display with RGB chromatic aberration
- **Grid background** - Subtle green grid overlay
- **Color gradient** - Error-specific radial gradient
- **Scanlines** - CRT monitor effect
- **Corner decorations** - Animated border corners
- **Floating fragments** - Decorative animated elements

---

## AshleyErrorTerminal

**Path**: `src/components/error/AshleyErrorTerminal.tsx`
**Type**: Client component

Terminal-style error display featuring Ashley's commentary with typewriter animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `ErrorConfig` | required | Error configuration object |
| `startDelay` | `number` | `800` | Delay before animation starts (ms) |
| `requestedPath` | `string \| null` | - | Actual requested path (for 404s) |

### Features

- **Sequential line reveal** - Terminal lines appear one by one (150ms apart)
- **Dynamic 404 content** - Generates custom output with actual requested path
- **Status badges** - Color-coded badges (OK/green, FAIL/red, etc.)
- **Typewriter messages** - Ashley's commentary animates character by character
- **Blinking cursor** - Terminal cursor after last line
- **Live indicator** - Red pulsing dot in header

---

## Error Configuration

**Path**: `src/components/error/error-config.ts`

### Supported Error Codes

| Code | Title | Color | Description |
|------|-------|-------|-------------|
| `404` | SIGNAL LOST | cyan | Target not found in database |
| `401` | ACCESS DENIED | magenta | Authentication required |
| `403` | RESTRICTED | red | Insufficient clearance level |
| `400` | MALFORMED | magenta | Invalid request syntax |
| `500` | SYSTEM CRASH | red | Internal error detected |
| `502` | UPSTREAM FAIL | cyan | Gateway received invalid response |
| `503` | OFFLINE | magenta | Service temporarily unavailable |

### ErrorConfig Interface

```typescript
interface ErrorConfig {
  code: ErrorCode
  title: string                    // Large title (e.g., "SIGNAL LOST")
  subtitle: string                 // Secondary description
  ashleyMessage: string[]          // Multi-line Ashley commentary
  terminalLog: TerminalLine[]      // Terminal output lines
  color: "red" | "cyan" | "magenta" // Primary color theme
  icon: LucideIcon                 // Error icon
  glitchColors: [string, string]   // RGB glitch effect colors
}
```

### TerminalLine Interface

```typescript
interface TerminalLine {
  prefix: "$" | ">" | "!"          // Command prompt style
  text: string                     // Line content
  status?: string                  // Optional status badge
  color: "green" | "cyan" | "magenta" | "red" | "yellow" | "white"
}
```

### Helper Function

```typescript
import { getErrorConfig } from "@/components/error/error-config"

// Returns config for code, falls back to 500 if unknown
const config = getErrorConfig("404")
```

---

## Page Implementations

### global-error.tsx

Catches errors in the root layout. Must include own `<html>` and `<body>` tags.

```tsx
"use client"

import { ErrorPage, ScanlineOverlay } from "@/components/error"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error("Global error:", error)

  return (
    <html lang="en" className="dark">
      <body className="dark bg-void text-foreground">
        <ScanlineOverlay />
        <ErrorPage errorType="500" reset={reset} />
      </body>
    </html>
  )
}
```

### (frontend)/error.tsx

Frontend route group error boundary. Inherits layout from parent.

```tsx
"use client"

import { ErrorPage } from "@/components/error"

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error("Frontend error:", error)
  return <ErrorPage errorType="500" reset={reset} />
}
```

### not-found.tsx

404 pages don't receive `reset` callback. Disable retry button.

```tsx
import { ErrorPage, ScanlineOverlay } from "@/components/error"

export default function NotFound() {
  return (
    <>
      <ScanlineOverlay />
      <ErrorPage errorType="404" showRetryButton={false} />
    </>
  )
}
```

---

## Dependencies

- **motion/react** - All animations (Framer Motion)
- **lucide-react** - Error icons (Skull, Lock, ServerCrash, etc.)
- **HeroGlitch** - Glitch effect for error code
- **TypeWriter** - Animated text reveal
- **GlowButton** - Styled action buttons

## Color Theming

Each error code maps to a primary color:

| Color | Used By | Tailwind Class |
|-------|---------|----------------|
| cyan | 404, 502 | `text-rga-cyan` |
| magenta | 401, 400, 503 | `text-rga-magenta` |
| red | 403, 500 | `text-red-500` |
