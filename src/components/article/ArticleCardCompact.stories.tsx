import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCardCompact } from './ArticleCardCompact'
import { MOCK_ARTICLE, MOCK_ARTICLE_MAGENTA } from '@/components/article/_mock'

const meta = {
  title: 'Components/Article/ArticleCardCompact',
  component: ArticleCardCompact,
  args: { article: MOCK_ARTICLE, index: 0, isAuthenticated: false },
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
    await step('Title and topic render', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.topic.name)).toBeInTheDocument()
    })
  },
}

export const Locked: Story = { args: { article: MOCK_ARTICLE_MAGENTA } }
