# Development Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ^18.20.2 or >=20.9.0 |
| pnpm | ^9 or ^10 |
| MongoDB | Local or Atlas |

## Initial Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd rga-web
pnpm install
```

### 2. Environment Variables
Copy example and configure:
```bash
cp .env.example .env
```

Required variables:
```bash
# MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/rga-web

# Payload auth secret (min 32 chars)
PAYLOAD_SECRET=your-super-secret-key-at-least-32-chars

# Public URL (for CORS/redirects)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
pnpm dev
```

Access:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- GraphQL: http://localhost:3000/api/graphql-playground

## Available Scripts

### Development
```bash
pnpm dev        # Start dev server
pnpm devsafe    # Clean .next cache and start dev
```

Use `devsafe` when:
- Hot reload stops working
- Strange caching issues
- After major dependency updates

### Build & Production
```bash
pnpm build      # Build for production
pnpm start      # Start production server
```

### Code Quality
```bash
pnpm lint       # Run ESLint
tsc --noEmit    # TypeScript check (no emit)
```

### Type Generation
```bash
pnpm generate:types      # Generate payload-types.ts
pnpm generate:importmap  # Regenerate component imports
```

Run after:
- Adding/modifying collections
- Changing collection fields
- Modifying globals

### Testing
```bash
pnpm test       # Run all tests
pnpm test:int   # Integration tests (Vitest)
pnpm test:e2e   # E2E tests (Playwright)
```

## Development Workflow

### 1. Start Server
```bash
pnpm dev
```

### 2. Make Changes
- Frontend: `src/components/`, `src/app/(frontend)/`
- CMS: `src/collections/`, `src/payload.config.ts`
- Styles: `src/app/globals.css`

### 3. Check Types
```bash
tsc --noEmit
```

### 4. Lint
```bash
pnpm lint
```

### 5. Test
```bash
pnpm test
```

## Working with Payload CMS

### Create Admin User
On first run, visit `/admin` and create an account.

### Add Collection Field
1. Edit collection in `src/collections/`
2. Run `pnpm generate:types`
3. Use new types in components

### Local API Usage
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Query data
const posts = await payload.find({
  collection: 'posts',
  limit: 10,
})
```

## Working with Components

### Create New Component
1. Add file to appropriate directory
2. Export from `index.ts`
3. Import where needed

### Add shadcn Component
```bash
pnpm dlx shadcn@latest add [component]
```

Example:
```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
```

## Styling

### Add Tailwind Class
Use in component:
```tsx
<div className="bg-rga-green text-void">...</div>
```

### Add Custom Animation
Edit `src/app/globals.css`:
```css
@theme {
  --animate-custom: custom 2s ease infinite;

  @keyframes custom {
    0%, 100% { ... }
    50% { ... }
  }
}
```

### Add Utility Class
```css
@layer utilities {
  .my-utility {
    /* styles */
  }
}
```

## Debugging

### Hot Reload Not Working
```bash
pnpm devsafe
```

### TypeScript Errors After Schema Change
```bash
pnpm generate:types
```

### Payload Admin Not Loading
1. Check `DATABASE_URL` in `.env`
2. Ensure MongoDB is running
3. Check console for errors

### Styles Not Applying
1. Check class name spelling
2. Verify `globals.css` imports
3. Clear `.next` cache

## VS Code Setup

### Recommended Extensions
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

## Docker (Optional)

For local MongoDB:
```bash
docker-compose up -d
```

Starts MongoDB on port 27017.
