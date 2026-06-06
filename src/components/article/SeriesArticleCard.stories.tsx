import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SeriesArticleCard } from './SeriesArticleCard'
import { MOCK_ARTICLE, MOCK_ARTICLE_MAGENTA } from '@/components/article/_mock'

const PROGRESS = {
  articleId: MOCK_ARTICLE.id,
  progress: 55,
  completed: false,
  firstVisitedAt: new Date('2026-05-01T08:00:00Z'),
  lastVisitedAt: new Date('2026-05-15T08:00:00Z'),
  timeSpent: 510,
}

const meta = {
  title: 'Components/Article/SeriesArticleCard',
  component: SeriesArticleCard,
  args: { article: MOCK_ARTICLE, order: 1, index: 0, isAuthenticated: false },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeriesArticleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Public: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Order number + title render', async () => {
      await expect(canvas.getByText(String(args.order))).toBeInTheDocument()
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
    })
  },
}

export const InProgress: Story = {
  args: { isAuthenticated: true, progress: PROGRESS },
}

export const MembersOnlyLocked: Story = {
  args: { article: MOCK_ARTICLE_MAGENTA, order: 2 },
}
