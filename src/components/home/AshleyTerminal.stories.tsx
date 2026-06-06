import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { AshleyTerminal } from './AshleyTerminal'

const meta = {
  title: 'Components/Home/AshleyTerminal',
  component: AshleyTerminal,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof AshleyTerminal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Initial ERROR phase renders the glitched headline', async () => {
      // HeroGlitch duplicates the headline into multiple text layers — at least one survives.
      await expect(canvas.queryAllByText(/error/i).length).toBeGreaterThan(0)
    })
  },
}
