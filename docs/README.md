# RGA Web Documentation

Technical documentation for the Rogue Army gaming community website.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.4.10 |
| CMS | Payload CMS | 3.69.0 |
| Database | MongoDB (Mongoose) | - |
| Styling | Tailwind CSS v4 | 4.1.18 |
| Animation | Motion (Framer Motion) | 12.23.26 |
| UI Components | shadcn/ui | - |
| Runtime | Node.js | ^18.20.2 / >=20.9.0 |

## Quick Links

### Architecture
- [Overview](./architecture/OVERVIEW.md) - Folder structure, tech stack
- [Routing](./architecture/ROUTING.md) - Route groups, API endpoints
- [Payload CMS](./architecture/PAYLOAD.md) - Collections, hooks, patterns

### Design System
- [Colors](./design-system/COLORS.md) - Brand palette, CSS variables
- [Typography](./design-system/TYPOGRAPHY.md) - Font families, hierarchy
- [Animations](./design-system/ANIMATIONS.md) - Keyframes, Motion patterns
- [Utilities](./design-system/UTILITIES.md) - Custom Tailwind classes

### Components
- [Overview](./components/OVERVIEW.md) - Component organization
- [UI](./components/UI.md) - shadcn/ui components
- [Effects](./components/EFFECTS.md) - Glitch, scanlines, visual effects
- [Error Pages](./components/ERROR-PAGES.md) - Error handling, 404/500 pages
- [Shared](./components/SHARED.md) - Reusable components
- [Sections](./components/SECTIONS.md) - Homepage sections

### Guides
- [Development](./guides/DEVELOPMENT.md) - Setup, scripts, workflow
- [Deployment](./guides/DEPLOYMENT.md) - Vercel deployment

---

## Project Overview

RGA Web is a cyberpunk-themed landing page for a gaming community targeting adults 25+. Key characteristics:

- **Dark theme only** - No light mode variant
- **Neon aesthetic** - Green (#00FF41), Cyan (#00FFFF), Magenta (#FF00FF)
- **Heavy animation** - Scroll-driven effects, periodic glitches
- **Discord-centric** - Primary CTAs link to Discord invite

## Path Aliases

```typescript
// tsconfig.json
"@/*"           → "./src/*"
"@payload-config" → "./src/payload.config.ts"
```

## Directory Structure

```
rga-web/
├── src/
│   ├── app/
│   │   ├── (frontend)/     # Public routes
│   │   └── (payload)/      # Admin panel + API
│   ├── collections/        # Payload collections
│   ├── globals/            # Payload globals
│   ├── components/
│   │   ├── ui/             # shadcn/ui
│   │   ├── shared/         # Reusable
│   │   ├── effects/        # Visual effects
│   │   ├── error/          # Error pages
│   │   └── home/           # Homepage sections
│   └── lib/                # Utilities
├── public/
│   ├── fonts/              # Self-hosted fonts
│   └── images/             # Static assets
└── docs/                   # This documentation
```

## Essential Files

| File | Purpose |
|------|---------|
| `src/payload.config.ts` | CMS configuration |
| `src/app/globals.css` | Design tokens, animations |
| `CLAUDE.md` | AI agent instructions |
| `.env` | Environment variables |
