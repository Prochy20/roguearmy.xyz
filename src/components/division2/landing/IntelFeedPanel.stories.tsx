import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { IntelFeedPanel } from './IntelFeedPanel'
import { MOCK_CONTENT_ARTICLES, NOW_MS } from '../_mock'

const meta = {
  title: 'Components/Division2/Landing/IntelFeedPanel',
  component: IntelFeedPanel,
  args: { articles: MOCK_CONTENT_ARTICLES, now: NOW_MS, limit: 6 },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IntelFeedPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Each article title appears in the feed', async () => {
      for (const article of MOCK_CONTENT_ARTICLES) {
        await expect(canvas.getByText(article.title)).toBeInTheDocument()
      }
    })
  },
}

export const Empty: Story = {
  args: { articles: [] },
  play: async ({ canvasElement, step }) => {
    await step('Returns null when there are no articles', async () => {
      await expect(canvasElement.firstElementChild?.children.length ?? -1).toBe(0)
    })
  },
}
