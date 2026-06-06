import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ProgressStrip } from './ProgressStrip'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/ProgressStrip',
  component: ProgressStrip,
  argTypes: {
    xpDelta: { control: { type: 'number' } },
    rankDelta: { control: { type: 'number' } },
    fresh: { control: 'boolean' },
  },
  args: {
    windowLabel: 'LAST 6 DAYS',
    xpDelta: 4200,
    rankDelta: 3,
    fresh: true,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProgressStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Climbing: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('SIG annotation reads CLIMBING when xpDelta > 0', async () => {
      await expect(canvas.getByText(/sig: climbing/i)).toBeInTheDocument()
    })
  },
}

export const Drifting: Story = {
  args: { xpDelta: -1300, rankDelta: -2 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('SIG flips to DRIFTING for negative XP delta', async () => {
      await expect(canvas.getByText(/sig: drifting/i)).toBeInTheDocument()
    })
  },
}

export const Holding: Story = { args: { xpDelta: 0, rankDelta: 0 } }
export const Stale: Story = { args: { fresh: false } }
