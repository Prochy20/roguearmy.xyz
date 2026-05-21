import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCardList } from './ArticleCardList'
import { MOCK_ARTICLE, MOCK_PROGRESS_IN_PROGRESS } from '@/components/article/_mock'

const meta = {
  title: 'Components/Article/ArticleCardList',
  component: ArticleCardList,
  args: { article: MOCK_ARTICLE, index: 0, isAuthenticated: false },
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
} satisfies Meta<typeof ArticleCardList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('List row renders title and perex', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.perex)).toBeInTheDocument()
    })
  },
}

export const Authenticated: Story = {
  args: { isAuthenticated: true, progress: MOCK_PROGRESS_IN_PROGRESS },
}
