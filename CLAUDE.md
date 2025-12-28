# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000
pnpm devsafe          # Clean .next cache and start dev server

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
tsc --noEmit          # Validate TypeScript without emitting

# Type Generation (run after schema changes)
pnpm generate:types      # Generate payload-types.ts
pnpm generate:importmap  # Regenerate component import map

# Testing
pnpm test             # Run all tests (integration + e2e)
pnpm test:int         # Run integration tests (vitest)
pnpm test:e2e         # Run e2e tests (playwright)
```

## Architecture

This is a **Payload CMS 3.x** project running on **Next.js 15** with MongoDB.

### Route Structure

```
src/app/
├── (frontend)/       # Public-facing routes
│   ├── layout.tsx    # Frontend layout
│   └── page.tsx      # Homepage
└── (payload)/        # Payload admin panel
    ├── admin/        # Admin UI routes
    └── api/          # REST & GraphQL endpoints
```

### Payload Structure

```
src/
├── collections/      # Collection configs (Users, Media, etc.)
├── payload.config.ts # Main Payload configuration
└── payload-types.ts  # Auto-generated types (DO NOT EDIT)
```

### Recommended Additional Directories

When expanding the project, create:
- `src/access/` - Reusable access control functions
- `src/hooks/` - Collection and field hooks
- `src/globals/` - Global document configs
- `src/components/` - Custom admin components

## Critical Payload CMS Patterns

### Local API Security (CRITICAL)

```typescript
// WRONG - access control bypassed
await payload.find({ collection: 'posts', user: someUser })

// CORRECT - enforces permissions
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

**Rule**: When passing `user` to Local API, ALWAYS set `overrideAccess: false`

### Transaction Safety in Hooks

```typescript
// WRONG - separate transaction, breaks atomicity
await req.payload.create({ collection: 'logs', data: {...} })

// CORRECT - maintains transaction
await req.payload.create({ collection: 'logs', data: {...}, req })
```

**Rule**: ALWAYS pass `req` to nested operations in hooks

### Preventing Hook Loops

```typescript
hooks: {
  afterChange: [async ({ context, req, doc }) => {
    if (context.skipHooks) return
    await req.payload.update({
      ...
      context: { skipHooks: true },
      req,
    })
  }]
}
```

## Path Aliases

- `@/*` → `./src/*`
- `@payload-config` → `./src/payload.config.ts`

## Key Configuration

- **Database**: MongoDB (configured via `DATABASE_URL`)
- **Editor**: Lexical rich text editor
- **Image Processing**: Sharp
- **Auth Collection**: `users`

## Frontend Styling

- **Use Tailwind CSS** - No vanilla CSS for frontend components
- **Use shadcn/ui** - When UI components are needed (buttons, forms, dialogs, etc.)

## Extended Documentation

Detailed Payload CMS patterns are in:
- `AGENTS.md` - Comprehensive development rules
- `.cursor/rules/*.md` - Topic-specific guides (access control, hooks, components, etc.)
