import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { CommunityValues } from './CommunityValues'

const meta = {
  title: 'Components/Home/CommunityValues',
  component: CommunityValues,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CommunityValues>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All three value pillars render', async () => {
      await expect(canvas.getByText(/drama-free zone/i)).toBeInTheDocument()
      await expect(canvas.getByText(/adults only/i)).toBeInTheDocument()
      await expect(canvas.getByText(/friendship first/i)).toBeInTheDocument()
    })
  },
}
