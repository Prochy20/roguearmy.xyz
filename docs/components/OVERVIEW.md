# Components Overview

## Directory Structure

```
src/components/
├── ui/           # shadcn/ui base components
│   └── button.tsx
├── shared/       # Reusable across pages
│   ├── GlowButton.tsx
│   ├── ScrollReveal.tsx
│   ├── DiscordIcon.tsx
│   └── index.ts
├── effects/      # Visual effect components
│   ├── HeroGlitch.tsx
│   ├── SectionGlitch.tsx
│   ├── ScanlineOverlay.tsx
│   ├── GlitchText.tsx
│   ├── ChromaticText.tsx
│   ├── TypeWriter.tsx
│   └── index.ts
└── home/         # Homepage section components
    ├── Hero.tsx
    ├── GamesShowcase.tsx
    ├── StatsTicker.tsx
    ├── CommunityValues.tsx
    ├── AshleyTerminal.tsx
    ├── FinalCTA.tsx
    └── index.ts
```

## Component Categories

| Category | Purpose | Client/Server |
|----------|---------|---------------|
| `ui/` | Base UI primitives (shadcn/ui) | Client |
| `shared/` | Reusable across multiple pages | Client |
| `effects/` | Visual effects and animations | Client |
| `home/` | Homepage section compositions | Client |

## Barrel Exports

Each directory has an `index.ts` for clean imports:

```typescript
// src/components/shared/index.ts
export { GlowButton } from "./GlowButton"
export { ScrollReveal, ScrollRevealContainer, ScrollRevealItem } from "./ScrollReveal"
export { DiscordIcon } from "./DiscordIcon"
```

Usage:
```typescript
import { GlowButton, ScrollReveal } from "@/components/shared"
import { HeroGlitch, TypeWriter } from "@/components/effects"
import { Hero, GamesShowcase } from "@/components/home"
```

## Client vs Server Components

All components in this project are **client components** (`"use client"`).

Reasons:
- Use Motion library animations (requires React hooks)
- Use browser APIs (IntersectionObserver, setTimeout)
- Use React state and effects

If you need a server component, don't add `"use client"` directive.

## Component Conventions

### File Naming
- PascalCase for component files: `GlowButton.tsx`
- Lowercase for utility files: `index.ts`

### Component Structure
```tsx
"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ComponentProps {
  // Props with JSDoc comments
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("base-classes", className)} {...props}>
        {/* Content */}
      </div>
    )
  }
)

Component.displayName = "Component"
```

### Using `cn()` Utility
Always use `cn()` for className merging:
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-styles",
  condition && "conditional-styles",
  className  // Allow override from props
)} />
```

## Adding New Components

### 1. Create Component File
```tsx
// src/components/shared/NewComponent.tsx
"use client"

import { cn } from "@/lib/utils"

interface NewComponentProps {
  children: React.ReactNode
  className?: string
}

export function NewComponent({ children, className }: NewComponentProps) {
  return (
    <div className={cn("default-styles", className)}>
      {children}
    </div>
  )
}
```

### 2. Export from Index
```typescript
// src/components/shared/index.ts
export { NewComponent } from "./NewComponent"
```

### 3. Use in Page
```tsx
import { NewComponent } from "@/components/shared"

<NewComponent>Content</NewComponent>
```

## Component Documentation Pattern

Each component doc should include:

1. **Path & Type** - Location and client/server status
2. **Props Table** - Name, type, default, description
3. **Usage Examples** - Basic and common patterns
4. **Notes** - Key behaviors, gotchas
