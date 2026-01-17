/**
 * Article types and mock data for the members articles section.
 * This will be replaced with Payload CMS integration later.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ArticleCategory {
  slug: string
  name: string
  tint: 'orange' | 'red' | 'cyan' | 'green' | 'magenta'
}

export interface ArticleTag {
  slug: string
  name: string
}

export interface ArticleImage {
  url: string
  alt: string
}

export interface ArticleSeries {
  name: string // "Getting Started with PoE 2"
  slug: string // "poe2-getting-started"
  order: number // 1, 2, 3...
}

export interface Article {
  id: string
  slug: string
  title: string
  perex: string
  content: string
  heroImage: ArticleImage
  category: ArticleCategory
  tags: ArticleTag[]
  publishedAt: Date
  readingTime: number
  series?: ArticleSeries // Optional series info
}

export interface FilterState {
  categories: string[]
  tags: string[]
  search: string
}

// ============================================================================
// CATEGORIES & TAGS
// ============================================================================

export const CATEGORIES: ArticleCategory[] = [
  { slug: 'path-of-exile', name: 'Path of Exile', tint: 'orange' },
  { slug: 'path-of-exile-2', name: 'Path of Exile 2', tint: 'orange' },
  { slug: 'diablo-4', name: 'Diablo 4', tint: 'red' },
  { slug: 'last-epoch', name: 'Last Epoch', tint: 'cyan' },
  { slug: 'community', name: 'Community', tint: 'cyan' },
  { slug: 'general', name: 'General', tint: 'green' },
]

export const TAGS: ArticleTag[] = [
  { slug: 'guide', name: 'Guide' },
  { slug: 'build', name: 'Build' },
  { slug: 'news', name: 'News' },
  { slug: 'beginner', name: 'Beginner' },
  { slug: 'advanced', name: 'Advanced' },
  { slug: 'event', name: 'Event' },
  { slug: 'update', name: 'Update' },
]

// ============================================================================
// MOCK ARTICLES
// ============================================================================

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'poe2-ranger-deadeye-build-guide',
    title: 'RANGER DEADEYE BUILD: LIGHTNING ARROW DOMINATION',
    perex:
      'Master the art of the Deadeye with this comprehensive Lightning Arrow build. Perfect for blasting through maps at incredible speed while maintaining solid single-target damage for boss encounters.',
    content: `
# Introduction

The Deadeye ascendancy has always been about precision and speed. In Path of Exile 2, these concepts have been refined into something truly special.

## Skill Setup

### Main Skill: Lightning Arrow
- Link with Greater Multiple Projectiles for clear
- Swap to Slower Projectiles for bosses

### Support Links
1. Added Lightning Damage
2. Elemental Damage with Attacks
3. Pierce
4. Critical Strikes

## Gear Priorities

Focus on these stats in order:
- Elemental Damage with Attacks
- Critical Strike Chance
- Attack Speed
- Life

## Playstyle Tips

The key to this build is maintaining distance. Use your mobility skills to kite enemies while raining down electrified arrows.
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop',
      alt: 'Lightning Arrow Build',
    },
    category: CATEGORIES.find((c) => c.slug === 'path-of-exile-2')!,
    tags: [
      TAGS.find((t) => t.slug === 'build')!,
      TAGS.find((t) => t.slug === 'guide')!,
    ],
    publishedAt: new Date('2026-01-15'),
    readingTime: 8,
    series: {
      name: 'PoE 2 Build Mastery',
      slug: 'poe2-build-mastery',
      order: 2,
    },
  },
  {
    id: '2',
    slug: 'rga-season-4-announcement',
    title: 'SEASON 4 KICKS OFF: NEW CHALLENGES AWAIT',
    perex:
      'The Rogue Army is gearing up for an exciting new season. Join us as we reveal new community events, racing competitions, and exclusive member rewards.',
    content: `
# Season 4 is Here!

We're thrilled to announce the launch of RGA Season 4, packed with new content and exciting community events.

## What's New

### Community Races
Every weekend, we'll host speed-running competitions with prizes for top performers.

### Build Showcases
Share your most creative builds and get featured on our community page.

### Member Rewards
Exclusive cosmetics and recognition for active participants.

## Schedule

- Week 1: Launch Party & First Race
- Week 2: Build Competition Opens
- Week 3: Community Showcase Stream
- Week 4: Season Finals

Get ready to prove yourself!
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop',
      alt: 'Season 4 Announcement',
    },
    category: CATEGORIES.find((c) => c.slug === 'community')!,
    tags: [
      TAGS.find((t) => t.slug === 'event')!,
      TAGS.find((t) => t.slug === 'news')!,
    ],
    publishedAt: new Date('2026-01-14'),
    readingTime: 4,
  },
  {
    id: '3',
    slug: 'd4-necromancer-minion-army',
    title: 'NECROMANCER MINION ARMY: ULTIMATE LAZY BUILD',
    perex:
      'Let your undead army do all the work. This Necromancer build focuses on maximizing minion damage while you sit back and collect loot.',
    content: `
# The Ultimate Minion Master

Why fight when you can have others fight for you? This Necromancer build creates an unstoppable army of the dead.

## Core Skills

### Raise Skeleton
Your bread and butter. Keep these guys up at all times.

### Corpse Explosion
For when enemies get too close.

### Bone Storm
Defensive layer that also damages.

## Paragon Points

Focus the Bone Graft board for maximum minion scaling.

## Gear

Look for:
- +Minion Damage
- +Skeleton Warriors
- Intelligence
- Cooldown Reduction
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop',
      alt: 'Necromancer Build',
    },
    category: CATEGORIES.find((c) => c.slug === 'diablo-4')!,
    tags: [
      TAGS.find((t) => t.slug === 'build')!,
      TAGS.find((t) => t.slug === 'beginner')!,
    ],
    publishedAt: new Date('2026-01-12'),
    readingTime: 6,
    series: {
      name: 'PoE 2 Build Mastery',
      slug: 'poe2-build-mastery',
      order: 1,
    },
  },
  {
    id: '4',
    slug: 'poe-currency-farming-guide-2026',
    title: 'CURRENCY FARMING: MAXIMIZING YOUR DIVINE DROPS',
    perex:
      'Learn the most efficient strategies for farming currency in the current league. From map strategies to crafting flips, we cover it all.',
    content: `
# Currency Farming Meta

Divine Orbs remain the premium currency. Here's how to farm them efficiently.

## Top Strategies

### 1. High-Tier Map Farming
Run T16 maps with good density. Focus on:
- Beyond
- Delirium
- Breach

### 2. Boss Farming
Certain bosses have favorable drop tables:
- Maven
- Sirus
- The Feared

### 3. Crafting Services
Offer your bench crafts for tips.

## Expected Returns

With optimal play, expect 5-10 Divines per hour of focused farming.
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=600&fit=crop',
      alt: 'Currency Farming Guide',
    },
    category: CATEGORIES.find((c) => c.slug === 'path-of-exile')!,
    tags: [
      TAGS.find((t) => t.slug === 'guide')!,
      TAGS.find((t) => t.slug === 'advanced')!,
    ],
    publishedAt: new Date('2026-01-10'),
    readingTime: 10,
  },
  {
    id: '5',
    slug: 'last-epoch-1-2-patch-notes',
    title: 'LAST EPOCH 1.2: EVERYTHING YOU NEED TO KNOW',
    perex:
      'The latest patch brings massive changes to endgame content. Here is our breakdown of the most impactful changes for your builds.',
    content: `
# Patch 1.2 Breakdown

Eleventh Hour Games delivered a massive update. Let's dive in.

## New Content

### The Forgotten Era
A new timeline with challenging encounters and exclusive loot.

### Legendary Potential Rework
Items can now roll higher LP values with the new system.

## Balance Changes

### Buffs
- Warlock skills across the board
- Paladin healing effectiveness

### Nerfs
- Glacier Shatter Mage damage
- Some defensive layers

## Quality of Life

- Improved loot filters
- Better stash organization
- Faster load times
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop',
      alt: 'Last Epoch Patch Notes',
    },
    category: CATEGORIES.find((c) => c.slug === 'last-epoch')!,
    tags: [
      TAGS.find((t) => t.slug === 'update')!,
      TAGS.find((t) => t.slug === 'news')!,
    ],
    publishedAt: new Date('2026-01-08'),
    readingTime: 7,
  },
  {
    id: '6',
    slug: 'arpg-beginners-guide',
    title: 'NEW TO ARPGS? START HERE',
    perex:
      'A comprehensive guide for newcomers to the action RPG genre. Learn the fundamentals that apply across Path of Exile, Diablo, Last Epoch, and more.',
    content: `
# Welcome to the Genre

ARPGs are about one thing: getting stronger. Here's how.

## Core Concepts

### The Loot Loop
Kill monsters -> Get gear -> Kill stronger monsters -> Repeat

### Build Planning
Every character needs:
- A main damage skill
- Defensive layers
- Movement ability

### Economy
Most ARPGs have trading. Learn what's valuable.

## Game Recommendations

### For Beginners
- Diablo 4 (most accessible)
- Last Epoch (great tutorial)

### For Veterans
- Path of Exile (deepest systems)
- Path of Exile 2 (next evolution)

## Join the Community

The best way to learn is from others. Join our Discord!
    `,
    heroImage: {
      url: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200&h=600&fit=crop',
      alt: 'ARPG Beginners Guide',
    },
    category: CATEGORIES.find((c) => c.slug === 'general')!,
    tags: [
      TAGS.find((t) => t.slug === 'guide')!,
      TAGS.find((t) => t.slug === 'beginner')!,
    ],
    publishedAt: new Date('2026-01-05'),
    readingTime: 5,
    series: {
      name: 'PoE 2 Build Mastery',
      slug: 'poe2-build-mastery',
      order: 3,
    },
  },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get category tint classes for styling
 */
export function getCategoryTintClasses(tint: ArticleCategory['tint']) {
  const tintMap = {
    orange: {
      border: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-500/60',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    },
    red: {
      border: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/60',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    },
    cyan: {
      border: 'border-rga-cyan/30',
      hoverBorder: 'hover:border-rga-cyan/60',
      bg: 'bg-rga-cyan/10',
      text: 'text-rga-cyan',
      glow: 'hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]',
    },
    green: {
      border: 'border-rga-green/30',
      hoverBorder: 'hover:border-rga-green/60',
      bg: 'bg-rga-green/10',
      text: 'text-rga-green',
      glow: 'hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]',
    },
    magenta: {
      border: 'border-rga-magenta/30',
      hoverBorder: 'hover:border-rga-magenta/60',
      bg: 'bg-rga-magenta/10',
      text: 'text-rga-magenta',
      glow: 'hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]',
    },
  }
  return tintMap[tint]
}

/**
 * Filter articles by category, tags, and search
 */
export function filterArticles(
  articles: Article[],
  filters: FilterState
): Article[] {
  return articles.filter((article) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(article.category.slug)
    ) {
      return false
    }

    // Tag filter
    if (filters.tags.length > 0) {
      const articleTagSlugs = article.tags.map((t) => t.slug)
      if (!filters.tags.some((tag) => articleTagSlugs.includes(tag))) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = article.title.toLowerCase().includes(searchLower)
      const matchesPerex = article.perex.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesPerex) {
        return false
      }
    }

    return true
  })
}

/**
 * Format date for display
 */
export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get article by slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return MOCK_ARTICLES.find((article) => article.slug === slug)
}

// ============================================================================
// SERIES FUNCTIONS
// ============================================================================

export interface SeriesNavigation {
  seriesName: string
  seriesSlug: string
  currentOrder: number
  totalParts: number
  previous: Article | null
  next: Article | null
}

/**
 * Get all articles in a series, sorted by order
 */
export function getArticlesBySeries(seriesSlug: string): Article[] {
  return MOCK_ARTICLES.filter((article) => article.series?.slug === seriesSlug).sort(
    (a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0)
  )
}

/**
 * Get series navigation for an article (prev/next articles in series)
 * Returns null if the article is not part of a series
 */
export function getSeriesNavigation(article: Article): SeriesNavigation | null {
  if (!article.series) return null

  const seriesArticles = getArticlesBySeries(article.series.slug)

  if (seriesArticles.length < 2) return null

  const currentIndex = seriesArticles.findIndex((a) => a.id === article.id)
  if (currentIndex === -1) return null

  return {
    seriesName: article.series.name,
    seriesSlug: article.series.slug,
    currentOrder: article.series.order,
    totalParts: seriesArticles.length,
    previous: currentIndex > 0 ? seriesArticles[currentIndex - 1] : null,
    next: currentIndex < seriesArticles.length - 1 ? seriesArticles[currentIndex + 1] : null,
  }
}
