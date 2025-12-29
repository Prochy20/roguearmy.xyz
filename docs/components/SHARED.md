# Shared Components

Reusable components used across multiple pages.

## GlowButton

**Path**: `src/components/shared/GlowButton.tsx`
**Type**: Client Component

CTA button with neon glow effect. Extends shadcn Button.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glowColor` | `'green' \| 'cyan' \| 'magenta'` | `'green'` | Glow color theme |
| `pulse` | `boolean` | `true` | Enable pulse animation |
| `...ButtonProps` | - | - | All shadcn Button props |

### Usage
```tsx
import { GlowButton } from "@/components/shared"

// Primary CTA (green glow)
<GlowButton>JOIN DISCORD</GlowButton>

// Cyan variant
<GlowButton glowColor="cyan">LEARN MORE</GlowButton>

// No pulse
<GlowButton pulse={false}>STATIC GLOW</GlowButton>

// With size
<GlowButton size="lg">BIG BUTTON</GlowButton>
```

### Styling Details
- Background: Solid brand color
- Text: Dark (void color)
- Shadow: 20px + 40px glow
- Hover: 30px + 60px intensified glow
- Font: Bold, uppercase, wider tracking

---

## ScrollReveal

**Path**: `src/components/shared/ScrollReveal.tsx`
**Type**: Client Component

Scroll-triggered reveal animations using Motion's `whileInView`.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content to reveal |
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'none'` | `'up'` | Entrance direction |
| `delay` | `number` | `0` | Delay in seconds |
| `duration` | `number` | `0.6` | Animation duration (s) |
| `threshold` | `number` | `0.2` | Viewport visibility (0-1) |
| `className` | `string` | - | Additional classes |

### Usage
```tsx
import { ScrollReveal } from "@/components/shared"

// Fade up (default)
<ScrollReveal>
  <h2>Revealed on scroll</h2>
</ScrollReveal>

// From left
<ScrollReveal direction="left">
  <p>Slides in from left</p>
</ScrollReveal>

// With delay
<ScrollReveal delay={0.3}>
  <p>Delayed reveal</p>
</ScrollReveal>

// Fade only (no movement)
<ScrollReveal direction="none">
  <p>Just fades in</p>
</ScrollReveal>
```

### ScrollRevealContainer + ScrollRevealItem

For staggered animations:

```tsx
import { ScrollRevealContainer, ScrollRevealItem } from "@/components/shared"

<ScrollRevealContainer staggerDelay={0.1}>
  <ScrollRevealItem><Card>First</Card></ScrollRevealItem>
  <ScrollRevealItem><Card>Second</Card></ScrollRevealItem>
  <ScrollRevealItem><Card>Third</Card></ScrollRevealItem>
</ScrollRevealContainer>
```

Items appear sequentially with configurable stagger.

### ScrollRevealItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content |
| `direction` | Same as ScrollReveal | `'up'` | Entrance direction |
| `className` | `string` | - | Additional classes |

### Notes
- Uses easeOutQuad easing: `[0.25, 0.46, 0.45, 0.94]`
- Viewport margin: `-100px` (triggers early)
- Once triggered, stays revealed

---

## DiscordIcon

**Path**: `src/components/shared/DiscordIcon.tsx`
**Type**: Client Component

Official Discord logo as SVG icon.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Size and color classes |
| `...SVGProps` | - | - | Standard SVG attributes |

### Usage
```tsx
import { DiscordIcon } from "@/components/shared"

// Default size
<DiscordIcon />

// With size
<DiscordIcon className="w-6 h-6" />

// With color
<DiscordIcon className="w-8 h-8 text-rga-green" />

// In button
<GlowButton>
  <DiscordIcon className="w-5 h-5 mr-2" />
  JOIN DISCORD
</GlowButton>
```

### Notes
- Uses `currentColor` for fill (inherits text color)
- Properly hidden from screen readers (`aria-hidden="true"`)
- Lucide-style API (same props pattern)
