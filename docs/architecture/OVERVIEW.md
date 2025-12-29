# Architecture Overview

## Folder Structure

```
rga-web/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (frontend)/               # Public routes (grouped)
│   │   │   ├── layout.tsx            # Frontend layout + metadata
│   │   │   └── page.tsx              # Homepage
│   │   ├── (payload)/                # Payload admin (grouped)
│   │   │   ├── admin/                # Admin UI
│   │   │   │   └── [[...segments]]/  # Catch-all admin routes
│   │   │   └── api/                  # REST + GraphQL
│   │   ├── globals.css               # Tailwind v4 + theme
│   │   ├── robots.ts                 # SEO robots.txt
│   │   └── sitemap.ts                # SEO sitemap
│   │
│   ├── collections/                  # Payload collections
│   │   ├── Users.ts                  # Auth-enabled users
│   │   └── Media.ts                  # File uploads
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   └── button.tsx
│   │   ├── shared/                   # Reusable components
│   │   │   ├── GlowButton.tsx
│   │   │   ├── ScrollReveal.tsx
│   │   │   ├── DiscordIcon.tsx
│   │   │   └── index.ts
│   │   ├── effects/                  # Visual effects
│   │   │   ├── HeroGlitch.tsx
│   │   │   ├── SectionGlitch.tsx
│   │   │   ├── ScanlineOverlay.tsx
│   │   │   ├── GlitchText.tsx
│   │   │   ├── ChromaticText.tsx
│   │   │   ├── TypeWriter.tsx
│   │   │   └── index.ts
│   │   └── home/                     # Homepage sections
│   │       ├── Hero.tsx
│   │       ├── GamesShowcase.tsx
│   │       ├── StatsTicker.tsx
│   │       ├── CommunityValues.tsx
│   │       ├── AshleyTerminal.tsx
│   │       ├── FinalCTA.tsx
│   │       └── index.ts
│   │
│   ├── lib/
│   │   └── utils.ts                  # cn() helper
│   │
│   ├── payload.config.ts             # Payload configuration
│   └── payload-types.ts              # Auto-generated (DO NOT EDIT)
│
├── public/
│   ├── fonts/
│   │   └── Hanson-Bold.otf           # Self-hosted display font
│   └── images/
│       └── ...
│
├── Configuration
│   ├── next.config.mjs               # Next.js + Payload wrapper
│   ├── tsconfig.json                 # TypeScript + path aliases
│   ├── postcss.config.mjs            # Tailwind v4 plugin
│   ├── components.json               # shadcn/ui config
│   ├── vitest.config.mts             # Integration tests
│   ├── playwright.config.ts          # E2E tests
│   └── eslint.config.mjs             # ESLint
│
└── package.json
```

## Tech Stack Details

### Core Framework
- **Next.js 15.4.10** - App Router with RSC
- **React 19.2.1** - Latest React with concurrent features
- **TypeScript 5.7.3** - Strict mode enabled

### CMS Layer
- **Payload CMS 3.69.0** - Headless CMS
- **MongoDB** - Document database (via Mongoose adapter)
- **Lexical Editor** - Rich text editing
- **Sharp** - Image optimization

### Styling
- **Tailwind CSS 4.1.18** - CSS-first configuration
- **PostCSS** - Via `@tailwindcss/postcss`
- **shadcn/ui** - Radix-based UI components
- **Motion 12.23.26** - Animation library

### Testing
- **Vitest 3.2.3** - Unit/integration tests
- **Playwright 1.56.1** - E2E tests

## Path Aliases

Defined in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@payload-config": ["./src/payload.config.ts"]
  }
}
```

Usage:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import payload from "@payload-config"
```

## Configuration Files

### next.config.mjs
- Wraps config with `withPayload()` for CMS integration
- Marks `sharp` as external (serverless requirement)
- Enables AVIF/WebP image formats

### globals.css
- All design tokens via `@theme` block
- Custom keyframe animations
- Utility classes (glows, chromatic, noise)
- shadcn/ui CSS variables

### components.json
- RSC mode enabled
- Tailwind CSS with CSS variables
- Aliases for `@/components`, `@/lib/utils`, `@/components/ui`

## Environment Variables

Required (`.env`):
```bash
DATABASE_URL=mongodb://...      # MongoDB connection
PAYLOAD_SECRET=xxx              # Min 32 chars, for auth
NEXT_PUBLIC_SERVER_URL=https://... # Production URL
```

## Key Patterns

### Barrel Exports
Components use `index.ts` files for clean imports:
```typescript
// src/components/shared/index.ts
export { GlowButton } from "./GlowButton"
export { ScrollReveal } from "./ScrollReveal"
export { DiscordIcon } from "./DiscordIcon"

// Usage
import { GlowButton, ScrollReveal } from "@/components/shared"
```

### Client vs Server Components
- Effects (`use client`) - Need browser APIs, animation hooks
- Sections (`use client`) - Use Motion animations
- UI components (`use client`) - Interactive elements
- Layout/Page - Server by default
