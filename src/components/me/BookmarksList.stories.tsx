import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BookmarksList } from './BookmarksList'
import type {
  BookmarkArticleTarget,
  BookmarkBriefingTarget,
  BookmarkWithTarget,
} from '@/lib/bookmarks'

// ─── Mock bookmark fixtures ─────────────────────────────────────────────
// Stories drive BookmarksProvider directly via `initialBookmarks` so no
// network or context-wiring is needed.

const baseArticleTarget: BookmarkArticleTarget = {
  id: 'art-1',
  slug: 'tactical-loadout-2024',
  title: 'TACTICAL LOADOUT — Q4 PRIMER',
  perex:
    'A field-tested loadout breakdown for the Q4 meta. Mods, builds, and the trade-offs the wiki forgot to mention.',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800',
    alt: 'loadout',
  },
  topic: { id: 't1', slug: 'guides', name: 'Guides', color: 'green' },
  games: [{ id: 'g1', name: 'Division 2', color: 'orange' }],
  contentType: { id: 'ct1', slug: 'guide', name: 'Guide' },
  readingTime: 7,
  publishedAt: '2026-05-22T10:00:00Z',
  visibility: 'members_only',
}

const baseBriefingTarget: BookmarkBriefingTarget = {
  id: 'brf-uuid-1',
  slug: 'washington-briefing-wk22',
  canonicalPath: '/division-2/briefings/washington-briefing-wk22-brfuuid1',
  frequency: 'weekly',
  periodStart: '2026-05-25',
  periodEnd: '2026-05-31',
  title: 'WASHINGTON BRIEFING — WK22 ROLL-UP',
  perex: 'Patch wishlist, season prep, and the rifle-meta question that won’t die.',
  thumbnailUrl: null,
  articleCount: 12,
}

const articleBookmark: BookmarkWithTarget = {
  id: 'bk-1',
  targetType: 'article',
  target: baseArticleTarget,
  createdAt: '2026-06-03T12:00:00Z',
}

const briefingBookmark: BookmarkWithTarget = {
  id: 'bk-2',
  targetType: 'briefing',
  target: baseBriefingTarget,
  locked: false,
  createdAt: '2026-06-04T09:00:00Z',
}

const lockedBriefingBookmark: BookmarkWithTarget = {
  id: 'bk-3',
  targetType: 'briefing',
  target: { ...baseBriefingTarget, id: 'brf-uuid-2', frequency: 'daily' },
  locked: true,
  createdAt: '2026-06-05T08:00:00Z',
}

// ─── Meta ────────────────────────────────────────────────────────────────

const meta = {
  title: 'Components/Me/BookmarksList',
  component: BookmarksList,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof BookmarksList>

export default meta
type Story = StoryObj<typeof meta>

function withProvider(initial: BookmarkWithTarget[]) {
  const ProviderDecorator = (StoryFn: React.ComponentType) => (
    <BookmarksProvider initialBookmarks={initial}>
      <StoryFn />
    </BookmarksProvider>
  )
  ProviderDecorator.displayName = 'WithBookmarksProvider'
  return ProviderDecorator
}

// ─── Stories ─────────────────────────────────────────────────────────────

export const Default: Story = {
  decorators: [withProvider([articleBookmark, briefingBookmark])],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both an article and a briefing are listed', async () => {
      await expect(canvas.getByText(baseArticleTarget.title)).toBeInTheDocument()
      await expect(canvas.getByText(baseBriefingTarget.title)).toBeInTheDocument()
    })
  },
}

export const Empty: Story = {
  decorators: [withProvider([])],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Empty state copy appears', async () => {
      await expect(canvas.getByText(/vault empty/i)).toBeInTheDocument()
    })
  },
}

/**
 * Member bookmarked a daily briefing while a booster, then lost the role.
 * The card stays in the list with a lock overlay + LOST BOOSTER ACCESS
 * caption. No CTA — the link still navigates to the BOOSTER_REQUIRED dossier.
 */
export const WithLockedBriefing: Story = {
  decorators: [withProvider([articleBookmark, lockedBriefingBookmark])],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Locked overlay surfaces the lost-access caption', async () => {
      await expect(canvas.getByText(/lost booster access/i)).toBeInTheDocument()
    })
  },
}
