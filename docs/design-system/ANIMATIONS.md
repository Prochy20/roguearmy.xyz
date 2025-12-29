# Animations

## Custom Keyframe Animations

Defined in `src/app/globals.css` via `@theme` block:

### Glitch
**Class**: `animate-glitch`
**Duration**: 0.3s

Position jitter effect:
```css
@keyframes glitch {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
}
```

### Glitch Text
**Class**: `animate-glitch-text`
**Duration**: 0.15s

Opacity flicker with skew:
```css
@keyframes glitch-text {
  0%, 100% { opacity: 1; transform: skewX(0deg); }
  50% { opacity: 0.8; transform: skewX(0.5deg); }
}
```

### Glow Pulse
**Class**: `animate-glow-pulse`
**Duration**: 2s

Box-shadow pulse for CTAs:
```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--color-glow-green),
                0 0 40px var(--color-glow-green);
  }
  50% {
    box-shadow: 0 0 30px var(--color-glow-green),
                0 0 60px var(--color-glow-green),
                0 0 80px var(--color-glow-green);
  }
}
```

### Scanline
**Class**: `animate-scanline`
**Duration**: 4s

Vertical sweep from top to bottom:
```css
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
```

### RGB Shift
**Class**: `animate-rgb-shift`
**Duration**: 3s

Chromatic aberration oscillation:
```css
@keyframes rgb-shift {
  0%, 100% {
    text-shadow: -2px 0 var(--color-rga-cyan),
                  2px 0 var(--color-rga-magenta);
  }
  50% {
    text-shadow: 2px 0 var(--color-rga-cyan),
                 -2px 0 var(--color-rga-magenta);
  }
}
```

### Float
**Class**: `animate-float`
**Duration**: 6s

Gentle vertical hover:
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Blink
**Class**: `animate-blink`
**Duration**: 1s

Terminal cursor blink:
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### Bounce Slow
**Class**: `animate-bounce-slow`
**Duration**: 2s

Scroll indicator bounce:
```css
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}
```

### Ticker
**Class**: `animate-ticker`
**Duration**: 20s

Infinite horizontal scroll:
```css
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

## Motion Library Patterns

Using `motion` (Framer Motion) for React animations.

### Basic Animation
```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Scroll-Triggered (whileInView)
```tsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  Reveals on scroll
</motion.div>
```

### useScroll + useTransform
```tsx
import { motion, useScroll, useTransform } from "motion/react"

function ParallaxSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <motion.div style={{ y }}>
      Parallax content
    </motion.div>
  )
}
```

### useSpring for Smoothing
```tsx
import { useScroll, useSpring, useTransform } from "motion/react"

const { scrollYProgress } = useScroll()
const smoothProgress = useSpring(scrollYProgress, {
  stiffness: 100,
  damping: 30,
})
const y = useTransform(smoothProgress, [0, 1], [0, -60])
```

### AnimatePresence for Exit Animations
```tsx
import { motion, AnimatePresence } from "motion/react"

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Fades in and out
    </motion.div>
  )}
</AnimatePresence>
```

### useMotionValueEvent for Callbacks
```tsx
import { useScroll, useMotionValueEvent } from "motion/react"

const { scrollYProgress } = useScroll()

useMotionValueEvent(scrollYProgress, "change", (latest) => {
  if (latest > 0.5) {
    // Trigger action at 50% scroll
  }
})
```

## Animation Easing

### Custom Easing (ScrollReveal)
```tsx
transition={{
  ease: [0.25, 0.46, 0.45, 0.94],  // easeOutQuad
  duration: 0.6,
}}
```

### Spring Physics
```tsx
transition={{
  type: "spring",
  stiffness: 100,
  damping: 30,
}}
```

## Performance Tips

1. **Use `transform` and `opacity`** - Hardware accelerated
2. **Avoid animating `width`/`height`** - Causes layout thrashing
3. **Use `will-change: transform`** - Hint browser for optimization
4. **Set `pointer-events: none`** - On decorative overlays
5. **Use `viewport={{ once: true }}`** - For one-time animations

## Animation Patterns in Codebase

| Pattern | Component | Trigger |
|---------|-----------|---------|
| 4-Phase Glitch | HeroGlitch | Timer (3-8s) |
| Scroll Parallax | SectionGlitch | useScroll |
| Staggered Reveal | ScrollRevealContainer | whileInView |
| Typewriter | TypeWriter | Timer |
| Counter Animation | StatsTicker | IntersectionObserver |
| Infinite Loop | StatsTicker (ticker) | CSS animation |
