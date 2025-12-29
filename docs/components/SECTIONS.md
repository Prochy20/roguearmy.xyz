# Homepage Sections

Section components that compose the homepage.

## Section Order

```tsx
// src/app/(frontend)/page.tsx
<main>
  <Hero />              {/* Full viewport landing */}
  <GamesShowcase />     {/* Games we play */}
  <StatsTicker />       {/* Scrolling stats */}
  <CommunityValues />   {/* Philosophy + image */}
  <AshleyTerminal />    {/* 280vh interactive narrative */}
  <FinalCTA />          {/* Final call-to-action */}
</main>
```

---

## Hero

**Path**: `src/components/home/Hero.tsx`
**Type**: Client Component

Full-viewport landing section with animated logo and CTAs.

### Visual Elements
- Animated logo with RGB ghost copies (hue-rotated)
- Logo bobbing animation (4s cycle)
- GIGANTIQUE title split into two lines:
  - "ROGUE" (white, HeroGlitch)
  - "ARMY" (green glow, HeroGlitch)
- Typewriter tagline
- Discord invite CTA button
- Scroll indicator at bottom

### Sizing
```tsx
<span className="text-[12vw] md:text-[10vw] lg:text-[8vw]">
  ROGUE
</span>
```

### Background
```tsx
// Radial gradients for ambient glow
radial-gradient(ellipse at 80% 50%, rgba(0,255,65,0.15) 0%, transparent 50%)
radial-gradient(ellipse at 60% 40%, rgba(0,255,255,0.1) 0%, transparent 40%)
radial-gradient(ellipse at 40% 30%, rgba(255,0,255,0.08) 0%, transparent 30%)
```

---

## GamesShowcase

**Path**: `src/components/home/GamesShowcase.tsx`
**Type**: Client Component

Horizontal strips showcasing games the community plays.

### Games Data
| Game | Color | Featured |
|------|-------|----------|
| The Division 2 | Orange | Yes (Main Game) |
| Battlefield 6 | Blue | No |
| Helldivers 2 | Yellow | No |
| Sea of Thieves | Teal | No |

### Visual Features
- Full-width colored strips
- Skewed text (`skewX(-3deg)`)
- Hover background glow
- "Main Game" badge on featured

### Strip Structure
```tsx
<div className="group relative py-8 md:py-12 overflow-hidden">
  <div className="container mx-auto">
    <span className="text-4xl md:text-6xl lg:text-8xl font-display transform -skew-x-3">
      THE DIVISION 2
    </span>
  </div>
</div>
```

---

## StatsTicker

**Path**: `src/components/home/StatsTicker.tsx`
**Type**: Client Component

Infinite scrolling stats display with animated counters.

### Stats Displayed
- 200+ MEMBERS
- 5 YEARS ACTIVE
- 1000+ RAIDS COMPLETED
- 8 GAMES SUPPORTED
- 15+ COUNTRIES

### Features
- Infinite loop animation (30s duration)
- Duplicated stats for seamless loop
- Counter animation on viewport entry
- Scanline background effect

### Counter Animation
```tsx
// Uses IntersectionObserver
// Counts from 0 to value over 60 steps in 2s
useEffect(() => {
  const duration = 2000
  const steps = 60
  const increment = value / steps
  // ...animate
}, [inView])
```

---

## CommunityValues

**Path**: `src/components/home/CommunityValues.tsx`
**Type**: Client Component

Brand values and philosophy section.

### Content Structure
- Headline: "NOT YOUR AVERAGE CLAN" (ChromaticText)
- Three value pillars with icons:
  1. **Shield** - Drama-Free Zone (green)
  2. **Users** - Adults Only 25+ (cyan)
  3. **Heart** - Friendship First (magenta)
- Banner image with RGB ghost effect
- Scanline overlay on image

### Value Card Pattern
```tsx
<ScrollRevealItem>
  <div className="text-center p-6">
    <ShieldCheck className="w-12 h-12 text-rga-green mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">Drama-Free Zone</h3>
    <p className="text-text-secondary">
      Leave the toxicity at the door.
    </p>
  </div>
</ScrollRevealItem>
```

---

## AshleyTerminal

**Path**: `src/components/home/AshleyTerminal.tsx`
**Type**: Client Component

**Most complex component.** Scroll-controlled "system breach" narrative.

### Height & Scroll
- Total height: 280vh (allows extended scroll animation)
- Uses `position: fixed` during animation
- Scroll progress drives all animations

### 4 Phases (across 82% of scroll)

**PHASE 1: ERROR (0-25%)**
- Big "ERROR" text with glitch fragments
- Animated glitch bars
- Scattered pixels
- Red/cyan chromatic effect

**PHASE 2: BREACH (18-42%)**
- Terminal window with green borders
- 6 hack lines appearing sequentially
- Animated progress bar (0-100%)
- Blinking cursor

**PHASE 3: ASHLEY TAKEOVER (35-80%)**
- Full takeover screen with window chrome
- Ashley avatar with periodic RGB glitch
- "I'M IN." headline
- Scroll-controlled typewriter message
- 4 skill progress bars:
  - Raid Coordination (95%)
  - Build Assistance (88%)
  - Meme Generation (100%)
  - Drama Prevention (99%)
- Background code typewriter (40 lines)

**PHASE 4: EXIT (72%+)**
- Command line terminal
- Types "./continue.sh" character by character
- Execution output with scroll indicator

### Technical Patterns
```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end end"]
})

// Phase calculations
const phase = useTransform(scrollYProgress, [0, 0.25, 0.42, 0.72, 1], [1, 1, 2, 3, 4])

// Text reveal based on scroll
useMotionValueEvent(scrollYProgress, "change", (latest) => {
  const charIndex = Math.floor(latest * message.length)
  setRevealedText(message.slice(0, charIndex))
})
```

---

## FinalCTA

**Path**: `src/components/home/FinalCTA.tsx`
**Type**: Client Component

Final call-to-action section with footer.

### Content
- Split headline: "READY TO GO ROGUE?"
- Subtitle with member count
- Large glowing Discord button
- Footer with copyright and build credit

### Structure
```tsx
<section>
  <SectionGlitch intensity="medium" />

  <ScrollReveal>
    <h2>
      READY TO <GlitchText>GO</GlitchText> ROGUE?
    </h2>
  </ScrollReveal>

  <ScrollReveal delay={0.2}>
    <GlowButton size="lg">
      <DiscordIcon />
      JOIN DISCORD
    </GlowButton>
  </ScrollReveal>

  <footer>
    © 2024 Rogue Army. Built with ❤️
  </footer>
</section>
```

---

## Adding New Sections

1. Create component in `src/components/home/`:
```tsx
"use client"

import { ScrollReveal } from "@/components/shared"
import { SectionGlitch } from "@/components/effects"

export function NewSection() {
  return (
    <section className="relative py-24 bg-bg-primary">
      <SectionGlitch />
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-4xl font-display">NEW SECTION</h2>
        </ScrollReveal>
      </div>
    </section>
  )
}
```

2. Export from index:
```tsx
// src/components/home/index.ts
export { NewSection } from "./NewSection"
```

3. Add to page:
```tsx
// src/app/(frontend)/page.tsx
import { ..., NewSection } from "@/components/home"

<main>
  ...
  <NewSection />
  <FinalCTA />
</main>
```
