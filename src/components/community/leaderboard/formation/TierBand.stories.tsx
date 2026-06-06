import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { TierBand } from './TierBand'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/TierBand',
  component: TierBand,
  argTypes: {
    level: { control: { type: 'number', min: 0 } },
    progress: { control: { type: 'number', min: 0, max: 1, step: 0.05 } },
    xpToNextLevel: { control: { type: 'number', min: 0 } },
    nextLevel: { control: { type: 'number' } },
    compact: { control: 'boolean' },
  },
  args: {
    level: 12,
    levelLabel: 'VETERAN',
    progress: 0.64,
    xpToNextLevel: 4800,
    nextLevelLabel: 'ELITE',
    nextLevel: 13,
    compact: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TierBand>

export default meta
type Story = StoryObj<typeof meta>

export const MidTier: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Progress bar exposes aria-valuenow rounded to the percent', async () => {
      const bar = canvas.getByRole('progressbar')
      await expect(bar).toHaveAttribute('aria-valuenow', '64')
    })
  },
}

export const AtCap: Story = {
  args: { progress: 1, xpToNextLevel: null, nextLevel: null, nextLevelLabel: null },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('MAX BAND treatment renders when nextLevel is null', async () => {
      await expect(canvas.getByText(/max band/i)).toBeInTheDocument()
    })
  },
}

export const Compact: Story = { args: { compact: true } }
export const NoLabel: Story = { args: { levelLabel: null, nextLevelLabel: null } }
