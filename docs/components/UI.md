# UI Components

Base UI components from shadcn/ui.

## Button

**Path**: `src/components/ui/button.tsx`
**Type**: Client Component

Extends Radix UI Slot with variant styling via CVA.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Visual style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `asChild` | `boolean` | `false` | Render as child element (Slot) |

### Variants

**default** - Primary green button
```tsx
<Button>Primary Action</Button>
```

**destructive** - Danger/warning actions
```tsx
<Button variant="destructive">Delete</Button>
```

**outline** - Bordered, transparent background
```tsx
<Button variant="outline">Secondary</Button>
```

**secondary** - Muted background
```tsx
<Button variant="secondary">Less Important</Button>
```

**ghost** - No background, hover reveals
```tsx
<Button variant="ghost">Subtle</Button>
```

**link** - Styled as text link
```tsx
<Button variant="link">Learn More</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### As Child Pattern

Render button styling on any element:
```tsx
<Button asChild>
  <a href="/about">Link styled as button</a>
</Button>
```

### Styling Details

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Adding New shadcn/ui Components

### Via CLI
```bash
pnpm dlx shadcn@latest add [component-name]
```

Example:
```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add input
```

### Manual Installation

1. Copy component from [ui.shadcn.com](https://ui.shadcn.com)
2. Place in `src/components/ui/`
3. Adjust imports:
   - `@/lib/utils` for `cn()`
   - `@/components/ui/button` for button dependency

### Configuration

shadcn/ui config in `components.json`:
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## CVA (class-variance-authority)

Pattern for creating variant-based components:

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-rga-green text-void",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
  children: React.ReactNode
}

export function Badge({ className, variant, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  )
}
```

Usage:
```tsx
<Badge>Default</Badge>
<Badge variant="success">Online</Badge>
```
