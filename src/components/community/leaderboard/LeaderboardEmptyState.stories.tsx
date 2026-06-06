import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LeaderboardEmptyState } from './LeaderboardEmptyState'

const meta = {
  title: 'Components/Community/Leaderboard/LeaderboardEmptyState',
  component: LeaderboardEmptyState,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof LeaderboardEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Empty state CTA points to Discord (external)', async () => {
      const cta = canvas.getByRole('link', { name: /drop in · claim #01/i })
      await expect(cta).toHaveAttribute('target', '_blank')
    })
  },
}
