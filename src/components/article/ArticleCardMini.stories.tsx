import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCardMini } from './ArticleCardMini'
import { MOCK_ARTICLE, MOCK_ARTICLES, MOCK_PROGRESS_COMPLETED } from './_mock'

const meta = {
  title: 'Components/Article/ArticleCardMini',
  component: ArticleCardMini,
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
      <div style={{ maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArticleCardMini>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Title and topic render in the mini card', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.topic.name)).toBeInTheDocument()
    })
  },
}

export const Completed: Story = { args: { progress: MOCK_PROGRESS_COMPLETED } }

export const Row: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
      {MOCK_ARTICLES.map((article, i) => (
        <ArticleCardMini key={article.id} article={article} index={i} />
      ))}
    </div>
  ),
}
