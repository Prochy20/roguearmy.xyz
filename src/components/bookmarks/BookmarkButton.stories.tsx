import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BookmarkButton } from './BookmarkButton'
import type {
  BookmarkArticleTarget,
  BookmarkBriefingTarget,
  BookmarkWithTarget,
} from '@/lib/bookmarks'

const mockArticleTarget: BookmarkArticleTarget = {
  id: 'art-1',
  slug: 'demo',
  title: 'Demo Article',
  perex: '',
  heroImage: null,
  topic: null,
  games: [],
  contentType: null,
  readingTime: 5,
  publishedAt: '2026-06-01T00:00:00Z',
}

const mockBriefingTarget: BookmarkBriefingTarget = {
  id: 'brf-uuid-1',
  slug: 'demo-briefing',
  canonicalPath: '/division-2/briefings/demo-briefing-brfuuid1',
  frequency: 'weekly',
  periodStart: '2026-05-25',
  periodEnd: '2026-05-31',
  title: 'Demo Briefing',
  perex: '',
  thumbnailUrl: null,
  articleCount: 0,
}

const bookmarkedArticle: BookmarkWithTarget = {
  id: 'bk-1',
  targetType: 'article',
  target: mockArticleTarget,
  createdAt: '2026-06-01T00:00:00Z',
}

const meta = {
  title: 'Components/Bookmarks/BookmarkButton',
  component: BookmarkButton,
  args: { targetType: 'article', targetId: 'art-1', size: 'sm' },
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof BookmarkButton>

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

/** Provider empty — button shows the un-bookmarked outline icon. */
export const Default: Story = {
  decorators: [withProvider([])],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Defaults to Add bookmark affordance', async () => {
      const button = canvas.getByRole('button', { name: /add bookmark/i })
      await expect(button).toBeInTheDocument()
    })
  },
}

/** Article already bookmarked — fills the icon and switches the aria label. */
export const ArticleBookmarked: Story = {
  decorators: [withProvider([bookmarkedArticle])],
  args: { targetType: 'article', targetId: 'art-1' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders Remove bookmark affordance', async () => {
      await expect(
        canvas.getByRole('button', { name: /remove bookmark/i }),
      ).toBeInTheDocument()
    })
  },
}

/** Briefing target — same component, different discriminator. */
export const Briefing: Story = {
  decorators: [withProvider([])],
  args: { targetType: 'briefing', targetId: mockBriefingTarget.id },
}

/**
 * Bails out (returns nothing) when used outside a BookmarksProvider —
 * preview surfaces don't ship a half-broken affordance.
 */
export const OutsideProvider: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders no button when provider is absent', async () => {
      await expect(canvas.queryByRole('button')).toBeNull()
    })
  },
}
