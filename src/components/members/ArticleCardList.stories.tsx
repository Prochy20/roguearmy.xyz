import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleCardList } from './ArticleCardList'
import {
  MOCK_ARTICLE,
  MOCK_ARTICLES,
  MOCK_PROGRESS_COMPLETED,
  MOCK_PROGRESS_IN_PROGRESS,
} from './_mock'

const meta = {
  title: 'Components/Members/ArticleCardList',
  component: ArticleCardList,
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
    await step('Title and perex render in the row', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.article.perex)).toBeInTheDocument()
    })
  },
}

export const Completed: Story = { args: { progress: MOCK_PROGRESS_COMPLETED } }
export const InProgress: Story = { args: { progress: MOCK_PROGRESS_IN_PROGRESS } }

export const Stacked: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 720 }}>
      {MOCK_ARTICLES.map((article, i) => (
        <ArticleCardList
          key={article.id}
          article={article}
          index={i}
          progress={i === 0 ? MOCK_PROGRESS_COMPLETED : i === 1 ? MOCK_PROGRESS_IN_PROGRESS : null}
        />
      ))}
    </div>
  ),
}
