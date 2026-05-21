import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SeriesArticleCard } from './SeriesArticleCard'
import { MOCK_ARTICLE, MOCK_ARTICLE_CYAN } from './_mock'

const PROGRESS_IN_PROGRESS = {
  articleId: MOCK_ARTICLE_CYAN.id,
  progress: 60,
  completed: false,
  firstVisitedAt: new Date('2026-04-28T12:00:00Z'),
  lastVisitedAt: new Date('2026-05-01T12:00:00Z'),
  timeSpent: 420,
}

const PROGRESS_COMPLETED = {
  articleId: MOCK_ARTICLE.id,
  progress: 100,
  completed: true,
  firstVisitedAt: new Date('2026-04-30T12:00:00Z'),
  lastVisitedAt: new Date('2026-05-05T12:00:00Z'),
  timeSpent: 900,
}

const meta = {
  title: 'Components/Members/SeriesArticleCard',
  component: SeriesArticleCard,
  args: {
    article: MOCK_ARTICLE,
    order: 1,
    index: 0,
  },
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

export const Unread: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Order number 1 renders alongside the title', async () => {
      await expect(canvas.getByText('1')).toBeInTheDocument()
      await expect(canvas.getByText(MOCK_ARTICLE.title)).toBeInTheDocument()
    })
  },
}

export const InProgress: Story = {
  args: { article: MOCK_ARTICLE_CYAN, order: 2, progress: PROGRESS_IN_PROGRESS },
}

export const Completed: Story = {
  args: { order: 3, progress: PROGRESS_COMPLETED },
}
