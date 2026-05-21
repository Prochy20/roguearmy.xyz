import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { PullStrip } from './PullStrip'

const meta = {
  title: 'Components/Community/PullStrip',
  component: PullStrip,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PullStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Tagline renders inside the section', async () => {
      await expect(canvas.getByText(/beyond random lobbies/i)).toBeInTheDocument()
    })
  },
}
