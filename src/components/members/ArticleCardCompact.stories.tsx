import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCardCompact } from './ArticleCardCompact'
import { MOCK_ARTICLE, MOCK_ARTICLES, MOCK_PROGRESS_IN_PROGRESS } from './_mock'

const meta = {
  title: 'Components/Members/ArticleCardCompact',
  component: ArticleCardCompact,
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
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArticleCardCompact>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Title and topic badge render', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.topic.name)).toBeInTheDocument()
    })
  },
}

export const InProgress: Story = {
  args: { progress: MOCK_PROGRESS_IN_PROGRESS },
}

export const Grid: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
      {MOCK_ARTICLES.map((article, i) => (
        <ArticleCardCompact key={article.id} article={article} index={i} />
      ))}
    </div>
  ),
}
