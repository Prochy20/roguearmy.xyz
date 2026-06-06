import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatsSection } from './StatsSection'
import { MOCK_STATS_CONTENT, STATS_FAIL_UNAVAILABLE, STATS_OK } from './_mock'

const meta = {
  title: 'Components/Community/StatsSection',
  component: StatsSection,
  args: { stats: STATS_OK, content: MOCK_STATS_CONTENT },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StatsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Four stat cells render with their labels', async () => {
      await expect(canvas.getByText(/operatives/i)).toBeInTheDocument()
      await expect(canvas.getByText(/joined · last 14 days/i)).toBeInTheDocument()
      await expect(canvas.getByText(/minutes in voice/i)).toBeInTheDocument()
      await expect(canvas.getByText(/chat messages/i)).toBeInTheDocument()
    })
  },
}

export const Unavailable: Story = {
  args: { stats: STATS_FAIL_UNAVAILABLE },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Snapshot kicker flips to UNAVAILABLE + FailNote renders', async () => {
      await expect(canvas.getByText(/snapshot unavailable/i)).toBeInTheDocument()
      await expect(canvas.getByText(/upstream unreachable/i)).toBeInTheDocument()
    })
  },
}
