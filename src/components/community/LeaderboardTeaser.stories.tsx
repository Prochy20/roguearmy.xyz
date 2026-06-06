import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LeaderboardTeaser } from './LeaderboardTeaser'
import { MOCK_LEADERBOARD_TEASER } from './_mock'

const meta = {
  title: 'Components/Community/LeaderboardTeaser',
  component: LeaderboardTeaser,
  args: { content: MOCK_LEADERBOARD_TEASER },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof LeaderboardTeaser>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('CTA links to /leaderboard', async () => {
      const link = canvas.getByRole('link', { name: /view leaderboard/i })
      await expect(link).toHaveAttribute('href', '/leaderboard')
    })
  },
}
