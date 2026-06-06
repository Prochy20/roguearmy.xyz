import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatsTicker } from './StatsTicker'

const meta = {
  title: 'Components/Home/StatsTicker',
  component: StatsTicker,
  parameters: { layout: 'fullscreen' },
  args: { memberCount: 247 },
} satisfies Meta<typeof StatsTicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Stat labels render at least once (ticker duplicates them)', async () => {
      await expect(canvas.getAllByText(/members/i).length).toBeGreaterThan(0)
      await expect(canvas.getAllByText(/years active/i).length).toBeGreaterThan(0)
    })
  },
}
