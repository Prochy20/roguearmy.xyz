import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LoreSection } from './LoreSection'

const meta = {
  title: 'Components/Community/LoreSection',
  component: LoreSection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LoreSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Three value tiles render', async () => {
      await expect(canvas.getByText(/drama-free/i)).toBeInTheDocument()
      await expect(canvas.getByText(/adults with lives/i)).toBeInTheDocument()
      await expect(canvas.getByText(/friendship first/i)).toBeInTheDocument()
    })
  },
}
