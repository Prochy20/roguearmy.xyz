import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BlogArticleCard } from './BlogArticleCard'
import {
  MOCK_ARTICLE,
  MOCK_ARTICLE_MAGENTA,
  MOCK_PROGRESS_COMPLETED,
  MOCK_PROGRESS_IN_PROGRESS,
} from '@/components/members/_mock'

const meta = {
  title: 'Components/Blog/BlogArticleCard',
  component: BlogArticleCard,
  argTypes: {
    isAuthenticated: { control: 'boolean' },
  },
  args: {
    article: MOCK_ARTICLE,
    index: 0,
    isAuthenticated: false,
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
} satisfies Meta<typeof BlogArticleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Public: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders title and topic badge', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.topic.name)).toBeInTheDocument()
    })
  },
}

export const Authenticated: Story = {
  args: { isAuthenticated: true, progress: MOCK_PROGRESS_COMPLETED },
}

export const MembersOnlyLocked: Story = {
  args: { article: MOCK_ARTICLE_MAGENTA, isAuthenticated: false },
}

export const MembersOnlyUnlocked: Story = {
  args: {
    article: MOCK_ARTICLE_MAGENTA,
    isAuthenticated: true,
    progress: MOCK_PROGRESS_IN_PROGRESS,
  },
}
