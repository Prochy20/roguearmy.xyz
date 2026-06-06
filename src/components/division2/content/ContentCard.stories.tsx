import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ContentCard } from './ContentCard'
import { MOCK_CONTENT_ARTICLES, NOW_MS } from '../_mock'

const meta = {
  title: 'Components/Division2/Content/ContentCard',
  component: ContentCard,
  args: { article: MOCK_CONTENT_ARTICLES[0], now: NOW_MS },
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
} satisfies Meta<typeof ContentCard>

export default meta
type Story = StoryObj<typeof meta>

export const YouTube: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Card title renders + YouTube label tag', async () => {
      await expect(canvas.getByText(args.article.title)).toBeInTheDocument()
      await expect(canvas.getByText(/youtube/i)).toBeInTheDocument()
    })
  },
}

export const Reddit: Story = { args: { article: MOCK_CONTENT_ARTICLES[1] } }
export const Ubisoft: Story = { args: { article: MOCK_CONTENT_ARTICLES[2] } }
