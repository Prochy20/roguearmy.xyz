# RGA Web

Cyberpunk-themed landing page for the Rogue Army gaming community.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.x
- **Database**: MongoDB
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animation**: Motion (Framer Motion)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

Access:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- **[Documentation Index](./docs/README.md)** - Start here

### Architecture
- [Overview](./docs/architecture/OVERVIEW.md) - Project structure
- [Routing](./docs/architecture/ROUTING.md) - Route groups, API
- [Payload CMS](./docs/architecture/PAYLOAD.md) - Collections, patterns

### Design System
- [Colors](./docs/design-system/COLORS.md) - Brand palette
- [Typography](./docs/design-system/TYPOGRAPHY.md) - Fonts
- [Animations](./docs/design-system/ANIMATIONS.md) - Keyframes, Motion
- [Utilities](./docs/design-system/UTILITIES.md) - Custom classes

### Components
- [Overview](./docs/components/OVERVIEW.md) - Organization
- [UI](./docs/components/UI.md) - shadcn/ui
- [Effects](./docs/components/EFFECTS.md) - Glitch, scanlines
- [Shared](./docs/components/SHARED.md) - Reusable components
- [Sections](./docs/components/SECTIONS.md) - Homepage sections

### Guides
- [Development](./docs/guides/DEVELOPMENT.md) - Setup, workflow
- [Deployment](./docs/guides/DEPLOYMENT.md) - Vercel deployment

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm generate:types   # Generate Payload types
pnpm test             # Run all tests
```

## Environment Variables

```bash
DATABASE_URL=mongodb://...      # MongoDB connection
PAYLOAD_SECRET=xxx              # Auth secret (32+ chars)
NEXT_PUBLIC_SERVER_URL=https://...  # Production URL
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/     # Public routes
│   └── (payload)/      # Admin + API
├── collections/        # Payload collections
├── components/
│   ├── ui/             # shadcn/ui
│   ├── shared/         # Reusable
│   ├── effects/        # Visual effects
│   └── home/           # Homepage sections
└── lib/                # Utilities
```

## License

MIT
