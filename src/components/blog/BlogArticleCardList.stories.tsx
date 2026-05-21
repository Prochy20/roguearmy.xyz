import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BlogArticleCardList } from './BlogArticleCardList'
import { MOCK_ARTICLE, MOCK_PROGRESS_IN_PROGRESS } from '@/components/members/_mock'

const meta = {
  title: 'Components/Blog/BlogArticleCardList',
  component: BlogArticleCardList,
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
} satisfies Meta<typeof BlogArticleCardList>

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
