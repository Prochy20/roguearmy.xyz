import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCard } from './ArticleCard'
import {
  MOCK_ARTICLE,
  MOCK_ARTICLES,
  MOCK_PROGRESS_COMPLETED,
  MOCK_PROGRESS_IN_PROGRESS,
} from './_mock'

const meta = {
  title: 'Components/Members/ArticleCard',
  component: ArticleCard,
  args: {
    article: MOCK_ARTICLE,
    index: 0,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArticleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders title, topic badge and reading time', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.topic.name)).toBeInTheDocument()
      await expect(canvas.getByText(/min read/i)).toBeInTheDocument()
    })
  },
}

export const InProgress: Story = {
  args: { article: MOCK_ARTICLES[1], progress: MOCK_PROGRESS_IN_PROGRESS },
}

export const Completed: Story = {
  args: { progress: MOCK_PROGRESS_COMPLETED },
}

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
      {MOCK_ARTICLES.map((article, i) => (
        <ArticleCard
          key={article.id}
          article={article}
          index={i}
          progress={i === 0 ? MOCK_PROGRESS_COMPLETED : i === 1 ? MOCK_PROGRESS_IN_PROGRESS : null}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All 3 article titles render', async () => {
      for (const article of MOCK_ARTICLES) {
        await expect(canvas.getByText(article.title)).toBeInTheDocument()
      }
    })
  },
}
